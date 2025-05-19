from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, sets, cards, progress, search
from app.database import engine
from app.models import models

# Create database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="StudySprout API",
    description="API for StudySprout, a flashcard learning application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(sets.router)
app.include_router(cards.router)
app.include_router(progress.router)
app.include_router(search.router)


@app.get("/")
def read_root():
    """Root endpoint for API health check."""
    return {"message": "Welcome to StudySprout API"}


# If running directly with Python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
