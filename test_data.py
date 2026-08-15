import pandas as pd

movies = pd.read_csv("data/movies.csv")

print("Dataset loaded successfully!")
print()

print("Number of movies:", len(movies))
print()

print("Columns:")
print(movies.columns.tolist())

print()

print("First 5 movies:")
print(movies.head())