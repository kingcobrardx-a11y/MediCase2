# MediCase — AI Integration Module (`ai-service`)

> **Patient Case-Taking Care System**  
> *Smart India Hackathon (SIH) Project*

The **MediCase AI Service** is an independent, specialized microservice designed to assist clinical staff and physicians during patient intake. It coordinates patient history taking, generates context-aware follow-up questions, summarizes complaints without hallucination, and screens for clinical red flags.

---

## ⚠️ Strict Clinical Guardrails

1. **AI is NOT a Doctor**: The system strictly **never** diagnoses illnesses (e.g., cannot state *"You have a heart attack"* or *"Diagnosis is migraine"*).
2. **No Prescriptions**: The AI strictly **never** prescribes, modifies, or recommends medications or dosages.
3. **Doctor in Control**: All outputs (summaries, red flags, questions) are delivered as decision-support data for the attending licensed physician.
4. **No Hallucination**: The case summary strictly uses only patient-reported information.
5. **Decoupled Architecture**: This service is completely decoupled from PostgreSQL and other internal database layers; communication occurs purely via REST HTTP APIs.

---

## 📁 Folder Structure

```
ai-service/
│
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI server, endpoints, and CORS
│   ├── config.py                 # Pydantic settings & environment configuration
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py         # Central LLM client (Gemini/OpenAI + fallback)
│   │   ├── followup_service.py   # Adaptive follow-up question logic
│   │   ├── summary_service.py    # Factual case summary generation
│   │   └── redflag_service.py    # Non-diagnostic red flag detection
│   │
│   ├── prompts/
│   │   ├── __init__.py
│   │   ├── followup_prompt.py    # SOCRATES/OPQRST clinical prompt templates
│   │   ├── summary_prompt.py     # Anti-hallucination summary prompts
│   │   └── redflag_prompt.py     # Cautious triage red flag prompts
│   │
│   └── schemas/
│       ├── __init__.py
│       └── ai_schemas.py         # Pydantic request/response validation models
│
├── tests/
│   ├── __init__.py
│   └── test_api.py               # Comprehensive pytest test suite
│
├── requirements.txt              # Production and testing dependencies
├── .env.example                  # Environment configuration template
├── .env                          # Local environment settings (ignored in git)
├── .gitignore                    # Python git ignore rules
└── README.md                     # Service documentation (this file)
```

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Python 3.10+ (or Python 3.13)
- Pip

### 2. Environment Setup

```bash
# Clone and enter the ai-service directory
cd ai-service

# (Optional but recommended) Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (cmd):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure `.env`

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to set your credentials:

```env
# Google AI Studio API Key (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# LLM Provider ('gemini' or 'mock')
LLM_PROVIDER=gemini

# Model name
GEMINI_MODEL=gemini-2.5-flash

# Server network settings
HOST=0.0.0.0
PORT=8001
DEBUG=True
```

> [!NOTE]
> **Resilient Heuristic Fallback**: If no `GEMINI_API_KEY` is provided, the service automatically runs in high-fidelity clinical heuristic mode. All endpoints will return dynamic, medically sound, and context-aware responses matching the exact JSON schemas. Teammates can run and test the service immediately without needing an API key.

### 4. Run the Service

```bash
# Start with Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Interactive Swagger documentation will be available at:  
👉 **http://localhost:8001/docs**  
ReDoc is available at:  
👉 **http://localhost:8001/redoc**

---

## 🔌 API Endpoints Reference

### 1. Adaptive Follow-Up Questions
Generates tailored, context-specific questions based on clinical frameworks (SOCRATES/OPQRST).

- **Method**: `POST`
- **Path**: `/ai/follow-up`

#### Request Body
```json
{
    "chief_complaint": "Headache",
    "symptoms": ["headache", "nausea"],
    "duration": "2 days",
    "severity": 7,
    "medical_history": [],
    "medications": [],
    "language": "en"
}
```

#### Response (200 OK)
```json
{
    "questions": [
        "Where exactly is the headache located (e.g., forehead, one side, back of head)?",
        "How would you rate the severity of the headache right now from 1 to 10?",
        "Do you experience increased sensitivity to light or sound?",
        "Have you experienced any vomiting or dizziness?",
        "Did this headache start suddenly ('like a thunderclap') or develop gradually?",
        "Have you had similar headaches or migraine episodes in the past?"
    ]
}
```

*Note: Pass `"language": "hi"` for Hindi questions.*

---

### 2. Structured Case Summary
Produces a factual clinical summary strictly synthesized from patient inputs without inventing facts.

- **Method**: `POST`
- **Path**: `/ai/summary`

#### Request Body
```json
{
    "chief_complaint": "Headache",
    "symptoms": ["headache", "nausea"],
    "duration": "2 days",
    "severity": 7,
    "answers": {
        "location": "Right side",
        "vomiting": "No",
        "light_sensitivity": "Yes"
    },
    "medical_history": [],
    "medications": []
}
```

#### Response (200 OK)
```json
{
    "summary": "Patient presents with right side headache for 2 days with reported severity of 7/10. Associated symptoms include: light sensitivity. Patient denies: vomiting.",
    "key_symptoms": [
        "headache",
        "light sensitivity",
        "nausea"
    ],
    "duration": "2 days",
    "severity": 7,
    "disclaimer": "Assistive case summary prepared for doctor review. AI is not a doctor and does not diagnose or prescribe."
}
```

---

### 3. Red Flag Detection
Screens for clinical emergency indicators and urgent danger signs using cautious triage language.

- **Method**: `POST`
- **Path**: `/ai/red-flags`

#### Request Body
```json
{
    "chief_complaint": "Chest pain",
    "symptoms": [
        "chest pain",
        "breathing difficulty"
    ],
    "duration": "30 minutes",
    "severity": 8
}
```

#### Response (200 OK)
```json
{
    "red_flags": [
        {
            "flag": "Breathing difficulty",
            "severity": "high",
            "reason": "Patient reported difficulty breathing. Requires urgent clinical assessment.",
            "requires_doctor_review": true
        },
        {
            "flag": "Acute chest discomfort",
            "severity": "critical",
            "reason": "Potential red flag identified: acute chest discomfort and elevated pain score. Requires urgent doctor review.",
            "requires_doctor_review": true
        }
    ],
    "requires_doctor_review": true
}
```

---

### 4. Combined Case Assessment
Coordinates follow-up generation, summarization, and red-flag screening in a single call.

- **Method**: `POST`
- **Path**: `/ai/analyze-case`

#### Request Body
```json
{
    "chief_complaint": "Chest pain",
    "symptoms": ["chest pain", "breathing difficulty"],
    "duration": "45 minutes",
    "severity": 8,
    "answers": {
        "radiation": "Left arm",
        "sweating": "Yes"
    }
}
```

#### Response (200 OK)
Returns `{ "follow_up_questions": [...], "summary": {...}, "red_flags": {...} }`.

---

### 5. Health Check
- **Method**: `GET`
- **Path**: `/health`

```json
{
    "status": "healthy",
    "live_llm_active": false,
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "version": "1.0.0"
}
```

---

## 🧪 Running Tests

Execute the automated test suite with `pytest`:

```bash
pytest tests/ -v
```

---

## 👥 Collaboration & Integration Notes

- **Backend Integration**: The main MediCase backend can call this service using standard HTTP clients (`httpx`, `requests`, `axios`, etc.) targeting `http://localhost:8001/ai/...`.
- **Frontend Direct Access**: CORS is enabled for all standard frontend development ports (`3000`, `5173`, `5174`), allowing frontend testing if desired.
- **Git Compliance**: The `.env` file is excluded from git tracking via `.gitignore`. Always use `.env.example` as the team template.
