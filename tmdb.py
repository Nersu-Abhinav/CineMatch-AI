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

    def pick_best(results_list):
        if not results_list:
            return None
        # Rank by combination of vote count and popularity to select genuine blockbuster matches
        return sorted(results_list, key=lambda x: (x.get("vote_count", 0) * x.get("popularity", 0)), reverse=True)[0]

    # Try raw search first
    url_movie = f"{TMDB_BASE_URL}/search/movie"
    params = {"query": title, "language": "en-US", "include_adult": False}
    data = safe_get(url_movie, params)
    results = data.get("results", [])
    if results:
        return pick_best(results)

    # Try cleaned query (typo auto-correction)
    cleaned = clean_typos(title)
    if cleaned and cleaned.lower() != title.lower():
        data_clean = safe_get(url_movie, {"query": cleaned, "language": "en-US", "include_adult": False})
        results_clean = data_clean.get("results", [])
        if results_clean:
            item = pick_best(results_clean)
            if item:
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
            item = pick_best(multi_results)
            if item:
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
# GET TMDB RECOMMENDATIONS (WITH SMART REGIONAL DISCOVERY)
# ==========================================

def get_tmdb_recommendations(tmdb_id):
    if not tmdb_id:
        return []

    # 1. Fetch movie details with credits
    url_details = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    details = safe_get(url_details, {"append_to_response": "credits,keywords", "language": "en-US"})
    
    orig_lang = details.get("original_language", "en")
    genres = [g["id"] for g in details.get("genres", [])]
    cast = details.get("credits", {}).get("cast", [])
    top_actor_id = cast[0]["id"] if cast else None

    # 2. Try raw TMDB recommendations
    url_recs = f"{TMDB_BASE_URL}/movie/{tmdb_id}/recommendations"
    raw_recs = safe_get(url_recs, {"language": "en-US", "page": 1}).get("results", [])

    # Filter raw recommendations for non-English/regional movies
    filtered_recs = []
    regional_langs = ["te", "hi", "ta", "kn", "ml", "ja", "ko"]
    if orig_lang in regional_langs or orig_lang != "en":
        filtered_recs = [r for r in raw_recs if r.get("original_language") == orig_lang or r.get("original_language") in regional_langs]
    else:
        filtered_recs = raw_recs

    # 3. If filtered recs are fewer than 8, use Smart Discover with actor & language matching!
    if len(filtered_recs) < 8 and (orig_lang in regional_langs or orig_lang != "en"):
        url_discover = f"{TMDB_BASE_URL}/discover/movie"
        discover_results = list(filtered_recs)
        existing_ids = {r["id"] for r in discover_results}
        existing_ids.add(tmdb_id)

        # Discover A: Same top actor (e.g. Allu Arjun, Prabhas, Ram Charan)
        if top_actor_id:
            params_actor = {
                "with_cast": top_actor_id,
                "sort_by": "popularity.desc",
                "language": "en-US"
            }
            res_actor = safe_get(url_discover, params_actor).get("results", [])
            for r in res_actor:
                if r["id"] not in existing_ids:
                    discover_results.append(r)
                    existing_ids.add(r["id"])

        # Discover B: Same original language & top genres
        if len(discover_results) < 10 and genres:
            params_lang = {
                "with_original_language": orig_lang,
                "with_genres": ",".join([str(g) for g in genres[:2]]),
                "sort_by": "popularity.desc",
                "language": "en-US"
            }
            res_lang = safe_get(url_discover, params_lang).get("results", [])
            for r in res_lang:
                if r["id"] not in existing_ids:
                    discover_results.append(r)
                    existing_ids.add(r["id"])

        return discover_results

    return raw_recs


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