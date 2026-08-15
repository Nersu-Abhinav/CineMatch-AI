import pandas as pd
import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

print("Loading movies, ratings, and tags...")
movies = pd.read_csv("data/movies.csv")
ratings = pd.read_csv("data/ratings_filtered.csv", usecols=["movieId"])
tags_df = pd.read_csv("data/tags.csv")

top_movie_counts = ratings["movieId"].value_counts()
top_movie_ids = set(top_movie_counts.head(5000).index)

print("Filtering to top 5,000 popular catalog movies...")
movies = movies[movies["movieId"].isin(top_movie_ids)].reset_index(drop=True)
tags_df = tags_df[tags_df["movieId"].isin(top_movie_ids)]

print("Aggregating user tags...")
movie_tags = tags_df.groupby("movieId")["tag"].apply(lambda x: " ".join(x.dropna().astype(str))).reset_index()

movies = movies.merge(movie_tags, on="movieId", how="left").fillna("")

movies["rich_tags"] = (
    (movies["title"] + " ") * 3 +
    (movies["genres"].str.replace("|", " ", regex=False) + " ") * 2 +
    movies["tag"]
).str.lower()

print("Building TF-IDF Vectorizer...")
tfidf = TfidfVectorizer(
    stop_words="english",
    max_features=8000,
    ngram_range=(1, 2)
)

tfidf_matrix = tfidf.fit_transform(movies["rich_tags"])
title_map = pd.Series(movies.index, index=movies["title"].str.lower()).drop_duplicates()

def get_recs(search_title):
    search_lower = search_title.lower().strip()
    match_idx = None
    for title, idx in title_map.items():
        if search_lower in title:
            match_idx = idx
            break
    if match_idx is None:
        print(f"Movie '{search_title}' not found.")
        return

    selected_movie = movies.iloc[match_idx]
    print(f"\n==========================================")
    print(f"Target: {selected_movie['title']}")
    print(f"==========================================")

    query_vec = tfidf_matrix[match_idx]
    sim_scores = list(enumerate(cosine_similarity(query_vec, tfidf_matrix)[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    for i, (idx, score) in enumerate(sim_scores[1:11]):
        rec_title = movies.iloc[idx]["title"]
        rec_genres = movies.iloc[idx]["genres"]
        print(f"{i+1}. {rec_title} (Match: {score:.2f}) [{rec_genres}]")

print("\n--- INTERSTELLAR ---")
get_recs("interstellar")

print("\n--- FIFTY SHADES OF GREY ---")
get_recs("fifty shades of grey")

print("\n--- INCEPTION ---")
get_recs("inception")

print("\n--- THE NOTEBOOK ---")
get_recs("notebook")
