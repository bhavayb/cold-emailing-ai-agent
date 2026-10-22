import json
from google import genai
from tavily import TavilyClient
from config.settings import GEMINI_API_KEY, TAVILY_API_KEY

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

# Each model has its own separate free-tier quota bucket!
FREE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemma-4-31b-it",
    "gemini-3.8-flash",
]


def ask_gemini_json(prompt: str) -> dict:
    """Tries free Gemini models in order so quota limits on one model don't stop you."""
    full_prompt = f"{prompt}\n\nReturn ONLY valid JSON. Do not use markdown ```json blocks."

    last_error = None
    for model_name in FREE_MODELS:
        try:
            interaction = gemini_client.interactions.create(
                model=model_name,
                input=full_prompt,
            )
            text = (interaction.output_text or "").strip()

            if text.startswith("```"):
                text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

            return json.loads(text)

        except Exception as e:
            print(f"   [LLM] ⚠️ {model_name} unavailable/quota hit, trying next model...", flush=True)
            last_error = e

    raise RuntimeError(f"All free models hit quota. Last error: {last_error}")


def search_web(query: str, max_results: int = 5) -> str:
    """Searches Google/LinkedIn using Tavily and returns a simple text summary."""
    response = tavily_client.search(query=query, max_results=max_results)
    results = response.get("results", [])

    formatted = []
    for item in results:
        formatted.append(
            f"Title: {item.get('title')}\nURL: {item.get('url')}\nContent: {item.get('content')}\n"
        )

    return "\n---\n".join(formatted)

import requests
from bs4 import BeautifulSoup


def fetch_job_page_text(url: str) -> str:
    """Fetches the exact title, meta description, and text from a job URL (LinkedIn, Naukri, Workday, etc.)."""
    scraped_parts = []

    # 1. Try direct HTML title & meta description (works great on public LinkedIn job links!)
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            )
        }
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")

        if soup.title and soup.title.string:
            scraped_parts.append(f"Page Title: {soup.title.string.strip()}")

        for meta in soup.find_all("meta"):
            if meta.get("name") in ["description", "og:title", "og:description"] or meta.get("property") in ["og:title", "og:description"]:
                content = meta.get("content", "").strip()
                if content:
                    scraped_parts.append(f"Meta Info: {content}")

        body_text = soup.get_text(separator=" ", strip=True)
        if body_text:
            scraped_parts.append(f"Page Body: {body_text[:4000]}")
    except Exception as e:
        print(f"   [SCRAPER] Direct fetch note: {e}", flush=True)

    # 2. Also run Tavily search on the URL + keywords as backup
    try:
        tavily_text = search_web(url, max_results=3)
        if tavily_text:
            scraped_parts.append(f"Search Info:\n{tavily_text}")
    except Exception:
        pass

    return "\n\n".join(scraped_parts)