import pandas as pd


print("========================================")
print("      MOVIELENS DATASET INSPECTION")
print("========================================")


# ----------------------------------------
# MOVIES
# ----------------------------------------

print("\nLoading movies.csv...")

movies = pd.read_csv("data/movies.csv")

print("\nMOVIES")
print("----------------------------------------")
print("Rows:", len(movies))
print("Columns:", movies.columns.tolist())

print("\nFirst 5 movies:")
print(movies.head())


# ----------------------------------------
# RATINGS
# ----------------------------------------

print("\nLoading ratings.csv...")

ratings = pd.read_csv("data/ratings.csv")

print("\nRATINGS")
print("----------------------------------------")
print("Rows:", len(ratings))
print("Columns:", ratings.columns.tolist())

print("\nFirst 5 ratings:")
print(ratings.head())


# ----------------------------------------
# LINKS
# ----------------------------------------

print("\nLoading links.csv...")

links = pd.read_csv("data/links.csv")

print("\nLINKS")
print("----------------------------------------")
print("Rows:", len(links))
print("Columns:", links.columns.tolist())

print("\nFirst 5 links:")
print(links.head())


# ----------------------------------------
# SUMMARY
# ----------------------------------------

print("\n========================================")
print("             INSPECTION DONE")
print("========================================")