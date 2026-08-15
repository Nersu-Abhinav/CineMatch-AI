import pandas as pd


FILE = "data/ratings_filtered.csv"


print("==========================================")
print("     FILTERED DATASET INSPECTION")
print("==========================================")


print("\nReading filtered ratings...")

ratings = pd.read_csv(FILE)


print("\nDataset information")
print("------------------------------------------")

print("Number of ratings:", len(ratings))

print(
    "Number of unique users:",
    ratings["userId"].nunique()
)

print(
    "Number of unique movies:",
    ratings["movieId"].nunique()
)


print("\nRating statistics")
print("------------------------------------------")

print(
    "Minimum rating:",
    ratings["rating"].min()
)

print(
    "Maximum rating:",
    ratings["rating"].max()
)

print(
    "Average rating:",
    round(ratings["rating"].mean(), 2)
)


print("\nFirst 5 ratings")
print("------------------------------------------")

print(ratings.head())


print("\n==========================================")
print("       INSPECTION COMPLETED")
print("==========================================")