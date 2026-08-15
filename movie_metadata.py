import pandas as pd

from tmdb import get_movie_details
from tmdb import get_poster_url
from tmdb import get_backdrop_url


# ==========================================
# LOAD MOVIELENS → TMDB MAPPING
# ==========================================

links = pd.read_csv(
    "data/links.csv"
)


# ==========================================
# GET TMDB ID
# ==========================================

def get_tmdb_id(movie_id):

    result = links[
        links["movieId"] == movie_id
    ]

    if result.empty:
        return None

    tmdb_id = result.iloc[0]["tmdbId"]

    if pd.isna(tmdb_id):
        return None

    return int(tmdb_id)


def format_tmdb_item(movie_data):
    if not movie_data:
        return None
    
    tmdb_id = movie_data.get("id")
    poster_path = movie_data.get("poster_path")
    backdrop_path = movie_data.get("backdrop_path")
    
    genres = []
    if "genres" in movie_data and isinstance(movie_data["genres"], list):
        genres = [g["name"] if isinstance(g, dict) else str(g) for g in movie_data["genres"]]
    elif "genre_ids" in movie_data and isinstance(movie_data["genre_ids"], list):
        # Genre ID mapping fallback
        genre_map = {
            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
            80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
            14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
            9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
            10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
        }
        genres = [genre_map.get(gid, "Movie") for gid in movie_data["genre_ids"]]

    return {
        "tmdb_id": tmdb_id,
        "title": movie_data.get("title"),
        "overview": movie_data.get("overview"),
        "rating": round(float(movie_data.get("vote_average", 0)), 1) if movie_data.get("vote_average") else None,
        "release_date": movie_data.get("release_date"),
        "genres": genres,
        "poster_url": get_poster_url(poster_path),
        "backdrop_url": get_backdrop_url(backdrop_path)
    }


# ==========================================
# GET COMPLETE MOVIE INFORMATION
# ==========================================

def get_movie_metadata(movie_id):
    # Get TMDB ID
    tmdb_id = get_tmdb_id(movie_id)

    if tmdb_id is None:
        return {
            "tmdb_id": None,
            "title": None,
            "overview": None,
            "rating": None,
            "release_date": None,
            "genres": [],
            "poster_url": None,
            "backdrop_url": None
        }

    # Get TMDB details
    movie = get_movie_details(tmdb_id)
    return format_tmdb_item(movie)