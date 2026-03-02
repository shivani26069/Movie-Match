from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.swipe_model import Swipe
from models.session_model import Session as SessionModel
from models.user_model import User as UserModel

router = APIRouter(
    prefix="/swipe",
    tags=["Swipe"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
@router.post("")
def swipe_movie(
    session_id: str,
    user_id: str,
    movie_id: str,
    action: str,
    db: Session = Depends(get_db)
):
    if action not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    session = db.query(SessionModel).filter_by(id=session_id).first()
    if not session or session.status != "active":
        raise HTTPException(status_code=400, detail="Session not active")

    user = db.query(UserModel).filter_by(id=user_id, session_id=session_id).first()
    if not user:
        raise HTTPException(status_code=403, detail="User not in session")

    existing = db.query(Swipe).filter_by(
        session_id=session_id,
        user_id=user_id,
        movie_id=movie_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already swiped")

    swipe = Swipe(
        session_id=session_id,
        user_id=user_id,
        movie_id=movie_id,
        action=action
    )
    db.add(swipe)
    db.commit()

    return {"message": "Swipe recorded"}
