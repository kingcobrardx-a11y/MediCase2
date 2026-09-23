"""Central LLM integration service layer for MediCase.

Handles LLM communication (Google Gemini via google-genai SDK or REST API),
JSON schema validation, and automatic seamless fallback to intelligent clinical
heuristics when offline or without an API key.
"""

import json
import logging
import re
from typing import Any, Callable, Dict, Optional

from app.config import settings

logger = logging.getLogger("medicase.ai_service")


class AIService:
    """Central service managing LLM interactions and clinical fallback logic."""

    def __init__(self):
        self.api_key: str = settings.GEMINI_API_KEY.strip()
        self.provider: str = settings.LLM_PROVIDER.lower()
        self.model_name: str = settings.GEMINI_MODEL
        self._client = None
        self._initialize_client()

    def _initialize_client(self) -> None:
        """Initializes the Google GenAI client if credentials are configured."""
        if not self.api_key or self.provider == "mock":
            logger.info("AIService initialized in HEURISTIC/MOCK mode (no GEMINI_API_KEY provided).")
            return

        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
            logger.info(f"Google GenAI client initialized with model: {self.model_name}")
        except ImportError:
            logger.warning(
                "google-genai package not found. AIService will use direct HTTP or fallback heuristics."
            )
            self._client = None
        except Exception as e:
            logger.error(f"Failed to initialize GenAI client: {e}")
            self._client = None

    def is_live_llm_available(self) -> bool:
        """Returns True if live LLM calling is enabled and configured."""
        return bool(self.api_key and self.provider != "mock")

    def _extract_json_from_text(self, text: str) -> Dict[str, Any]:
        """Robustly extracts and parses JSON from raw LLM output, handling markdown blocks."""
        if not text:
            raise ValueError("Empty response from LLM.")

        cleaned = text.strip()
        # Handle markdown code blocks ```json ... ``` or ``` ... ```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if match:
            cleaned = match.group(1).strip()

        # If there are braces, slice from first { to last }
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            cleaned = cleaned[start_idx : end_idx + 1]

        return json.loads(cleaned)

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_fn: Optional[Callable[[], Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Invokes the LLM to generate structured JSON.

        If the LLM call fails, times out, or is not configured, invokes fallback_fn
        to ensure zero downtime and strict adherence to MediCase clinical standards.
        """
        # 1. If not configured for live LLM, immediately use fallback
        if not self.is_live_llm_available():
            if fallback_fn:
                return fallback_fn()
            raise RuntimeError("LLM is not configured and no fallback handler provided.")

        # 2. Attempt call using google-genai SDK
        if self._client is not None:
            try:
                from google.genai import types

                combined_contents = f"System Instructions:\n{system_prompt}\n\nUser Request:\n{user_prompt}"
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=combined_contents,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json",
                    ),
                )

                if response and response.text:
                    parsed = self._extract_json_from_text(response.text)
                    return parsed

            except Exception as exc:
                logger.warning(
                    f"Live GenAI SDK call failed: {exc}. Activating clinical heuristic fallback."
                )

        # 3. Attempt direct HTTP call via httpx as secondary live path
        try:
            import httpx

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_prompt}\n\n{user_prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json",
                },
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "")
                            return self._extract_json_from_text(raw_text)
                else:
                    logger.warning(
                        f"Direct Gemini REST API returned status {res.status_code}: {res.text}"
                    )

        except Exception as exc:
            logger.warning(f"Direct Gemini REST call failed: {exc}")

        # 4. Graceful degradation to clinical heuristic fallback
        if fallback_fn:
            logger.info("Returning clinical heuristic fallback response.")
            return fallback_fn()

        raise RuntimeError("LLM request failed and no fallback handler available.")


# Global singleton instance
ai_service = AIService()
