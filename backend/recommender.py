import joblib
import pandas as pd

from movie_metadata import get_movie_metadata


# ==========================================
# LOAD TRAINED MODEL WITH RAM FALLBACK
# ==========================================

MODEL_PATH = "model/collaborative_model.pkl"
MOVIE_INDEX_PATH = "model/movie_to_index.pkl"
UNIQUE_MOVIES_PATH = "model/unique_movies.pkl"
MOVIE_METADATA_PATH = "model/movies_metadata.pkl"

SIMILARITY_PATH = "model/movie_similarity.pkl"
MOVIE_DATA_PATH = "model/movie_data.pkl"
MOVIE_INDICES_PATH = "model/movie_indices.pkl"


model = None
use_collaborative = False

print("Loading recommendation engine...")

# Load Movie Metadata lookup
try:
    movies = joblib.load(MOVIE_METADATA_PATH)
except Exception:
    movies = joblib.load(MOVIE_DATA_PATH)

movie_lookup = movies.set_index("movieId")


# Attempt to load Collaborative Filtering Model (if RAM permits)
try:
    print("Attempting to load Collaborative Filtering model...")
    model = joblib.load(MODEL_PATH)
    movie_to_index = joblib.load(MOVIE_INDEX_PATH)
    unique_movies = joblib.load(UNIQUE_MOVIES_PATH)
    use_collaborative = True
    print("Collaborative Filtering model loaded successfully!")
except Exception as e:
    print(f"Collaborative model not loaded ({e}). Falling back to Lightweight TF-IDF model...")
    similarity_matrix = joblib.load(SIMILARITY_PATH)
    movie_data = joblib.load(MOVIE_DATA_PATH)
    movie_indices = joblib.load(MOVIE_INDICES_PATH)
    use_collaborative = False
    print("Lightweight TF-IDF Content Model loaded successfully!")


# ==========================================
# FIND MOVIE
# ==========================================

def find_movie(movie_title):
    movie_title = movie_title.lower().strip()
    titles = movies["title"].str.lower()

    # Exact match
    exact = movies[titles == movie_title]
    if not exact.empty:
        return exact.iloc[0]

    # Partial match
    partial = movies[titles.str.contains(movie_title, regex=False, na=False)]
    if not partial.empty:
        return partial.iloc[0]

    # Word match
    words = movie_title.split()
    possible = movies[
        titles.apply(
            lambda title: all(word in title for word in words)
        )
    ]
    if not possible.empty:
        return possible.iloc[0]

    return None


# ==========================================
# GET RECOMMENDATIONS
# ==========================================

def get_recommendations(movie_title, number_of_recommendations=10):
    movie = find_movie(movie_title)

    if movie is None:
        return {
            "success": False,
            "message": "Movie not found in vector space.",
            "selected_movie": None,
            "recommendations": []
        }

    selected_movie_id = movie["movieId"]
    selected_movie_title = movie["title"]

    # Selected Movie Metadata
    try:
        selected_metadata = get_movie_metadata(selected_movie_id)
    except Exception:
        selected_metadata = {
            "tmdb_id": None,
            "title": selected_movie_title,
            "overview": None,
            "rating": None,
            "release_date": None,
            "genres": [],
            "poster_url": None,
            "backdrop_url": None
        }

    recommendations = []

    if use_collaborative:
        # Collaborative Nearest Neighbors Recommendation
        try:
            movie_index = movie_to_index[selected_movie_id]
            movie_vector = model._fit_X[movie_index]
            distances, indices = model.kneighbors(
                movie_vector,
                n_neighbors=(number_of_recommendations + 1)
            )

            for distance, index in zip(distances[0], indices[0]):
                if index == movie_index:
                    continue

                recommended_movie_id = unique_movies[index]
                recommended_movie = movie_lookup.loc[recommended_movie_id]
                if isinstance(recommended_movie, pd.DataFrame):
                    recommended_movie = recommended_movie.iloc[0]

                title = recommended_movie["title"]
                similarity = 1 - distance

                try:
                    metadata = get_movie_metadata(recommended_movie_id)
                except Exception:
                    metadata = {
                        "tmdb_id": None,
                        "title": title,
                        "overview": None,
                        "rating": None,
                        "release_date": None,
                        "genres": [],
                        "poster_url": None,
                        "backdrop_url": None
                    }

                recommendations.append({
                    "movie_id": int(recommended_movie_id),
                    "title": title,
                    "similarity": round(float(similarity), 3),
                    "tmdb_id": metadata["tmdb_id"],
                    "rating": metadata["rating"],
                    "release_date": metadata["release_date"],
                    "genres": metadata["genres"],
                    "overview": metadata["overview"],
                    "poster_url": metadata["poster_url"],
                    "backdrop_url": metadata["backdrop_url"]
                })

                if len(recommendations) >= number_of_recommendations:
                    break

        except Exception as err:
            print(f"Collaborative recommendation error: {err}")

    # Fallback to TF-IDF similarity if collaborative is disabled or failed
    if not recommendations:
        try:
            norm_title = selected_movie_title.lower().strip()
            if norm_title in movie_indices:
                idx = movie_indices[norm_title]
                sim_scores = list(enumerate(similarity_matrix[idx]))
                sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

                for index, score in sim_scores[1 : number_of_recommendations + 1]:
                    rec_item = movie_data.iloc[index]
                    rec_title = rec_item["title"]
                    rec_movie_id = rec_item.get("movieId", index)

                    try:
                        metadata = get_movie_metadata(rec_movie_id)
                    except Exception:
                        metadata = {
                            "tmdb_id": None,
                            "title": rec_title,
                            "overview": None,
                            "rating": None,
                            "release_date": None,
                            "genres": [],
                            "poster_url": None,
                            "backdrop_url": None
                        }

                    recommendations.append({
                        "movie_id": int(rec_movie_id) if hasattr(rec_movie_id, "__int__") else index,
                        "title": rec_title,
                        "similarity": round(float(score), 3),
                        "tmdb_id": metadata["tmdb_id"],
                        "rating": metadata["rating"],
                        "release_date": metadata["release_date"],
                        "genres": metadata["genres"],
                        "overview": metadata["overview"],
                        "poster_url": metadata["poster_url"],
                        "backdrop_url": metadata["backdrop_url"]
                    })
        except Exception as err:
            print(f"TF-IDF recommendation error: {err}")

    return {
        "success": True,
        "selected_movie": {
            "movie_id": int(selected_movie_id),
            "title": selected_movie_title,
            "tmdb_id": selected_metadata["tmdb_id"],
            "rating": selected_metadata["rating"],
            "release_date": selected_metadata["release_date"],
            "genres": selected_metadata["genres"],
            "overview": selected_metadata["overview"],
            "poster_url": selected_metadata["poster_url"],
            "backdrop_url": selected_metadata["backdrop_url"]
        },
        "recommendations": recommendations
    }