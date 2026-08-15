import pandas as pd
import numpy as np
import joblib
import os

from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors


# ==========================================
# SETTINGS
# ==========================================

RATINGS_FILE = "data/ratings_filtered.csv"
MOVIES_FILE = "data/movies.csv"

MODEL_FILE = "model/collaborative_model.pkl"

NUMBER_OF_NEIGHBORS = 21


# ==========================================
# STEP 1: LOAD RATINGS
# ==========================================

print("==========================================")
print("   COLLABORATIVE FILTERING TRAINING")
print("==========================================")

print()
print("Loading ratings...")

ratings = pd.read_csv(
    RATINGS_FILE,
    usecols=["userId", "movieId", "rating"]
)

print("Ratings loaded!")
print(
    "Number of ratings:",
    f"{len(ratings):,}"
)


# ==========================================
# STEP 2: LOAD MOVIE DATA
# ==========================================

print()
print("Loading movie data...")

movies = pd.read_csv(MOVIES_FILE)

print(
    "Number of movies:",
    len(movies)
)


# ==========================================
# STEP 3: CREATE USER AND MOVIE INDICES
# ==========================================

print()
print("Creating user and movie indices...")

unique_users = ratings["userId"].unique()
unique_movies = ratings["movieId"].unique()

user_to_index = {
    user_id: index
    for index, user_id in enumerate(unique_users)
}

movie_to_index = {
    movie_id: index
    for index, movie_id in enumerate(unique_movies)
}


# ==========================================
# STEP 4: MAP IDs TO MATRIX INDICES
# ==========================================

print()
print("Mapping ratings to matrix positions...")

row_indices = ratings["userId"].map(user_to_index).to_numpy()

column_indices = ratings["movieId"].map(movie_to_index).to_numpy()

rating_values = ratings["rating"].to_numpy(
    dtype=np.float32
)


# ==========================================
# STEP 5: CREATE SPARSE USER-MOVIE MATRIX
# ==========================================

print()
print("Creating sparse user-movie matrix...")

user_movie_matrix = csr_matrix(
    (
        rating_values,
        (row_indices, column_indices)
    ),
    shape=(
        len(unique_users),
        len(unique_movies)
    ),
    dtype=np.float32
)

print("Sparse matrix created!")

print(
    "Matrix shape:",
    user_movie_matrix.shape
)

print(
    "Stored ratings:",
    user_movie_matrix.nnz
)


# ==========================================
# STEP 6: TRANSPOSE MATRIX
# ==========================================

print()
print("Preparing movie vectors...")

movie_user_matrix = user_movie_matrix.T.tocsr()

print(
    "Movie-user matrix shape:",
    movie_user_matrix.shape
)


# ==========================================
# STEP 7: TRAIN NEAREST NEIGHBOR MODEL
# ==========================================

print()
print("Training collaborative filtering model...")

model = NearestNeighbors(
    metric="cosine",
    algorithm="brute",
    n_neighbors=NUMBER_OF_NEIGHBORS,
    n_jobs=-1
)

model.fit(movie_user_matrix)

print("Collaborative filtering model trained!")


# ==========================================
# STEP 8: CREATE MODEL DIRECTORY
# ==========================================

os.makedirs("model", exist_ok=True)


# ==========================================
# STEP 9: SAVE MODEL
# ==========================================

print()
print("Saving model...")

joblib.dump(
    model,
    MODEL_FILE
)

joblib.dump(
    movie_to_index,
    "model/movie_to_index.pkl"
)

joblib.dump(
    unique_movies,
    "model/unique_movies.pkl"
)

joblib.dump(
    movies,
    "model/movies_metadata.pkl"
)


# ==========================================
# TRAINING COMPLETE
# ==========================================

print()
print("==========================================")
print(" COLLABORATIVE MODEL TRAINING COMPLETED")
print("==========================================")

print()
print("Users:", len(unique_users))
print("Movies:", len(unique_movies))
print("Ratings:", f"{len(ratings):,}")

print()
print("Created model files:")
print("1. collaborative_model.pkl")
print("2. movie_to_index.pkl")
print("3. unique_movies.pkl")
print("4. movies_metadata.pkl")

print()