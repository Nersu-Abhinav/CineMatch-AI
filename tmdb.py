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
# ==========================================
# GET TMDB RECOMMENDATIONS (10-FACTOR ALGORITHMIC ENGINE)
# ==========================================

def get_tmdb_recommendations(tmdb_id, count=30):

    if not tmdb_id:
        return []

    # 1. Fetch movie details with credits & keywords
    url_details = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    details = safe_get(url_details, {"append_to_response": "credits,keywords", "language": "en-US"})
    if not details:
        return []

    orig_lang = details.get("original_language", "en")
    genres = [g["id"] for g in details.get("genres", [])]
    cast = details.get("credits", {}).get("cast", [])
    crew = details.get("credits", {}).get("crew", [])
    
    directors = [c["id"] for c in crew if c.get("job") == "Director"]
    top_actor_id = cast[0]["id"] if cast else None
    director_id = directors[0] if directors else None

    candidate_map = {} # tmdb_id -> candidate_dict

    def add_candidate(m_obj, weight, reason):
        if not m_obj or "id" not in m_obj:
            return
        cid = m_obj["id"]
        if cid == tmdb_id:
            return
        if cid not in candidate_map:
            candidate_map[cid] = {"obj": m_obj, "score": weight, "reasons": [reason]}
        else:
            candidate_map[cid]["score"] += weight
            if reason not in candidate_map[cid]["reasons"]:
                candidate_map[cid]["reasons"].append(reason)

    url_discover = f"{TMDB_BASE_URL}/discover/movie"

    # Factor 1: Belongs to Collection / Franchise (Weight +50)
    if details.get("belongs_to_collection"):
        coll_id = details["belongs_to_collection"]["id"]
        coll_details = safe_get(f"{TMDB_BASE_URL}/collection/{coll_id}", {"language": "en-US"})
        for part in coll_details.get("parts", []):
            add_candidate(part, 50, "Franchise Sequel")

    # Factor 2: Same Director (Weight +40)
    if director_id:
        res_dir = safe_get(url_discover, {"with_crew": director_id, "sort_by": "popularity.desc", "language": "en-US"}).get("results", [])
        for r in res_dir:
            add_candidate(r, 40, "Same Director")

    # Factor 3: Same Lead Actor (Weight +30)
    if top_actor_id:
        res_act = safe_get(url_discover, {"with_cast": top_actor_id, "sort_by": "popularity.desc", "language": "en-US"}).get("results", [])
        for r in res_act:
            add_candidate(r, 30, "Same Lead Actor")

    # Factor 4: Same Language + Genres (Weight +20)
    if orig_lang and genres:
        params_lg = {
            "with_original_language": orig_lang,
            "with_genres": ",".join([str(g) for g in genres[:2]]),
            "sort_by": "popularity.desc",
            "language": "en-US"
        }
        res_lg = safe_get(url_discover, params_lg).get("results", [])
        for r in res_lg:
            add_candidate(r, 20, "Regional Industry & Genre Blend")

    # Factor 6: Fetch Page 2 of discover / similar if candidate pool needs filling
    if len(candidate_map) < count and orig_lang and genres:
        res_p2 = safe_get(url_discover, {
            "with_original_language": orig_lang,
            "sort_by": "popularity.desc",
            "page": 2,
            "language": "en-US"
        }).get("results", [])
        for r in res_p2:
            add_candidate(r, 10, "Genre / Industry Fallback")

    url_sim = f"{TMDB_BASE_URL}/movie/{tmdb_id}/similar"
    raw_sim = safe_get(url_sim, {"language": "en-US", "page": 1}).get("results", [])
    for r in raw_sim:
        add_candidate(r, 10, "TMDB Similar Graph")

    # Sort final candidates by total score, then by popularity
    sorted_candidates = sorted(
        candidate_map.values(),
        key=lambda x: (x["score"], x["obj"].get("popularity", 0)),
        reverse=True
    )

    return [item["obj"] for item in sorted_candidates[:count]]




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