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


# ==========================================
# SEARCH TMDB MOVIE BY TITLE
# ==========================================

def search_tmdb_movie(title):
    url = f"{TMDB_BASE_URL}/search/movie"
    params = {
        "query": title,
        "language": "en-US",
        "include_adult": False
    }
    data = safe_get(url, params)
    results = data.get("results", [])
    if results:
        return results[0]
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