import os
from dotenv import load_dotenv

# Load environment variables from a .env file if present
load_dotenv()

# Database URL for SQLAlchemy engine
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:basireddy%4026@localhost:5432/moviematch",
)

# External API keys and settings
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")

