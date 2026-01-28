from sqlalchemy import Column, String
from core.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    host = Column(String)
    status = Column(String)
