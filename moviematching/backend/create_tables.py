from core.database import engine, Base, SessionLocal

# 👇 IMPORT MODELS so SQLAlchemy registers them
from models.session_model import Session
from models.user_model import User
from models.movie import Movie
from models.swipe_model import Swipe
from data.movies import MOVIES


Base.metadata.create_all(bind=engine)

# 👇 INSERT MOVIE DATA
db = SessionLocal()

# Check if movies already exist to avoid duplicates
existing_movies = db.query(Movie).count()
if existing_movies == 0:
    for movie_data in MOVIES:
        movie = Movie(**movie_data)
        db.add(movie)
    db.commit()
    print("✅ Movies inserted successfully!")
else:
    print("✅ Movies already exist in database")

db.close()
