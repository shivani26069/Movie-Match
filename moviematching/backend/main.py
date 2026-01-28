from fastapi import FastAPI
from routes import session, movie, swipe, match

app = FastAPI(title="Movie Matching Backend")

app.include_router(session.router)
app.include_router(movie.router)
app.include_router(swipe.router)
app.include_router(match.router)



@app.get("/")
def health_check():
    return {"status": "Backend running"}
