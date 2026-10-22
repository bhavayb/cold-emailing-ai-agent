import io
from fastapi import APIRouter, UploadFile, File
from pypdf import PdfReader
from config.llm import ask_gemini_json
from config.storage import load_dossier, save_dossier

router = APIRouter(prefix="/api/resume", tags=["Resume"])

# Load saved dossier from backend/data/dossier.json on startup
CURRENT_DOSSIER = load_dossier()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    reader = PdfReader(io.BytesIO(pdf_bytes))
    resume_text = "\n".join(page.extract_text() or "" for page in reader.pages)

    prompt = f"""
    Extract a structured Candidate Dossier from this resume:
    {resume_text[:10000]}

    Return JSON with this exact format:
    {{
        "full_name": "Candidate Name",
        "headline": "Current Role / Title",
        "signature_hook": "1 punchy sentence summarizing their strongest achievement",
        "impact_metrics": [
            {{
                "badge": "+40% Faster API",
                "statement": "Short 1-sentence proof point from the resume"
            }},
            {{
                "badge": "Scaled to 100k Users",
                "statement": "Second 1-sentence proof point with numbers"
            }},
            {{
                "badge": "3x Pipeline Speed",
                "statement": "Third 1-sentence proof point with numbers"
            }}
        ],
        "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
    }}
    """

    dossier = ask_gemini_json(prompt)
    CURRENT_DOSSIER.clear()
    CURRENT_DOSSIER.update(dossier)

    # Save to backend/data/dossier.json
    save_dossier(CURRENT_DOSSIER)

    return {
        "filename": file.filename,
        "dossier": CURRENT_DOSSIER,
    }


@router.get("")
def get_resume_dossier():
    return {"dossier": CURRENT_DOSSIER}


@router.put("")
def update_resume_dossier(updated_dossier: dict):
    """Saves any manual edits made by the user on the Resume Dossier page."""
    CURRENT_DOSSIER.clear()
    CURRENT_DOSSIER.update(updated_dossier)
    save_dossier(CURRENT_DOSSIER)
    return {"status": "saved", "dossier": CURRENT_DOSSIER}