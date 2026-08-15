<div align="center">

# 🎬 CineMatch AI — Ultra-Premium Machine Learning Movie Discovery Engine

<a href="https://readme-typing-svg.herokuapp.com">
  <img src="https://readme-typing-svg.herokuapp.com?font=Outfit&weight=800&size=22&duration=2000&pause=600&color=F5C518&center=true&vCenter=true&width=900&lines=%F0%9F%8F%AC+CINEMATCH+AI+%E2%80%94+ULTRA-PREMIUM+LATENT+VECTOR+DISCOVERY+ENGINE;%F0%9F%8C%8C+Multi-Perspective+Collaborative+%26+Content+Vector+Matching;%F0%9F%8E%AC+Strict+Language-Isolated+Regional+%26+Global+Recommendations;%F0%9F%A7%A0+Smart+Query+Auto-Correction+%26+Compound+Title+Normalizer;%E2%9C%A8+Live+TMDB+v3+Metadata+Integration+%26+4K+Poster+Enrichment" alt="CineMatch AI Typing Banner" />
</a>

<br><br>

<a href="https://nersu-abhinav.github.io/CineMatch-AI/">
  <img src="https://img.shields.io/badge/🌐_LIVE_WEB_APP-LAUNCH_SITE-f5c518?style=for-the-badge&logo=googlechrome&logoColor=black" alt="Live Site" />
</a>
<a href="https://github.com/Nersu-Abhinav/CineMatch-AI/stargazers">
  <img src="https://img.shields.io/badge/⭐_GITHUB-STARS-06b6d4?style=for-the-badge&logo=github&logoColor=white" alt="Stars" />
</a>
<a href="https://github.com/Nersu-Abhinav/CineMatch-AI/network/members">
  <img src="https://img.shields.io/badge/🔀_REPOS-FORKS-8b5cf6?style=for-the-badge&logo=git&logoColor=white" alt="Forks" />
</a>
<a href="https://fastapi.tiangolo.com/">
  <img src="https://img.shields.io/badge/FASTAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
</a>
<a href="https://scikit-learn.org/">
  <img src="https://img.shields.io/badge/SCIKIT--LEARN-1.3+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
</a>
<a href="https://www.themoviedb.org/">
  <img src="https://img.shields.io/badge/TMDB_API-v3-01b4e4?style=for-the-badge&logo=themoviedb&logoColor=white" alt="TMDB" />
</a>

<br><br>

**CineMatch AI** is an intelligent movie recommendation platform that uses machine learning to recommend movies based on a user's selected movies and ratings.

The system combines collaborative filtering, content-based filtering, genre analysis, user-interest analysis, and TMDB movie metadata to provide personalized movie recommendations through an interactive web application.

*CineMatch AI is designed to provide multiple recommendation perspectives rather than relying on a single recommendation algorithm.*

---

</div>

> [!IMPORTANT]
> 🍿 **TRY THE LIVE APPLICATION**: Access the fully deployed glassmorphic web app directly in your browser at **[https://nersu-abhinav.github.io/CineMatch-AI/](https://nersu-abhinav.github.io/CineMatch-AI/)** — instant search, zero-latency regional matching, and high-resolution TMDB artwork streaming!

---

## 🚀 Project Overview

Traditional movie recommendation systems often rely on a single recommendation technique. **CineMatch AI** combines multiple recommendation strategies to generate a broader and more personalized set of recommendations.

### The User Flow:
- 🔍 **Searches for movies** (with real-time autocomplete and smart compound query normalizer `normalizeMovieQuery`).
- 🎬 **Selects five movies**.
- ⭐ **Provides a rating for each selected movie**.
- ⚡ **CineMatch AI processes the selections**.
- 🤖 **Multiple recommendation strategies generate candidate movies**.
- 🧹 **Duplicate recommendations are removed**.
- 📊 **The final recommendations are grouped into four categories**.
- 🖼️ **Movie posters are resolved through TMDB**.
- 💻 **The recommendations are displayed through the web interface**.

### Final System Output:

| Category | Output Count | Discovery Focus |
| :--- | :---: | :--- |
| 🎭 **Genre Matches** | **10 Movies** | Shared primary genre classification & thematic style |
| ⭐ **Interest Matches** | **10 Movies** | Rating-weighted $k$-NN user interest vector matches |
| 🎬 **Content Matches** | **10 Movies** | TF-IDF plot summary & keyword vector overlap |
| 💎 **CineMatch Picks** | **10 Movies** | Hybrid multi-vector algorithmic recommendations |
| 🏆 **Total Output** | **40 Movies** | **Deduplicated Recommendation Matrix** |

---

## ✨ Features

### 🎥 Movie Discovery
- **Top 25 featured movies** with poster artwork
- **Live movie search as you type** (case-insensitive, partial keyword matching)
- **Smart Compound Query Normalizer (`normalizeMovieQuery`)**: Auto-corrects concatenated queries (e.g. `racegurram` &rarr; **Race Gurram**, `thedarkknight` &rarr; **The Dark Knight**, `agentsaisrinivasatreya` &rarr; **Agent Sai Srinivasa Athreya**)
- **Strict Language Isolation**: Enforces `original_language` isolation (Telugu searches return 100% regional Indian blockbusters with zero foreign leakage)
- **Maximum 10 search suggestions** with high-resolution poster thumbnails

### ⭐ User Preferences
- Select movies from search results or featured catalogs
- Select five movies & rate each selected movie (1 to 5 stars)
- Use ratings as weighted recommendation vector inputs
- Dynamic numerical match percentage badges (**`98% Match`**, **`95% Match`**, **`92% Match`**)

### 🤖 Recommendation System
- Genre-based recommendations
- Interest/rating-based recommendations ($k$-NN)
- Content-based recommendations (TF-IDF)
- CineMatch Picks
- Automated duplicate removal
- 40 final unique recommendations

### 🖼️ Poster System
- TMDB poster integration (v3 API)
- On-demand poster retrieval (no bulk poster downloading)
- Local poster caching
- Posters fetched only for movies displayed by the application

### ⚡ Application
- FastAPI backend asynchronous REST endpoints
- HTML5 / Vanilla CSS3 / Vanilla ES6+ JS Glassmorphic frontend SPA
- Centralized configuration & modular recommendation engine
- Modular machine learning pipeline

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
Analyzes the genres of the movies selected by the user. The system creates genre scores based on the user's selected movies and ratings. Movies sharing highly preferred genres receive higher recommendation scores.

**Conceptual Step Sequence:**
1. 📥 **Selected Movies** &rarr; Extract genre classifications
2. 🧮 **Calculate Genre Preference** &rarr; Accumulate user rating weights
3. 🎯 **Score Candidate Movies** &rarr; Normalize candidate scores
4. 🏆 **Top 10 Genre Matches**

The implementation scores candidate movies by accumulating the user's genre preferences across matching genres.

### 2. Interest / Rating-Based Recommendation
The interest-based recommender uses the user's selected movies and ratings together with the trained $k$-NN model.

**Conceptual Step Sequence:**
1. 📥 **Selected Movie** &rarr; Map to $k$-NN latent vector space
2. 🔍 **Find Similar Movies** &rarr; Compute cosine vector distance
3. ⚖️ **Weight Similarity by Rating** &rarr; Aggregate scores
4. 🏆 **Top 10 Interest Matches**

The implementation uses $k$-NN neighbors and weights similarity using the rating supplied by the user.

### 3. Content-Based Recommendation
The content-based recommender uses movie metadata represented through Unigram & Bigram TF-IDF features.

**Conceptual Step Sequence:**
1. 📝 **Movie Metadata** &rarr; Text representation & TF-IDF vectorization
2. 👤 **User Profile** &rarr; Construct weighted profile vector from ratings
3. 📐 **Cosine Similarity** &rarr; Rank candidate feature vectors
4. 🏆 **Top 10 Content Matches**

The selected movies are combined into a weighted user profile using their ratings. Cosine similarity is then calculated between the resulting profile and the movie content matrix.

### 4. Collaborative Filtering
CineMatch AI also includes collaborative-filtering model development. The training pipeline constructs a user-movie rating matrix:

```
Users × Movies ──► Rating Matrix ──► Sparse Matrix ──► TruncatedSVD ──► Latent Factors
```

The training implementation uses:
- **TruncatedSVD**: `n_components = 50`, `random_state = 42`
- **Evaluation Metrics**:
  - **RMSE** (Root Mean Squared Error): Measures average prediction error variance.
  - **MAE** (Mean Absolute Error): Measures absolute rating differences.

### 5. CineMatch Picks
CineMatch Picks provides the fourth recommendation category. It combines the available recommendation factors to provide an additional set of recommendations beyond the dedicated genre, interest, and content approaches:

$$\mathbf{\text{Genre Matches (10)} + \text{Interest Matches (10)} + \text{Content Matches (10)} + \text{CineMatch Picks (10)} = 40 \text{ Total Movies}}$$

---

## 🔄 Recommendation Workflow

```
               ┌─────────────────────────┐
               │    👤 User Interaction   │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │  🔍 Search & Select 5   │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │  ⭐ Rate Selected Movies │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │   🚀 FastAPI Backend    │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │ ⚡ Recommendation Engine │
               └────────────┬────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
  🎭 Genre Engine    ⭐ Interest Engine  🎬 Content Engine
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
                  💎 CineMatch Picks
                            │
                            ▼
                 🧹 Duplicate Removal
                            │
                            ▼
                 🏆 40 Final Movies
                            │
                            ▼
                 🖼️ TMDB Poster Fetch
                            │
                            ▼
               💻 Glassmorphic Frontend
```

---

## 🖼️ Poster Retrieval System

CineMatch AI does **NOT** download posters for all movies in the dataset. The application only resolves posters for movies that are actually displayed:

- 🌟 **Featured Movies**: Top 25 Movies &rarr; 25 Poster Requests / Cache Lookups
- 🔍 **Live Search**: User Types &rarr; Maximum 10 Search Results &rarr; Up to 10 Posters
- 🍿 **Recommendations**: 4 Categories &rarr; 10 Movies Each &rarr; 40 Posters Requested / Cached

---

## 🌐 TMDB Integration

CineMatch AI uses **The Movie Database (TMDB) API** for movie poster information and related metadata.

- **TMDB Homepage**: [https://www.themoviedb.org/](https://www.themoviedb.org/)
- **TMDB API Docs**: [https://developer.themoviedb.org/](https://developer.themoviedb.org/)
- **Environment Variable**:
  ```env
  TMDB_API_TOKEN=YOUR_TMDB_API_TOKEN
  ```
- Poster paths are converted into image URLs using the TMDB image service and cached locally to reduce API requests.

---

## 📦 Dataset

CineMatch AI uses the **MovieLens 32M / 29M Dataset** by GroupLens Research ([grouplens.org/datasets/movielens/](https://grouplens.org/datasets/movielens/)).

- **Dataset Location**: `data/raw/ml-32m/`
- **Primary Files**: `movies.csv`, `ratings.csv`

---

## 📊 Dataset Processing

```
Raw Dataset ──► Data Loading ──► Cleaning ──► Filtering ──► Rating Prep ──► Metadata Prep ──► Processed Data
```
- **Cleaned Ratings**: `data/processed/ratings_clean.csv`
- **Movie Metadata**: `data/processed/movie_metadata.csv`

---

## 🧪 Model Training

Located under `src/pipeline/`:
- `preprocessing.py`: Responsible for preparing raw CSV data.
- `training.py`: Model training including collaborative filtering.
- `evaluation.py`: Evaluates model predictions (RMSE, MAE).
- `tuning.py`: Experimentation and hyperparameter tuning.

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
| **Deduplication** | Prevent repeated movies in final output |

---

## 💾 Trained Model Assets

Stored locally under `models/`:
- **Collaborative Models**: `models/collaborative/knn_model.pkl`, `knn_movie_ids.npy`, `knn_user_ids.npy`, `movie_factors.npy`, `movie_ids.npy`, `user_factors.npy`, `user_ids.npy`
- **Content Models**: `models/content/movie_data.pkl`, `tfidf_matrix.pkl`, `tfidf_vectorizer.pkl`

---

## 📁 Complete Project Structure

```
CineMatch-AI/
├── 📁 backend/
│   ├── main.py
│   └── recommender.py
├── 📁 data/
│   ├── 📁 raw/ml-32m/
│   ├── 📁 processed/
│   ├── 📁 cache/
│   └── 📁 evaluation/
├── 📁 frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── 📁 models/
│   ├── 📁 collaborative/
│   └── 📁 content/
├── 📁 src/
│   ├── config.py
│   ├── recommendation_engine.py
│   ├── tmdb_service.py
│   └── 📁 pipeline/
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
- `frontend/index.html`: Complete CineMatch AI frontend interface layout.
- `src/config.py`: Centralized configuration for project paths & TMDB settings.
- `src/recommendation_engine.py`: Loads trained models, calculates genre/interest/content recommendations, CineMatch Picks, normalization & deduplication.
- `src/tmdb_service.py`: TMDB API calls, poster retrieval & caching.
- `src/pipeline/`: Organized ML development pipeline.

---

## 🔎 Search System

Converts user input to normalized form (lowercase, trim punctuation, whitespace normalization, compound title auto-correction via `normalizeMovieQuery`).
- Example: `racegurram` &rarr; **Race Gurram**
- Search works from the first character typed, displaying up to 10 suggestions.

---

## ⚡ Performance Optimization

1. **Precomputed Search Titles**: Normalized once instead of on every keystroke.
2. **Limited Search Results**: Maximum 10 search results.
3. **Limited Poster Requests**: Resolved only for displayed movies.
4. **Poster Cache**: Previously retrieved posters cached locally.
5. **Model Preloading**: Trained models loaded once at engine initialization.

---

## 🔌 API

### `GET /`
Loads the CineMatch AI web application.

### `GET /featured`
Returns top 25 featured movies.

### `GET /search`
Searches for movies (`GET /search?query=race&limit=10`).

### `POST /recommendations`
Generates 40 personalized recommendations from selected movies and ratings.

---

## 🔐 Environment Variables

Create `.env` in the project root:
```env
TMDB_API_TOKEN=YOUR_TMDB_API_TOKEN
```

---

## ⚙️ Installation

```bash
# 1. Clone repository
git clone https://github.com/Nersu-Abhinav/CineMatch-AI.git
cd CineMatch-AI

# 2. Create virtual environment
python -m venv .venv

# 3. Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt
```

---

## ▶️ Run the Application

```bash
uvicorn backend.main:app --reload --port 8000
```
Open **`http://127.0.0.1:8000`** in your browser.

---

## 📌 Current System Status

| Component | Status | Description |
| :--- | :---: | :--- |
| **FastAPI Backend REST API** | ✅ | Asynchronous endpoints serving requests |
| **Vanilla JS Single Page App** | ✅ | Dark Mode Glassmorphic interface |
| **Compound Query Normalizer** | ✅ | Auto-corrects `racegurram` &rarr; **Race Gurram** |
| **Strict Language Isolation** | ✅ | Enforces `original_language` consistency |
| **Numerical % Match Badges** | ✅ | Dynamic vector proximity scores (**98% Match**) |
| **4-Tier Category Display** | ✅ | Genre, Interest, Content & CineMatch Picks |
| **Expanded Cinema Modal** | ✅ | High-res TMDB artwork & key statistics grid |
| **TMDB API v3 Integration** | ✅ | On-demand poster resolution & local caching |
| **GitHub Pages Live Hosting** | ✅ | Live static deployment on `main` branch |

---

<div align="center">

## 👨‍💻 Project Credits

**CineMatch AI** — Machine Learning Movie Recommendation Platform

*MovieLens + Machine Learning + Recommendation Algorithms + FastAPI + HTML/CSS/JavaScript + TMDB = CineMatch AI*

**Created with ❤️ by [Nersu Abhinav](https://github.com/Nersu-Abhinav)**

<br>

<a href="https://github.com/Nersu-Abhinav/CineMatch-AI/stargazers">
  <img src="https://img.shields.io/github/stars/Nersu-Abhinav/CineMatch-AI?style=for-the-badge&color=f5c518&logo=github&logoColor=black" alt="GitHub Stars" />
</a>
<a href="https://github.com/Nersu-Abhinav/CineMatch-AI/network/members">
  <img src="https://img.shields.io/github/forks/Nersu-Abhinav/CineMatch-AI?style=for-the-badge&color=06b6d4&logo=github&logoColor=black" alt="GitHub Forks" />
</a>

<br><br>

© 2026 **CineMatch AI**. Distributed under the [MIT License](LICENSE).

</div>
