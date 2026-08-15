import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv


# ==========================================
# LOAD .ENV
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)


# ==========================================
# GET TMDB TOKEN
# ==========================================

TMDB_API_TOKEN = os.getenv("TMDB_API_TOKEN")

if not TMDB_API_TOKEN:
    raise ValueError(
        "TMDB_API_TOKEN was not found in the .env file."
    )


# ==========================================
# TMDB SETTINGS
# ==========================================

TMDB_BASE_URL = "https://api.themoviedb.org/3"


# ==========================================
# CREATE SESSION
# ==========================================

session = requests.Session()

session.headers.update({
    "Authorization": f"Bearer {TMDB_API_TOKEN}",
    "accept": "application/json"
})


# ==========================================
# HELPER SAFE REQUEST
# ==========================================

def safe_get(url, params=None):
    for attempt in range(3):
        try:
            response = session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
        except Exception:
            time.sleep(0.5)
    return {}


import re

# ==========================================
# TYPO CLEANING & FUZZY SANITIZER
# ==========================================

def clean_typos(title):
    if not title:
        return ""
    # Collapse 3+ repeated letters (e.g., "sex educationnn" -> "sex education", "interstellarrr" -> "interstellar")
    s = re.sub(r'(.)\1{2,}', r'\1', title)
    # Collapse 2 repeated letters at end of title if word ends with repeated char
    s2 = re.sub(r'([a-zA-Z])\1+$', r'\1', s)
    return s2.strip()


# ==========================================
# SEARCH TMDB MOVIE / SHOW BY TITLE (WITH TYPO CORRECTION)
# ==========================================

def search_tmdb_movie(title):
    if not title:
        return None

    # Try raw search first
    url_movie = f"{TMDB_BASE_URL}/search/movie"
    params = {"query": title, "language": "en-US", "include_adult": False}
    data = safe_get(url_movie, params)
    results = data.get("results", [])
    if results:
        return results[0]

    # Try cleaned query (typo auto-correction)
    cleaned = clean_typos(title)
    if cleaned and cleaned.lower() != title.lower():
        data_clean = safe_get(url_movie, {"query": cleaned, "language": "en-US", "include_adult": False})
        results_clean = data_clean.get("results", [])
        if results_clean:
            item = results_clean[0]
            item["auto_corrected_from"] = title
            item["corrected_query"] = cleaned
            return item

    # Try multi search (for shows like Sex Education or movies with alternative naming)
    url_multi = f"{TMDB_BASE_URL}/search/multi"
    for q in [title, cleaned]:
        if not q:
            continue
        data_multi = safe_get(url_multi, {"query": q, "language": "en-US", "include_adult": False})
        multi_results = [r for r in data_multi.get("results", []) if r.get("media_type") in ["movie", "tv"]]
        if multi_results:
            item = multi_results[0]
            # Standardize title for TV series
            if "name" in item and "title" not in item:
                item["title"] = item["name"]
            if q.lower() != title.lower():
                item["auto_corrected_from"] = title
                item["corrected_query"] = q
            return item

    return None



# ==========================================
# GET MOVIE DETAILS
# ==========================================

def get_movie_details(tmdb_id):
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    params = {
        "language": "en-US"
    }
    return safe_get(url, params)


# ==========================================
# GET TMDB RECOMMENDATIONS
# ==========================================

def get_tmdb_recommendations(tmdb_id):
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}/recommendations"
    params = {
        "language": "en-US",
        "page": 1
    }
    data = safe_get(url, params)
    return data.get("results", [])


# ==========================================
# GET TMDB SIMILAR
# ==========================================

def get_tmdb_similar(tmdb_id):
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}/similar"
    params = {
        "language": "en-US",
        "page": 1
    }
    data = safe_get(url, params)
    return data.get("results", [])


# ==========================================
# GET POSTER URL
# ==========================================

def get_poster_url(poster_path):
    if not poster_path:
        return None
    return f"https://image.tmdb.org/t/p/w500{poster_path}"


# ==========================================
# GET BACKDROP URL
# ==========================================

def get_backdrop_url(backdrop_path):
    if not backdrop_path:
        return None
    return f"https://image.tmdb.org/t/p/w1280{backdrop_path}"