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

api_key = os.getenv("TMDB_API_KEY")


# ==========================================
# CHECK API KEY
# ==========================================

if not api_key:

    print("TMDB API key was not found.")

    raise SystemExit


print("TMDB API key loaded successfully.")
print("Key length:", len(api_key))


# ==========================================
# TEST TMDB API
# ==========================================

url = "https://api.themoviedb.org/3/movie/155"

params = {
    "api_key": api_key,
    "language": "en-US"
}


print()
print("Connecting to TMDB...")


try:

    response = requests.get(
        url,
        params=params,
        timeout=30
    )


    print()
    print("HTTP Status:", response.status_code)


    if response.status_code == 200:

        movie = response.json()

        print()
        print("==========================================")
        print("          TMDB CONNECTION SUCCESS")
        print("==========================================")

        print()
        print("Title:", movie.get("title"))
        print("Release Date:", movie.get("release_date"))
        print("Rating:", movie.get("vote_average"))
        print("Poster Path:", movie.get("poster_path"))

        print()
        print("TMDB API is working correctly!")


    elif response.status_code == 401:

        print()
        print("TMDB returned 401 Unauthorized.")
        print()
        print("Your API key was rejected.")
        print("Check that you regenerated the exposed key")
        print("and placed the NEW key in .env.")


    else:

        print()
        print("TMDB returned an unexpected status.")
        print("Response:")
        print(response.text[:500])


except requests.exceptions.RequestException as error:

    print()
    print("Connection error:")
    print(error)