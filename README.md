# 🎬 CineMatch AI — Next-Gen Movie Recommendation Engine

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![TMDB API](https://img.shields.io/badge/TMDB%20API-v3-01b4e4?style=for-the-badge&logo=themoviedb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**CineMatch AI** is an end-to-end movie recommendation web application powered by **Item-Item Collaborative Filtering** (k-Nearest Neighbors over 29M+ ratings), real-time metadata & poster enrichment via **TMDB API v3**, a high-performance **FastAPI** backend, and a modern glassmorphic single-page frontend.

---

## ✨ Features

- ⚡ **Item-Item Collaborative Filtering**: High-dimensional vector space similarity powered by `scikit-learn` `NearestNeighbors(metric="cosine")`.
- 📊 **Chunked Data Pipeline**: Efficiently processes 29M+ MovieLens ratings down to top 5,000 catalog items without RAM exhaustion.
- 🎨 **Glassmorphic UI**: Ultra-premium dark-mode design with dynamic movie poster backdrops, ambient glows, and responsive layout grids.
- 🔍 **Flexible Discovery Controls**: Client-side sorting (Match score, TMDB rating, release year, title) and minimum rating/genre filters.
- ⚡ **Chain Discovery**: Click any movie card to instantly trigger new recommendations for that title.
- 🖼️ **TMDB Real-Time Enrichment**: Dynamic fetching of high-res posters, backdrops, plot overviews, ratings, and release dates.
- 🚀 **One-Click Automation**: Windows PowerShell launcher script to launch backend and frontend servers simultaneously.

---

## 🏗️ Architecture & Data Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Frontend (index.html / script.js)
    participant API as FastAPI Backend (main.py)
    participant Rec as Recommender Engine (recommender.py)
    participant Model as k-NN Model (collaborative_model.pkl)
    participant TMDB as TMDB API v3

    User->>UI: Types "Inception" & clicks Discover
    UI->>API: GET /recommend?movie=Inception&limit=10
    API->>Rec: get_recommendations("Inception", 10)
    Rec->>Rec: find_movie("Inception") -> MovieLens ID (59315)
    Rec->>TMDB: get_movie_metadata(59315)
    TMDB-->>Rec: Poster, backdrop, overview, ratings
    Rec->>Model: kneighbors(vector_59315, n_neighbors=11)
    Model-->>Rec: Returns nearest neighbor indices & cosine distances
    loop For each recommended movie
        Rec->>TMDB: get_movie_metadata(neighbor_id)
        TMDB-->>Rec: Enriched metadata & poster URL
    end
    Rec-->>API: Returns JSON payload
    API-->>UI: HTTP 200 OK JSON Response
    UI->>UI: Renders Spotlight & Recommendations Grid
```

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pandas, SciPy (Sparse CSR matrices), Scikit-Learn, Joblib, Requests, Python-Dotenv.
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS (Custom tokens, Glassmorphism, Responsive CSS Grid/Flexbox).
- **APIs & Datasets**: TMDB API v3, MovieLens Ratings & Links Catalog.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10 or higher
- A free TMDB API Read Access Token ([Get it from TMDB](https://www.themoviedb.org/settings/api))

### 2. Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nersu-Abhinav/CineMatch-AI.git
   cd CineMatch-AI
   ```

2. **Create virtual environment & install dependencies**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install fastapi uvicorn pandas numpy scipy scikit-learn joblib requests python-dotenv
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and paste your TMDB Read Access Token:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   TMDB_API_TOKEN=your_tmdb_bearer_token_here
   ```

4. **Prepare Data & Train Model**:
   ```bash
   # Step 1: Filter raw ratings to top 5,000 catalog items
   python prepare_data.py

   # Step 2: Train Collaborative Filtering Nearest-Neighbors model
   python train_collaborative.py
   ```

5. **Run Application**:
   - **One-click launcher (Windows PowerShell)**:
     ```powershell
     .\start_project.ps1
     ```
   - **Manual start**:
     - Terminal 1 (Backend API):
       ```bash
       python -m uvicorn backend.main:app --reload --port 8000
       ```
     - Terminal 2 (Frontend Server):
       ```bash
       cd frontend
       python -m http.server 5500
       ```
     Open your browser to `http://127.0.0.1:5500`.

---

## 📁 Repository Structure

```
├── backend/
│   ├── main.py                # FastAPI routes & CORS setup
│   └── recommender.py         # Collaborative filtering inference engine
├── data/                      # Dataset files (movies.csv, links.csv)
├── frontend/
│   ├── index.html             # Application structure & markup
│   ├── script.js              # State management & dynamic UI logic
│   └── style.css              # Custom dark-mode glassmorphic styling
├── model/                     # Trained model artifacts (.pkl)
├── movie_metadata.py          # Bridges MovieLens IDs to TMDB API metadata
├── prepare_data.py            # Chunked data filtering pipeline
├── recommend_collaborative.py # CLI recommendation script
├── start_project.ps1          # One-click launcher script
├── tmdb.py                    # TMDB API v3 wrapper
├── train_collaborative.py     # NearestNeighbors model trainer
├── .env.example               # Environment variables template
└── .gitignore                 # Excluded large datasets & secrets
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
