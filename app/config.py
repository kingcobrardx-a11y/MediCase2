"""Configuration management for MediCase AI Service.

Loads configuration from environment variables or .env file.
"""

import os
from typing import List
from dotenv import load_dotenv

# Pre-load .env into environment
load_dotenv()

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        GEMINI_API_KEY: str = ""
        LLM_PROVIDER: str = "gemini"  # "gemini" or "mock"
        GEMINI_MODEL: str = "gemini-2.5-flash"
        HOST: str = "0.0.0.0"
        PORT: int = 8001
        DEBUG: bool = True
        ALLOWED_ORIGINS: str = "*"

        model_config = {
            "env_file": ".env",
            "env_file_encoding": "utf-8",
            "extra": "ignore",
        }

        @property
        def origins_list(self) -> List[str]:
            if self.ALLOWED_ORIGINS == "*":
                return ["*"]
            return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    settings = Settings()

except Exception:
    # Fallback if pydantic_settings is not installed yet
    class FallbackSettings:
        def __init__(self):
            self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
            self.LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
            self.GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            self.HOST = os.getenv("HOST", "0.0.0.0")
            self.PORT = int(os.getenv("PORT", "8001"))
            self.DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
            self.ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

        @property
        def origins_list(self) -> List[str]:
            if self.ALLOWED_ORIGINS == "*":
                return ["*"]
            return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    settings = FallbackSettings()
