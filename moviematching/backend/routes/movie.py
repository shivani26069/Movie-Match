from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.session_model import Session as SessionModel
from models.movie import Movie

router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/list")
def get_movies(session_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "active":
        raise HTTPException(status_code=400, detail="Session not active")

    movies = db.query(Movie).all()
    
    return {
        "session_id": session_id,
        "movies": [
            {
                "id": m.id,
                "title": m.title,
                "genre": m.genre,
                "language": m.language,
                "rating": m.rating
            }
            for m in movies
        ]
    }
