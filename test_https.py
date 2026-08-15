import ssl
import urllib.request


url = "https://api.themoviedb.org/3/movie/155"


print("Testing Python HTTPS connection...")
print()

try:

    context = ssl.create_default_context()

    with urllib.request.urlopen(
        url,
        context=context,
        timeout=30
    ) as response:

        print("Connection successful!")
        print("HTTP status:", response.status)

        data = response.read().decode(
            "utf-8",
            errors="ignore"
        )

        print()
        print("TMDB response:")
        print(data[:500])


except Exception as error:

    print("Connection failed!")
    print()
    print(type(error).__name__)
    print(error)