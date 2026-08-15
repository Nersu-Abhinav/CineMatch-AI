import joblib
import pandas as pd

from movie_metadata import get_movie_metadata


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

MODEL_PATH = "model/collaborative_model.pkl"
MOVIE_INDEX_PATH = "model/movie_to_index.pkl"
UNIQUE_MOVIES_PATH = "model/unique_movies.pkl"
MOVIE_METADATA_PATH = "model/movies_metadata.pkl"


print("Loading recommendation model...")


model = joblib.load(
    MODEL_PATH
)

movie_to_index = joblib.load(
    MOVIE_INDEX_PATH
)

unique_movies = joblib.load(
    UNIQUE_MOVIES_PATH
)

movies = joblib.load(
    MOVIE_METADATA_PATH
)


print("Recommendation model loaded!")


# ==========================================
# MOVIE LOOKUP
# ==========================================

movie_lookup = movies.set_index(
    "movieId"
)


# ==========================================
# FIND MOVIE
# ==========================================

def find_movie(movie_title):

    movie_title = movie_title.lower().strip()

    titles = movies[
        "title"
    ].str.lower()


    # Exact match
    exact = movies[
        titles == movie_title
    ]

    exact = exact[
        exact["movieId"].isin(
            movie_to_index.keys()
        )
    ]

    if not exact.empty:

        return exact.iloc[0]


    # Partial match
    partial = movies[
        titles.str.contains(
            movie_title,
            regex=False,
            na=False
        )
    ]

    partial = partial[
        partial["movieId"].isin(
            movie_to_index.keys()
        )
    ]

    if not partial.empty:

        return partial.iloc[0]


    # Word match
    words = movie_title.split()

    possible = movies[
        titles.apply(
            lambda title:
            all(
                word in title
                for word in words
            )
        )
    ]

    possible = possible[
        possible["movieId"].isin(
            movie_to_index.keys()
        )
    ]

    if not possible.empty:

        return possible.iloc[0]


    return None


# ==========================================
# GET RECOMMENDATIONS
# ==========================================

def get_recommendations(
    movie_title,
    number_of_recommendations=10
):

    movie = find_movie(
        movie_title
    )


    if movie is None:

        return {
            "success": False,
            "message": "Movie not found.",
            "selected_movie": None,
            "recommendations": []
        }


    selected_movie_id = movie[
        "movieId"
    ]

    selected_movie_title = movie[
        "title"
    ]


    # ======================================
    # SELECTED MOVIE METADATA
    # ======================================

    try:

        selected_metadata = (
            get_movie_metadata(
                selected_movie_id
            )
        )

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


    # ======================================
    # GET MODEL INDEX
    # ======================================

    movie_index = movie_to_index[
        selected_movie_id
    ]


    # ======================================
    # GET MOVIE VECTOR
    # ======================================

    movie_vector = model._fit_X[
        movie_index
    ]


    # ======================================
    # FIND SIMILAR MOVIES
    # ======================================

    distances, indices = model.kneighbors(
        movie_vector,
        n_neighbors=(
            number_of_recommendations + 1
        )
    )


    recommendations = []


    # ======================================
    # PROCESS RECOMMENDATIONS
    # ======================================

    for distance, index in zip(
        distances[0],
        indices[0]
    ):

        if index == movie_index:
            continue


        recommended_movie_id = (
            unique_movies[index]
        )


        recommended_movie = (
            movie_lookup.loc[
                recommended_movie_id
            ]
        )


        title = recommended_movie[
            "title"
        ]


        similarity = 1 - distance


        # ==================================
        # TMDB METADATA
        # ==================================

        try:

            metadata = (
                get_movie_metadata(
                    recommended_movie_id
                )
            )

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

            "movie_id": int(
                recommended_movie_id
            ),

            "title": title,

            "similarity": round(
                float(similarity),
                3
            ),

            "tmdb_id": metadata[
                "tmdb_id"
            ],

            "rating": metadata[
                "rating"
            ],

            "release_date": metadata[
                "release_date"
            ],

            "genres": metadata[
                "genres"
            ],

            "overview": metadata[
                "overview"
            ],

            "poster_url": metadata[
                "poster_url"
            ],

            "backdrop_url": metadata[
                "backdrop_url"
            ]

        })


        if len(
            recommendations
        ) >= number_of_recommendations:

            break


    # ======================================
    # FINAL RESPONSE
    # ======================================

    return {

        "success": True,

        "selected_movie": {

            "movie_id": int(
                selected_movie_id
            ),

            "title": selected_movie_title,

            "tmdb_id": selected_metadata[
                "tmdb_id"
            ],

            "rating": selected_metadata[
                "rating"
            ],

            "release_date": selected_metadata[
                "release_date"
            ],

            "genres": selected_metadata[
                "genres"
            ],

            "overview": selected_metadata[
                "overview"
            ],

            "poster_url": selected_metadata[
                "poster_url"
            ],

            "backdrop_url": selected_metadata[
                "backdrop_url"
            ]

        },

        "recommendations":
            recommendations
    }