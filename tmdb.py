import os
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
# GET MOVIE DETAILS
# ==========================================

def get_movie_details(tmdb_id):

    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"

    params = {
        "language": "en-US"
    }

    response = session.get(
        url,
        params=params,
        timeout=30
    )

    response.raise_for_status()

    return response.json()


# ==========================================
# GET POSTER URL
# ==========================================

def get_poster_url(poster_path):

    if not poster_path:
        return None

    return (
        "https://image.tmdb.org/t/p/w500"
        + poster_path
    )


# ==========================================
# GET BACKDROP URL
# ==========================================

def get_backdrop_url(backdrop_path):

    if not backdrop_path:
        return None

    return (
        "https://image.tmdb.org/t/p/w1280"
        + backdrop_path
    )