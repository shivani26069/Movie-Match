from fastapi import APIRouter, HTTPException, Depends
from uuid import uuid4
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.session_model import Session as SessionModel
from models.user_model import User as UserModel

router = APIRouter(
    prefix="/session",
    tags=["Session"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create")
def create_session(host_name: str, db: Session = Depends(get_db)):
    try:
        session_id = str(uuid4())
        
        # Create session in database (host will be set to host user id later)
        new_session = SessionModel(
            id=session_id,
            host="",
            status="waiting"
        )
        db.add(new_session)
        db.flush()

        # Create host user in database
        host_user = UserModel(
            name=host_name,
            session_id=session_id
        )
        db.add(host_user)
        db.flush()

        # Set session host to host user's id for robust identification
        new_session.host = host_user.id
        db.commit()
        print(f"✅ Session created: {session_id}")

        return {
            "session_id": session_id,
            "host_id": host_user.id,
            "host_name": host_name,
            "status": "waiting",
            "message": "Session created"
        }
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/join")
def join_session(session_id: str, user_name: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "waiting":
        raise HTTPException(status_code=400, detail="Session already started")

    existing_user = db.query(UserModel).filter(
        UserModel.session_id == session_id,
        UserModel.name == user_name
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already joined")

    user_count = db.query(UserModel).filter(UserModel.session_id == session_id).count()
    if user_count >= 5:
        raise HTTPException(status_code=400, detail="Session is full")

    # Add user to database
    new_user = UserModel(
        name=user_name,
        session_id=session_id
    )
    db.add(new_user)
    db.commit()
    
    # Get all users in session
    users = db.query(UserModel).filter(UserModel.session_id == session_id).all()

    return {
        "session_id": session_id,
        "user_id": new_user.id,
        "users": [{"id": u.id, "name": u.name} for u in users],
        "message": "Joined session successfully"
    }

@router.post("/start")
def start_session(session_id: str, host_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.host != host_id:
        raise HTTPException(status_code=403, detail="Only host can start the session")

    if session.status == "active":
        raise HTTPException(status_code=400, detail="Session already active")

    session.status = "active"
    db.commit()

    return {
        "session_id": session_id,
        "status": "active",
        "message": "Session started"
    }

@router.post("/end")
def end_session(session_id: str, host_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.host != host_id:
        raise HTTPException(status_code=403, detail="Only host can end the session")

    if session.status == "ended":
        raise HTTPException(status_code=400, detail="Session already ended")

    session.status = "ended"
    db.commit()

    return {
        "session_id": session_id,
        "status": "ended",
        "message": "Session ended"
    }

@router.get("/users")
def list_users(session_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    users = db.query(UserModel).filter(UserModel.session_id == session_id).all()
    return {
        "session_id": session_id,
        "host_id": session.host,
        "count": len(users),
        "users": [{"id": u.id, "name": u.name} for u in users]
    }
