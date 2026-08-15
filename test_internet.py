import urllib.request


url = "https://www.google.com"


print("Testing Python HTTPS connection to Google...")
print()


try:

    with urllib.request.urlopen(
        url,
        timeout=30
    ) as response:

        print("Connection successful!")
        print("HTTP status:", response.status)


except Exception as error:

    print("Connection failed!")
    print()
    print(type(error).__name__)
    print(error)