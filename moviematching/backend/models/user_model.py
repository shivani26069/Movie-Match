from sqlalchemy import Column, String, ForeignKey
from core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
