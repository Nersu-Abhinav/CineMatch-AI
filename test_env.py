import os
from pathlib import Path
from dotenv import load_dotenv


# Get the folder where this Python file is located
BASE_DIR = Path(__file__).resolve().parent

# Build the exact path to .env
ENV_FILE = BASE_DIR / ".env"

print("Looking for .env at:")
print(ENV_FILE)

print()
print("Does .env exist?")
print(ENV_FILE.exists())

# Load the exact .env file
load_dotenv(dotenv_path=ENV_FILE)

# Read the API key
api_key = os.getenv("TMDB_API_KEY")

print()

if api_key:
    print("TMDB API key found!")
    print("Key length:", len(api_key))
else:
    print("TMDB API key NOT found!")