from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import session, movie, swipe, match

app = FastAPI(title="Movie Matching Backend")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Disable credentials when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)
app.include_router(movie.router)
app.include_router(swipe.router)
app.include_router(match.router)



@app.get("/")
def health_check():
    return {"status": "Backend running"}
