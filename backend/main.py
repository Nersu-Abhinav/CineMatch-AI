from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.recommender import get_recommendations


# ==========================================
# CREATE FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="CineMatch AI",
    description="AI-powered movie recommendation system",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "CineMatch AI API is running!",
        "status": "success"
    }


# ==========================================
# HEALTH
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==========================================
# RECOMMENDATION API
# ==========================================

@app.get("/recommend")
def recommend(
    movie: str = Query(
        ...,
        description="Movie title"
    ),

    limit: int = Query(
        10,
        ge=1,
        le=20
    )
):

    result = get_recommendations(
        movie,
        number_of_recommendations=limit
    )

    return result