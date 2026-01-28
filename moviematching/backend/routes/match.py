from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.session_model import Session as SessionModel
from models.swipe_model import Swipe

router = APIRouter(
    prefix="/match",
    tags=["Match"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/result")
def get_match_result(session_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "active":
        raise HTTPException(status_code=400, detail="Session not active")

    swipes = db.query(Swipe).filter(Swipe.session_id == session_id).all()
    
    if not swipes:
        raise HTTPException(status_code=400, detail="No swipes recorded")

    movie_scores = {}

    for swipe in swipes:
        if swipe.movie_id not in movie_scores:
            movie_scores[swipe.movie_id] = {"likes": 0, "dislikes": 0}
        
        if swipe.action == "like":
            movie_scores[swipe.movie_id]["likes"] += 1
        else:
            movie_scores[swipe.movie_id]["dislikes"] += 1

    # Calculate net scores
    net_scores = {
        movie_id: scores["likes"] - scores["dislikes"]
        for movie_id, scores in movie_scores.items()
    }

    max_score = max(net_scores.values())

    if max_score <= 0:
        return {
            "message": "No clear consensus",
            "scores": net_scores
        }

    winners = [
        movie_id
        for movie_id, score in net_scores.items()
        if score == max_score
    ]

    return {
        "winner_movie_ids": winners,
        "scores": net_scores
    }
