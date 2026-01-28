from sqlalchemy import Column, String
from core.database import Base

class User(Base):
    __tablename__ = "users"

    name = Column(String, primary_key=True)
    session_id = Column(String)
