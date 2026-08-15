# 🎬 CineMatch AI — Machine Learning Movie Recommendation Model

**CineMatch AI** is an intelligent movie recommendation platform that uses machine learning to recommend movies based on a user's selected movies and ratings.

The system combines collaborative filtering, content-based filtering, genre analysis, user-interest analysis, and TMDB movie metadata to provide personalized movie recommendations through an interactive web application.

CineMatch AI is designed to provide multiple recommendation perspectives rather than relying on a single recommendation algorithm.

---

## 🌐 Live Application
- **Live Site**: [https://nersu-abhinav.github.io/CineMatch-AI/](https://nersu-abhinav.github.io/CineMatch-AI/)
- **GitHub Repository**: [https://github.com/Nersu-Abhinav/CineMatch-AI](https://github.com/Nersu-Abhinav/CineMatch-AI)

---

## 🚀 Project Overview

Traditional movie recommendation systems often rely on a single recommendation technique. **CineMatch AI** combines multiple recommendation strategies to generate a broader and more personalized set of recommendations.

### The User Flow:
1. Searches for movies.
2. Selects five movies.
3. Provides a rating for each selected movie.
4. CineMatch AI processes the selections.
5. Multiple recommendation strategies generate candidate movies.
6. Duplicate recommendations are removed.
7. The final recommendations are grouped into four categories.
8. Movie posters are resolved through TMDB.
9. The recommendations are displayed through the web interface.

### Final System Output:
```
Genre Matches     ──►  10 movies
Interest Matches  ──►  10 movies
Content Matches   ──►  10 movies
CineMatch Picks   ──►  10 movies
---------------------------------
Total             ──►  40 movies
```

---

## ✨ Features

### 🎥 Movie Discovery
- Top 25 featured movies
- Movie posters for featured movies
- Live movie search (search while typing, case-insensitive, partial keyword matching)
- Smart Compound Query Normalizer (`normalizeMovieQuery` converts `racegurram` $\rightarrow$ **Race Gurram**)
- Strict Language Isolation (Telugu searches return 100% regional Indian blockbusters)
- Maximum 10 search suggestions with posters

### ⭐ User Preferences
- Select movies from search results
- Select five movies & rate each selected movie (1 to 5 stars)
- Use ratings as recommendation input
- Exact percentage match badges (**`98% Match`**, **`95% Match`**)

### 🤖 Recommendation System
- Genre-based recommendations
- Interest/rating-based recommendations ($k$-NN)
- Content-based recommendations (TF-IDF)
- CineMatch Picks
- Duplicate removal
- 40 final recommendations

### 🖼️ Poster System
- TMDB poster integration
- On-demand poster retrieval (no bulk poster downloading)
- Poster caching locally
- Posters fetched only for movies displayed by the application

### ⚡ Application
- FastAPI backend REST API
- HTML/CSS/JavaScript Glassmorphic frontend SPA
- Centralized configuration & modular recommendation engine
- Modular ML pipeline

---

## 🧠 Machine Learning Architecture

```
                 MovieLens Dataset
                         │
                         ▼
                 Data Preprocessing
                         │
                         ▼
                  Feature Creation
                         │
       ┌─────────────────┴─────────────────┐
       │                                   │
       ▼                                   ▼
Collaborative Data                  Movie Metadata
       │                                   │
       ▼                                   ▼
 KNN / SVD Models                       TF-IDF
       │                                   │
       └─────────────────┬─────────────────┘
                         │
                         ▼
               Recommendation Engine
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
 Genre Matches   Interest Matches  Content Matches
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
                  CineMatch Picks
                         │
                         ▼
                Duplicate Removal
                         │
                         ▼
               40 Recommendations
```

---

## 🧮 Recommendation Algorithms

### 1. Genre-Based Recommendation
Analyzes the genres of the movies selected by the user and creates genre scores based on user ratings. Candidate movies sharing highly preferred genres receive higher scores.
```
Selected Movies ──► Extract Genres ──► Calculate Preference ──► Score Candidate Movies ──► Normalize Scores ──► Top 10 Movies
```

### 2. Interest / Rating-Based Recommendation
Uses the user's selected movies and ratings together with the trained $k$-NN model.
```
Selected Movie ──► Find KNN Representation ──► Find Similar Movies ──► Calculate Similarity ──► Weight by Rating ──► Aggregate ──► Rank ──► Top 10 Movies
```

### 3. Content-Based Recommendation
Uses movie metadata represented through TF-IDF features and cosine similarity against a user profile built from selected movies.
```
Movie Metadata ──► Text Representation ──► TF-IDF Features ──► User Profile ──► Cosine Similarity ──► Rank Candidates ──► Top 10 Movies
```

### 4. Collaborative Filtering
Constructs a user-movie rating matrix and uses TruncatedSVD dimensionality reduction:
- **TruncatedSVD**: `n_components = 50`, `random_state = 42`
- **Evaluation**: RMSE (Root Mean Squared Error) & MAE (Mean Absolute Error)

### 5. CineMatch Picks
Combines available recommendation factors to provide a fourth category beyond dedicated genre, interest, and content approaches:
```
Genre Matches (10) + Interest Matches (10) + Content Matches (10) + CineMatch Picks (10) = 40 Total Movies
```

---

## 🔄 Recommendation Workflow

```
User ──► Search Movies ──► Select 5 Movies ──► Rate Movies ──► FastAPI Backend ──► Recommendation Engine
                                                                                        │
                                                                 ┌──────────────────────┼──────────────────────┐
                                                                 ▼                      ▼                      ▼
                                                               Genre                 Interest               Content
                                                                 │                      │                      │
                                                                 └──────────────────────┼──────────────────────┘
                                                                                        │
                                                                                        ▼
                                                                                  CineMatch Picks
                                                                                        │
                                                                                        ▼
                                                                               Candidate Generation
                                                                                        │
                                                                                        ▼
                                                                                Duplicate Removal
                                                                                        │
                                                                                        ▼
                                                                                 40 Final Movies
                                                                                        │
                                                                                        ▼
                                                                                Poster Resolution
                                                                                        │
                                                                                        ▼
                                                                                    Frontend
```

---

## 🖼️ Poster Retrieval System

CineMatch AI does **NOT** download posters for all movies in the dataset:
- **Featured Movies**: Top 25 Movies $\rightarrow$ 25 Poster Lookups / Cache
- **Live Search**: User Types $\rightarrow$ Max 10 Results $\rightarrow$ Up to 10 Posters
- **Recommendations**: 4 Categories $\rightarrow$ 10 Movies Each $\rightarrow$ 40 Movies $\rightarrow$ 40 Poster Lookups

---

## 🌐 TMDB Integration

- **TMDB Homepage**: [https://www.themoviedb.org/](https://www.themoviedb.org/)
- **TMDB API Documentation**: [https://developer.themoviedb.org/](https://developer.themoviedb.org/)
- **Environment Variable**:
  ```env
  TMDB_API_TOKEN=YOUR_TMDB_API_TOKEN
  ```
- Poster paths are converted into URLs using the TMDB image service and cached locally.

---

## 📦 Dataset

CineMatch AI uses the **MovieLens 32M / 29M Dataset** by GroupLens Research.
- **Dataset Page**: [https://grouplens.org/datasets/movielens/](https://grouplens.org/datasets/movielens/)
- **Raw Files**: `data/raw/ml-32m/movies.csv`, `data/raw/ml-32m/ratings.csv`

---

## 📊 Dataset Processing

```
Raw Dataset ──► Data Loading ──► Data Cleaning ──► Filtering ──► Rating Preparation ──► Movie Metadata Preparation ──► Processed Dataset
```
- Cleaned Ratings: `data/processed/ratings_clean.csv`
- Movie Metadata: `data/processed/movie_metadata.csv`

---

## 🧪 Model Training

Located under `src/pipeline/`:
- `src/pipeline/preprocessing.py`: Data loading and cleaning
- `src/pipeline/training.py`: Collaborative filtering & model training
- `src/pipeline/evaluation.py`: Model evaluation (RMSE & MAE)
- `src/pipeline/tuning.py`: Hyperparameter tuning

---

## 🧠 Models and ML Components

| Component | Purpose |
| :--- | :--- |
| **KNN** | Interest / similarity-based recommendations |
| **TruncatedSVD** | Collaborative filtering / latent factor modeling |
| **TF-IDF** | Movie content representation |
| **Cosine Similarity** | Content similarity calculation |
| **Genre Scoring** | Genre preference recommendations |
| **Rating Weighting** | User preference weighting |
| **Score Normalization** | Recommendation score comparison |
| **Deduplication** | Prevent repeated movies |

---

## 💾 Trained Model Assets

Stored under `models/`:
- **Collaborative**: `models/collaborative/knn_model.pkl`, `knn_movie_ids.npy`, `knn_user_ids.npy`, `movie_factors.npy`, `movie_ids.npy`, `user_factors.npy`, `user_ids.npy`
- **Content**: `models/content/movie_data.pkl`, `tfidf_matrix.pkl`, `tfidf_vectorizer.pkl`

---

## 📁 Complete Project Structure

```
CineMatch-AI/
├── backend/
│   ├── main.py
│   └── recommender.py
├── data/
│   ├── raw/ml-32m/
│   ├── processed/
│   ├── cache/
│   └── evaluation/
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── models/
│   ├── collaborative/
│   └── content/
├── src/
│   ├── config.py
│   ├── recommendation_engine.py
│   ├── tmdb_service.py
│   └── pipeline/
│       ├── preprocessing.py
│       ├── training.py
│       ├── evaluation.py
│       └── tuning.py
├── index.html
├── script.js
├── style.css
├── prepare_data.py
├── train_collaborative.py
├── start_project.ps1
├── requirements.txt
└── README.md
```

---

## 🧩 Core Source Files

- `backend/main.py`: FastAPI app serving frontend, search, featured movies & recommendation API.
- `frontend/index.html`: Complete CineMatch AI frontend layout.
- `src/config.py`: Centralized configuration for project paths & TMDB settings.
- `src/recommendation_engine.py`: Loads models and runs recommendation algorithms.
- `src/tmdb_service.py`: TMDB API calls, poster retrieval & caching.
- `src/pipeline/`: Organized ML pipeline (`preprocessing.py`, `training.py`, `evaluation.py`, `tuning.py`).

---

## 🔎 Search System

Converts user input to normalized form (lowercase, trim punctuation, whitespace normalization, compound title auto-correction).
- Example: `racegurram` $\rightarrow$ **Race Gurram**
- Search works from 1st character typed, displaying up to 10 suggestions.

---

## ⚡ Performance Optimization

- **Precomputed Search Titles**: Titles normalized once instead of on every keystroke.
- **Limited Search Results**: Maximum 10 results.
- **Limited Poster Requests**: Posters resolved only for displayed movies.
- **Poster Cache**: Previously retrieved posters cached locally.
- **Model Preloading**: Models loaded once at startup.

---

## 🔌 API

### `GET /`
Loads the web application.

### `GET /featured`
Returns top 25 featured movies.

### `GET /search`
Searches for movies (`GET /search?query=race&limit=10`).

### `POST /recommendations`
Generates personalized recommendations from selected movies and ratings.

---

## 🔐 Environment Variables

Create `.env` in the project root:
```env
TMDB_API_TOKEN=YOUR_TMDB_API_TOKEN
```

---

## ⚙️ Installation

1. **Clone Repository**:
   ```bash
   git clone https://github.com/Nersu-Abhinav/CineMatch-AI.git
   cd CineMatch-AI
   ```
2. **Create Virtual Environment**:
   ```bash
   python -m venv .venv
   ```
3. **Activate Virtual Environment**:
   ```powershell
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   ```
4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## ▶️ Run the Application

```bash
uvicorn backend.main:app --reload --port 8000
```
Open `http://127.0.0.1:8000` in your browser.

---

## 📌 Current System Status

- Project Structure: ✅
- FastAPI Backend: ✅
- Frontend SPA: ✅
- Compound Title Normalizer: ✅
- Strict Language Isolation: ✅
- Live Movie Search: ✅
- Case-Insensitive Search: ✅
- Top 25 Featured Movies: ✅
- TMDB Poster Integration: ✅
- Movie Selection & Rating: ✅
- Genre Recommendations: ✅
- Interest Recommendations: ✅
- Content Recommendations: ✅
- CineMatch Picks: ✅
- 40 Recommendations: ✅
- Duplicate Removal: ✅
- Poster Caching: ✅
- ML Pipeline & Evaluation: ✅
- GitHub Repository Sync: ✅

---

## 👨‍💻 Project

**CineMatch AI** — Machine Learning Movie Recommendation System

*MovieLens + Machine Learning + Recommendation Algorithms + FastAPI + HTML/CSS/JavaScript + TMDB = CineMatch AI*

**Created with ❤️ by [Nersu Abhinav](https://github.com/Nersu-Abhinav)**

© 2026 **CineMatch AI**. Distributed under the [MIT License](LICENSE).
