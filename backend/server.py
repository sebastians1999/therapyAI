"""TherapyAI FastAPI backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

try:
    from backend.routers import journal, inference
except ModuleNotFoundError:
    from routers import journal, inference


load_dotenv()


ENVIRONMENT: str = os.getenv("ENVIRONMENT")

if ENVIRONMENT == "development":
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
else:
    ALLOWED_ORIGINS: list[str] = ["production_url"]


app = FastAPI(title="TherapyAI API", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(journal.router)
app.include_router(inference.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "TherapyAI API is running", "docs": "/docs"}
