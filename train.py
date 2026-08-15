import pandas as pd
import numpy as np
import joblib
import os

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ==========================================
# STEP 1: LOAD DATASETS
# ==========================================

print("Loading dataset...")

movies = pd.read_csv("data/movies.csv")

try:
    ratings = pd.read_csv("data/ratings_filtered.csv", usecols=["movieId"])
    top_ids = set(ratings["movieId"].value_counts().head(3000).index)
    movies = movies[movies["movieId"].isin(top_ids)].reset_index(drop=True)
except Exception:
    movies = movies.head(3000).reset_index(drop=True)

print("Dataset loaded successfully!")
print("Number of catalog movies:", len(movies))


# ==========================================
# STEP 2: HANDLE MISSING VALUES
# ==========================================

movies = movies.fillna("")


# ==========================================
# STEP 3: CREATE MOVIE TAGS
# ==========================================

print("Creating movie features...")

movies["tags"] = (
    movies["title"] + " " +
    movies["genres"].str.replace("|", " ", regex=False)
)

movies["tags"] = movies["tags"].str.lower()


# ==========================================
# STEP 4: CREATE TF-IDF VECTORS
# ==========================================

print("Converting movie information into vectors...")

tfidf = TfidfVectorizer(
    stop_words="english",
    max_features=2500
)

tfidf_matrix = tfidf.fit_transform(movies["tags"])

print("TF-IDF vectorization completed!")
print("Vector shape:", tfidf_matrix.shape)


# ==========================================
# STEP 5: CALCULATE SIMILARITY
# ==========================================

print("Calculating movie similarities...")

similarity_matrix = cosine_similarity(tfidf_matrix).astype(np.float32)

print("Similarity calculation completed!")


# ==========================================
# STEP 6: CREATE MOVIE INDEX
# ==========================================

movie_indices = pd.Series(
    movies.index,
    index=movies["title"].str.lower()
)

movie_indices = movie_indices[~movie_indices.index.duplicated(keep="first")]


# ==========================================
# STEP 7: SAVE MODEL ARTIFACTS
# ==========================================

os.makedirs("model", exist_ok=True)

print("Saving trained model...")

joblib.dump(
    similarity_matrix,
    "model/movie_similarity.pkl",
    compress=5
)

joblib.dump(
    movies,
    "model/movie_data.pkl",
    compress=5
)

joblib.dump(
    movie_indices,
    "model/movie_indices.pkl",
    compress=5
)

joblib.dump(
    tfidf,
    "model/tfidf_vectorizer.pkl",
    compress=5
)

print("MODEL TRAINING COMPLETED SUCCESSFULLY!")