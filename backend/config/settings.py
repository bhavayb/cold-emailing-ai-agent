import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GEMINI_MODEL = "gemini-3.8-flash"
HUNTER_API_KEY = (os.getenv("HUNTER_API_KEY") or "").strip().strip('"').strip("'")
SENDER_EMAIL = (os.getenv("SENDER_EMAIL") or "").strip().strip('"').strip("'")
SENDER_APP_PASSWORD = (os.getenv("SENDER_APP_PASSWORD") or "").strip().strip('"').strip("'")