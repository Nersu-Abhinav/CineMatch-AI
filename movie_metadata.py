import pandas as pd

from tmdb import get_movie_details
from tmdb import get_poster_url


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
    movie = get_movie_details(
        tmdb_id
    )


    # Poster
    poster_url = get_poster_url(
        movie.get("poster_path")
    )


    # Backdrop
    backdrop_path = movie.get(
        "backdrop_path"
    )

    if backdrop_path:

        backdrop_url = (
            "https://image.tmdb.org/t/p/w1280"
            + backdrop_path
        )

    else:

        backdrop_url = None


    # Genres
    genres = [
        genre["name"]
        for genre in movie.get(
            "genres",
            []
        )
    ]


    # Return information
    return {

        "tmdb_id": tmdb_id,

        "title": movie.get(
            "title"
        ),

        "overview": movie.get(
            "overview"
        ),

        "rating": movie.get(
            "vote_average"
        ),

        "release_date": movie.get(
            "release_date"
        ),

        "genres": genres,

        "poster_url": poster_url,

        "backdrop_url": backdrop_url
    }