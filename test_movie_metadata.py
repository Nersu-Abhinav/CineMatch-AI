from movie_metadata import get_movie_metadata


# ==========================================
# TEST MOVIE
# ==========================================

# MovieLens ID for The Dark Knight
# will be found from the MovieLens dataset
movie_id = 58559


print("==========================================")
print("       MOVIE METADATA TEST")
print("==========================================")


movie = get_movie_metadata(
    movie_id
)


print()

print("TMDB ID:")
print(movie["tmdb_id"])

print()

print("Title:")
print(movie["title"])

print()

print("Rating:")
print(movie["rating"])

print()

print("Release Date:")
print(movie["release_date"])

print()

print("Genres:")
print(
    ", ".join(
        movie["genres"]
    )
)

print()

print("Poster URL:")
print(movie["poster_url"])

print()

print("Backdrop URL:")
print(movie["backdrop_url"])

print()

print("Overview:")
print(movie["overview"])

print()

print("==========================================")
print("             TEST COMPLETE")
print("==========================================")