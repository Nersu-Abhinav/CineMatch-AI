import joblib


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

print("Loading recommendation model...")

similarity_matrix = joblib.load(
    "model/movie_similarity.pkl"
)

movies = joblib.load(
    "model/movie_data.pkl"
)

movie_indices = joblib.load(
    "model/movie_indices.pkl"
)

print("Recommendation model loaded successfully!")


# ==========================================
# RECOMMENDATION FUNCTION
# ==========================================

def recommend_movies(movie_title, number_of_recommendations=10):

    movie_title = movie_title.lower().strip()

    # Check whether movie exists
    if movie_title not in movie_indices:

        print()
        print("Movie not found!")
        print()
        print("Please enter a movie from the dataset.")

        return

    # Get movie index
    movie_index = movie_indices[movie_title]

    # Get similarity scores
    similarity_scores = list(
        enumerate(similarity_matrix[movie_index])
    )

    # Sort from highest similarity to lowest
    similarity_scores = sorted(
        similarity_scores,
        key=lambda x: x[1],
        reverse=True
    )

    # Remove the selected movie itself
    recommendations = similarity_scores[
        1:number_of_recommendations + 1
    ]

    print()
    print("==========================================")
    print("          RECOMMENDED MOVIES")
    print("==========================================")

    for position, (index, score) in enumerate(
        recommendations,
        start=1
    ):

        movie_name = movies.iloc[index]["title"]

        print(
            f"{position}. {movie_name} "
            f"(Similarity: {score:.2f})"
        )

    print()


# ==========================================
# USER INPUT
# ==========================================

print()
print("==========================================")
print("       MOVIE RECOMMENDATION SYSTEM")
print("==========================================")

movie = input(
    "Enter a movie name: "
)

recommend_movies(movie, 10)