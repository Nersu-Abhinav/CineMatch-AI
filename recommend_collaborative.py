import joblib
import pandas as pd

from movie_metadata import get_movie_metadata


# ==========================================
# 1. LOAD TRAINED MODEL
# ==========================================

print("Loading collaborative model...")

model = joblib.load(
    "model/collaborative_model.pkl"
)

movie_to_index = joblib.load(
    "model/movie_to_index.pkl"
)

unique_movies = joblib.load(
    "model/unique_movies.pkl"
)

movies = joblib.load(
    "model/movies_metadata.pkl"
)

print("Model loaded successfully!")


# ==========================================
# 2. CREATE MOVIE LOOKUP
# ==========================================

movie_lookup = movies.set_index(
    "movieId"
)


# ==========================================
# 3. FIND MOVIE
# ==========================================

def find_movie(movie_title):

    movie_title = movie_title.lower().strip()

    movie_titles = movies[
        "title"
    ].str.lower()


    # --------------------------------------
    # EXACT MATCH
    # --------------------------------------

    exact_matches = movies[
        movie_titles == movie_title
    ]

    trained_exact_matches = exact_matches[
        exact_matches["movieId"].isin(
            movie_to_index.keys()
        )
    ]

    if not trained_exact_matches.empty:

        return trained_exact_matches.iloc[0]


    # --------------------------------------
    # PARTIAL MATCH
    # --------------------------------------

    partial_matches = movies[
        movie_titles.str.contains(
            movie_title,
            regex=False,
            na=False
        )
    ]

    trained_matches = partial_matches[
        partial_matches["movieId"].isin(
            movie_to_index.keys()
        )
    ]


    if not trained_matches.empty:

        print()
        print("Possible matches:")

        for title in trained_matches[
            "title"
        ].head(10):

            print("-", title)

        print()

        return trained_matches.iloc[0]


    # --------------------------------------
    # WORD-BASED MATCH
    # --------------------------------------

    search_words = movie_title.split()

    possible_movies = movies[
        movie_titles.apply(
            lambda title:
            all(
                word in title
                for word in search_words
            )
        )
    ]

    trained_possible_movies = possible_movies[
        possible_movies["movieId"].isin(
            movie_to_index.keys()
        )
    ]


    if not trained_possible_movies.empty:

        print()
        print("Possible matches:")

        for title in trained_possible_movies[
            "title"
        ].head(10):

            print("-", title)

        print()

        return trained_possible_movies.iloc[0]


    # --------------------------------------
    # NOT FOUND
    # --------------------------------------

    print()
    print("Movie not found in trained model.")
    print()

    return None


# ==========================================
# 4. GET RECOMMENDATIONS
# ==========================================

def recommend_movies(
    movie_title,
    number_of_recommendations=10
):

    movie = find_movie(
        movie_title
    )

    if movie is None:
        return


    # --------------------------------------
    # SELECTED MOVIE
    # --------------------------------------

    selected_movie_id = movie[
        "movieId"
    ]

    selected_movie_title = movie[
        "title"
    ]


    print()
    print("------------------------------------------")
    print("Selected Movie:")
    print(selected_movie_title)
    print("------------------------------------------")


    # --------------------------------------
    # GET MOVIE INDEX
    # --------------------------------------

    movie_index = movie_to_index[
        selected_movie_id
    ]


    # --------------------------------------
    # GET MOVIE VECTOR
    # --------------------------------------

    movie_vector = model._fit_X[
        movie_index
    ]


    # --------------------------------------
    # FIND SIMILAR MOVIES
    # --------------------------------------

    distances, indices = model.kneighbors(
        movie_vector,
        n_neighbors=(
            number_of_recommendations + 1
        )
    )


    # ======================================
    # DISPLAY RESULTS
    # ======================================

    print()
    print("==========================================")
    print("    MOVIE RECOMMENDATIONS + POSTERS")
    print("==========================================")
    print()


    count = 0


    for distance, index in zip(
        distances[0],
        indices[0]
    ):

        # Skip selected movie
        if index == movie_index:
            continue


        # ----------------------------------
        # GET MOVIE ID
        # ----------------------------------

        recommended_movie_id = (
            unique_movies[index]
        )


        # ----------------------------------
        # GET MOVIE INFORMATION
        # ----------------------------------

        recommended_movie = movie_lookup.loc[
            recommended_movie_id
        ]


        recommended_title = (
            recommended_movie["title"]
        )


        # ----------------------------------
        # SIMILARITY
        # ----------------------------------

        similarity = 1 - distance


        count += 1


        print()
        print("==========================================")
        print(f"Recommendation #{count}")
        print("==========================================")

        print(
            "Title:",
            recommended_title
        )

        print(
            "Similarity:",
            f"{similarity:.2f}"
        )


        # ----------------------------------
        # GET TMDB INFORMATION
        # ----------------------------------

        try:

            metadata = get_movie_metadata(
                recommended_movie_id
            )


            print(
                "TMDB ID:",
                metadata["tmdb_id"]
            )

            print(
                "Rating:",
                metadata["rating"]
            )

            print(
                "Release Date:",
                metadata["release_date"]
            )

            print(
                "Genres:",
                ", ".join(
                    metadata["genres"]
                )
            )

            print(
                "Poster URL:",
                metadata["poster_url"]
            )

            print(
                "Backdrop URL:",
                metadata["backdrop_url"]
            )

            print(
                "Overview:",
                metadata["overview"]
            )


        except Exception as error:

            print(
                "TMDB error:",
                error
            )


        if count >= number_of_recommendations:
            break


    print()
    print("==========================================")
    print("             COMPLETE")
    print("==========================================")
    print()


# ==========================================
# 5. START PROGRAM
# ==========================================

print()
print("==========================================")
print("      MOVIE RECOMMENDATION SYSTEM")
print("==========================================")
print()

movie = input(
    "Enter a movie name: "
)


recommend_movies(
    movie,
    number_of_recommendations=10
)