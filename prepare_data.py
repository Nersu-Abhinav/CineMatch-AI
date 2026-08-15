import pandas as pd
import os


# ==========================================
# SETTINGS
# ==========================================

INPUT_FILE = "data/ratings.csv"
OUTPUT_FILE = "data/ratings_filtered.csv"

TOP_MOVIES = 5000
CHUNK_SIZE = 1_000_000


# ==========================================
# STEP 1: COUNT RATINGS FOR EACH MOVIE
# ==========================================

print("==========================================")
print("     PREPARING MOVIELENS DATASET")
print("==========================================")

print()
print("Step 1: Counting movie ratings...")
print()

movie_rating_counts = {}

chunk_number = 0

for chunk in pd.read_csv(
    INPUT_FILE,
    usecols=["movieId"],
    chunksize=CHUNK_SIZE
):

    chunk_number += 1

    counts = chunk["movieId"].value_counts()

    for movie_id, count in counts.items():

        movie_rating_counts[movie_id] = (
            movie_rating_counts.get(movie_id, 0) + count
        )

    print(
        f"Processed ratings chunk {chunk_number}..."
    )


# ==========================================
# STEP 2: FIND TOP MOVIES
# ==========================================

print()
print("Step 2: Selecting the most-rated movies...")

movie_counts = pd.Series(movie_rating_counts)

top_movie_ids = (
    movie_counts
    .sort_values(ascending=False)
    .head(TOP_MOVIES)
    .index
)

top_movie_ids = set(top_movie_ids)

print(
    f"Selected {len(top_movie_ids)} movies."
)


# ==========================================
# STEP 3: FILTER RATINGS
# ==========================================

print()
print("Step 3: Filtering ratings...")
print()

os.makedirs("data", exist_ok=True)

first_chunk = True

total_filtered_ratings = 0

chunk_number = 0

for chunk in pd.read_csv(
    INPUT_FILE,
    chunksize=CHUNK_SIZE
):

    chunk_number += 1

    filtered_chunk = chunk[
        chunk["movieId"].isin(top_movie_ids)
    ]

    total_filtered_ratings += len(filtered_chunk)

    if len(filtered_chunk) > 0:

        filtered_chunk.to_csv(
            OUTPUT_FILE,
            mode="w" if first_chunk else "a",
            header=first_chunk,
            index=False
        )

        first_chunk = False

    print(
        f"Processed filtering chunk {chunk_number}..."
    )


# ==========================================
# COMPLETE
# ==========================================

print()
print("==========================================")
print("       DATA PREPARATION COMPLETE")
print("==========================================")
print()

print("Movies selected:", len(top_movie_ids))

print(
    "Filtered ratings:",
    f"{total_filtered_ratings:,}"
)

print()
print("Created:")
print(OUTPUT_FILE)
print()