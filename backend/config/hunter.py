import requests
from config.settings import HUNTER_API_KEY


def find_verified_email(full_name: str, domain: str) -> dict:
    """
    Calls Hunter.io Email Finder API to get a verified work email.
    Returns: {"email": str or None, "status": "verified" | "predicted"}
    """
    if not HUNTER_API_KEY or not full_name or not domain:
        return {"email": None, "status": "predicted"}

    try:
        response = requests.get(
            "https://api.hunter.io/v2/email-finder",
            params={
                "domain": domain,
                "full_name": full_name,
                "api_key": HUNTER_API_KEY,
            },
            timeout=10,
        )
        data = response.json().get("data", {})
        found_email = data.get("email")

        if found_email:
            print(f"   [HUNTER.IO] 🎯 Verified email found: {found_email}", flush=True)
            return {
                "email": found_email,
                "status": "verified",
            }
    except Exception as e:
        print(f"   [HUNTER.IO] ⚠️ Lookup skipped: {e}", flush=True)

    return {"email": None, "status": "predicted"}