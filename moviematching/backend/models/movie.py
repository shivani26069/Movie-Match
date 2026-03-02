from sqlalchemy import Column, Integer, String, Float
from core.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    genre = Column(String)
    description = Column(String)
    language = Column(String)
    rating = Column(Float)
    poster_url = Column(String)

