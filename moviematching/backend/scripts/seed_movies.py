import requests
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.database import SessionLocal
from models.movie import Movie

API_KEY = "90e8e6dba6b4c628c26b190be4dc605d"
BASE_URL = "https://api.themoviedb.org/3"

LANGUAGES = ["en", "hi", "te", "ta", "ml"]
IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

def seed_movies():
    db = SessionLocal()

    for lang in LANGUAGES:
        print(f"\nFetching movies for language: {lang}")

        # Fetch from multiple pages to get more movies
        for page in range(1, 3):  # Pages 1 and 2
            url = f"{BASE_URL}/discover/movie"
            params = {
                "api_key": API_KEY,
                "with_original_language": lang,
                "sort_by": "release_date.desc",
                "page": page
            }

            try:
                response = requests.get(url, params=params, timeout=10)
                data = response.json()
                movies = data.get("results", [])

                print(f"Fetched {len(movies)} movies from page {page}")

                for m in movies:
                    if not m.get("poster_path"):
                        continue

                    exists = db.query(Movie).filter(Movie.id == m["id"]).first()
                    if exists:
                        continue

                    movie = Movie(
                        id=m["id"],
                        title=m["title"],
                        description=m.get("overview"),
                        language=m["original_language"],
                        rating=m.get("vote_average"),
                        poster_url=f"{IMAGE_BASE}{m['poster_path']}"
                    )

                    db.add(movie)
                    print(f"Inserted: {m['title']}")

                db.commit()
            except Exception as e:
                print(f"Error fetching {lang} movies (page {page}): {str(e)}")
                db.rollback()

    db.close()
    print("\nMovie seeding completed successfully!")

if __name__ == "__main__":
    seed_movies()
