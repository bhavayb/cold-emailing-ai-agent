import json
from pathlib import Path

# Points to backend/data/
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

DOSSIER_FILE = DATA_DIR / "dossier.json"
CAMPAIGNS_FILE = DATA_DIR / "campaigns.json"


def load_dossier() -> dict:
    """Loads saved resume dossier from disk."""
    if DOSSIER_FILE.exists():
        return json.loads(DOSSIER_FILE.read_text(encoding="utf-8"))
    return {}


def save_dossier(dossier: dict) -> None:
    """Saves resume dossier to disk."""
    DOSSIER_FILE.write_text(json.dumps(dossier, indent=2), encoding="utf-8")


def load_campaigns() -> list:
    """Loads all saved campaigns from disk."""
    if CAMPAIGNS_FILE.exists():
        return json.loads(CAMPAIGNS_FILE.read_text(encoding="utf-8"))
    return []


def save_campaigns(campaigns: list) -> None:
    """Saves all campaigns to disk."""
    CAMPAIGNS_FILE.write_text(json.dumps(campaigns, indent=2), encoding="utf-8")