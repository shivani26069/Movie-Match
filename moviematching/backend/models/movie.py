from sqlalchemy import Column, Integer, String, Float
from core.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    genre = Column(String)
    language = Column(String)
    rating = Column(Float)
    description = Column(String)
    poster_url = Column(String)

