import pandas as pd
import joblib
import os

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ==========================================
# STEP 1: LOAD DATASET
# ==========================================

print("Loading movie dataset...")

movies = pd.read_csv("data/movies.csv")

print("Dataset loaded successfully!")
print("Number of movies:", len(movies))


# ==========================================
# STEP 2: HANDLE MISSING VALUES
# ==========================================

movies = movies.fillna("")


# ==========================================
# STEP 3: CREATE MOVIE TAGS
# ==========================================

print("Creating movie features...")

movies["tags"] = (
    movies["overview"] + " " +
    movies["genres"] + " " +
    movies["keywords"] + " " +
    movies["cast"] + " " +
    movies["director"]
)

movies["tags"] = movies["tags"].str.lower()


# ==========================================
# STEP 4: CREATE TF-IDF VECTORS
# ==========================================

print("Converting movie information into vectors...")

tfidf = TfidfVectorizer(
    stop_words="english"
)

tfidf_matrix = tfidf.fit_transform(movies["tags"])

print("TF-IDF vectorization completed!")
print("Vector shape:", tfidf_matrix.shape)


# ==========================================
# STEP 5: CALCULATE SIMILARITY
# ==========================================

print("Calculating movie similarities...")

similarity_matrix = cosine_similarity(tfidf_matrix)

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
# STEP 7: CREATE MODEL FOLDER
# ==========================================

os.makedirs("model", exist_ok=True)


# ==========================================
# STEP 8: SAVE TRAINED MODEL
# ==========================================

print("Saving trained model...")

joblib.dump(
    similarity_matrix,
    "model/movie_similarity.pkl"
)

joblib.dump(
    movies,
    "model/movie_data.pkl"
)

joblib.dump(
    movie_indices,
    "model/movie_indices.pkl"
)

joblib.dump(
    tfidf,
    "model/tfidf_vectorizer.pkl"
)


# ==========================================
# TRAINING COMPLETE
# ==========================================

print()
print("==========================================")
print("       MODEL TRAINING COMPLETED!")
print("==========================================")
print()
print("Movies trained:", len(movies))
print("Model files saved inside the 'model' folder.")
print()
print("Created files:")
print("1. movie_similarity.pkl")
print("2. movie_data.pkl")
print("3. movie_indices.pkl")
print("4. tfidf_vectorizer.pkl")