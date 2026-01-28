from sqlalchemy import Column, String, Integer, ForeignKey
from core.database import Base
import uuid

class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, nullable=False)
    action = Column(String, nullable=False)
