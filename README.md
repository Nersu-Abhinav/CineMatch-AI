<div align="center">

# 🎬 CineMatch AI

### **Intelligent Movie Discovery & Recommendation Engine**

<p>
  <strong>Discover movies you'll love through machine learning, movie intelligence, and a cinematic user experience.</strong>
</p>

<br>

<a href="https://nersu-abhinav.github.io/CineMatch-AI/">
<img src="https://img.shields.io/badge/🎬%20LIVE%20DEMO-CINEMATCH%20AI-F5C518?style=for-the-badge&labelColor=111111" alt="Live Demo">
</a>
&nbsp;
<a href="https://github.com/Nersu-Abhinav/CineMatch-AI">
<img src="https://img.shields.io/badge/⭐%20GITHUB-REPOSITORY-FFFFFF?style=for-the-badge&labelColor=181717&logo=github" alt="GitHub">
</a>

<br><br>

<img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=800&size=22&duration=2800&pause=900&color=F5C518&center=true&vCenter=true&width=850&lines=Search+Less.+Discover+More.;Machine+Learning+Meets+Cinema.;Find+Your+Next+Favorite+Movie.;Intelligent+Recommendations.+Cinematic+Experience." alt="CineMatch AI">

<br><br>

<img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white">
<img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white">
<img src="https://img.shields.io/badge/Scikit--learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white">
<img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black">
<img src="https://img.shields.io/badge/TMDB-01B4E4?style=flat-square&logo=themoviedatabase&logoColor=white">

</div>

---

## 🎞️ What is CineMatch AI?

**CineMatch AI** is a full-stack movie recommendation platform that combines **machine learning, collaborative filtering, content similarity, movie metadata, and intelligent ranking** to help users discover what to watch next.

Instead of treating every movie as just a title, CineMatch considers relationships between movies, including:

* 🎭 Genres
* 🎬 Directors
* ⭐ Ratings
* 👥 Cast
* 🎞️ Collections
* 🌎 Language
* 📝 Movie content
* 🧠 Similarity signals

The result is a recommendation experience designed to feel less like searching a database and more like exploring a personal cinema.

---

<div align="center">

### 🍿 **ONE MOVIE.**

### 🧠 **MULTIPLE INTELLIGENCE SIGNALS.**

### 🎬 **BETTER DISCOVERY.**

</div>

---

## ✨ Features

### 🔎 Smart Movie Search

Search for movies using a fast, responsive search interface.

CineMatch supports normalized movie queries, including compound titles such as:

```text
racegurram
        ↓
Race Gurram
```

```text
thedarkknight
        ↓
The Dark Knight
```

The search experience is designed to make movie discovery quick and intuitive.

---

### 🎯 Intelligent Recommendations

CineMatch combines multiple recommendation approaches to understand movie similarity from different perspectives.

| Recommendation                 | What It Understands                                    |
| ------------------------------ | ------------------------------------------------------ |
| 🎭 **Genre Matching**          | Genre relationships and preferences                    |
| 🤝 **Collaborative Filtering** | Movie relationships from rating behavior               |
| 📝 **Content Similarity**      | Movie metadata and textual characteristics             |
| 🎬 **Metadata Ranking**        | Cast, director, collection, language and other signals |

---

### 🎬 Rich Movie Discovery

Recommendations can include:

* Movie title
* Poster
* Backdrop
* Overview
* Rating
* Release date
* Genres
* Original language
* Recommendation information

All presented through a cinematic interface.

---

### 🖼️ TMDB Integration

CineMatch uses **The Movie Database (TMDB)** for movie metadata and visual enrichment.

Movie artwork and metadata are resolved dynamically rather than requiring the complete movie catalog to be downloaded locally.

---

### ⚡ Fast & Responsive Interface

The frontend is built using:

```text
HTML5
CSS3
Vanilla JavaScript ES6+
```

No heavy frontend framework is required.

The interface includes:

* 🌑 Dark cinematic design
* ✨ Glassmorphism
* 🎞️ Movie cards
* 🔎 Search interface
* 🎯 Recommendation sections
* 🪟 Movie detail modal
* 📱 Responsive layouts
* ⚡ Dynamic interactions

---

# 🧠 How CineMatch Works

```text
                         👤 USER
                           │
                           ▼
                    🔎 MOVIE SEARCH
                           │
                           ▼
                  🎬 MOVIE RESOLUTION
                           │
                           ▼
                ┌─────────────────────┐
                │ Recommendation      │
                │      Engine         │
                └──────────┬──────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
        🤝 ML Model    📝 Content     🎭 Metadata
        Similarity     Similarity      Signals
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                    🎯 RANKING ENGINE
                           │
                           ▼
                    🏆 TOP RESULTS
                           │
                           ▼
                     🌐 TMDB DATA
                           │
                           ▼
                    🎬 CINEMATIC UI
```

---

# 🤖 Recommendation Intelligence

## 🤝 1. Collaborative Filtering

The machine-learning pipeline uses movie-rating data to discover relationships between movies.

The core idea:

> Movies that receive similar rating patterns can be considered behaviorally similar.

The training workflow follows:

```text
MovieLens Ratings
       │
       ▼
Data Preparation
       │
       ▼
User × Movie Matrix
       │
       ▼
Sparse Representation
       │
       ▼
Movie Similarity
       │
       ▼
Nearest Neighbors
       │
       ▼
Similar Movies
```

The collaborative component uses **cosine-based nearest-neighbor similarity**.

---

## 📝 2. Content-Based Similarity

Movie information can also be represented as content features.

Conceptually:

```text
Movie Metadata
      │
      ▼
Text Features
      │
      ▼
TF-IDF Representation
      │
      ▼
Vector Similarity
      │
      ▼
Related Movies
```

This allows recommendations to consider movie characteristics rather than relying exclusively on rating behavior.

---

## 🎭 3. Genre Intelligence

Genre relationships provide another recommendation signal.

For example:

```text
Interstellar
   │
   ├── Science Fiction
   ├── Drama
   └── Adventure
          │
          ▼
Movies sharing relevant characteristics
          │
          ▼
Genre-based recommendations
```

This helps identify movies that belong to similar cinematic categories.

---

## 🎯 4. Multi-Factor Ranking

CineMatch can combine multiple movie relationships when ranking candidates.

Examples include:

```text
Same Collection
      +
Same Director
      +
Shared Cast
      +
Genre Similarity
      +
Language
      +
TMDB Relationships
      │
      ▼
Aggregate Recommendation Score
```

This provides a broader understanding of why two movies may be related.

---

# 🔄 Recommendation Pipeline

```text
┌──────────────────────┐
│      User Input      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Search / Resolve   │
│       Movie          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Candidate Discovery  │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────┐
│ Recommendation Signals      │
│                             │
│ • Collaborative Similarity  │
│ • Content Similarity        │
│ • Genre Relationships       │
│ • Movie Metadata            │
└──────────────┬──────────────┘
               │
               ▼
       ┌───────────────┐
       │    Ranking    │
       └───────┬───────┘
               │
               ▼
       ┌─────────-──────┐
       │ Recommendations│
       └───────┬────-───┘
               │
               ▼
        🎬 Movie Cards
```

---

# 📊 Machine Learning Pipeline

```text
                 📊 DATA
                   │
                   ▼
             Preprocessing
                   │
                   ▼
            Feature Creation
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
   Collaborative       Movie Content
       Data                 Data
          │                 │
          ▼                 ▼
     Similarity          TF-IDF
          │                 │
          └────────┬────────┘
                   │
                   ▼
          Recommendation
              Engine
                   │
                   ▼
              Ranking
                   │
                   ▼
           🎬 Movie Results
```

---

# 🌐 TMDB Integration

CineMatch uses **TMDB** to enrich recommendations with real movie information.

### Retrieved information can include:

* 🎬 Title
* 📝 Overview
* ⭐ Rating
* 📅 Release date
* 🎭 Genres
* 👥 Cast
* 🎥 Director
* 🌎 Original language
* 🖼️ Poster
* 🌆 Backdrop
* 🔗 Similar movie relationships

### Resources

* TMDB: https://www.themoviedb.org/
* TMDB API Documentation: https://developer.themoviedb.org/

> CineMatch AI uses TMDB data and images in accordance with TMDB's API and attribution requirements.

---

# 🏗️ Architecture

```text
                         ┌───────────────┐
                         │    Browser    │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │  Vanilla JS Client  │
                    │    HTML + CSS + JS  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │      Backend API    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       Recommendation      ML Models          TMDB
          Engine                              API
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                       🎬 Movie Results
```

---

# 🧩 Technology Stack

<div align="center">

| Layer                   | Technology                      |
| :---------------------- | :------------------------------ |
| 🎨 Frontend             | HTML5, CSS3, Vanilla JavaScript |
| 🐍 Backend              | Python                          |
| ⚡ API                   | FastAPI                         |
| 🧠 Machine Learning     | Scikit-learn                    |
| 📊 Data Processing      | Pandas                          |
| 🔢 Numerical Computing  | NumPy                           |
| 🧮 Scientific Computing | SciPy                           |
| 🤝 Recommendation       | k-NN / Similarity-Based Methods |
| 📝 Text Representation  | TF-IDF                          |
| 🎬 Movie Data           | TMDB API                        |
| 📦 Dataset              | MovieLens                       |
| 💾 Model Serialization  | Joblib / Pickle                 |
| 🌐 Frontend Deployment  | GitHub Pages                    |
| ☁️ Backend Deployment   | Render                          |

</div>

---

# 📁 Project Structure

```text
CineMatch-AI/
│
├── 📂 backend/
│   ├── __init__.py
│   ├── main.py
│   └── recommender.py
│
├── 📂 frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── 📂 data/
│
├── 📂 model/
│   ├── collaborative_model.pkl
│   ├── movie_data.pkl
│   ├── movie_indices.pkl
│   └── movie_similarity.pkl
│
├── 📄 prepare_data.py
├── 📄 train_collaborative.py
├── 📄 recommend_collaborative.py
├── 📄 movie_metadata.py
├── 📄 tmdb.py
│
├── 📄 requirements.txt
├── 📄 Procfile
├── 📄 runtime.txt
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 start_project.ps1
└── 📄 README.md
```

---

# 🔌 API

### `GET /`

Returns the API welcome response.

```http
GET /
```

### `GET /health`

Checks whether the backend is running.

```http
GET /health
```

### `GET /recommend`

Generates recommendations for a movie.

```http
GET /recommend?movie=Interstellar&limit=10
```

Parameters:

| Parameter |   Type  | Description               |
| :-------- | :-----: | :------------------------ |
| `movie`   |  string | Movie title               |
| `limit`   | integer | Number of recommendations |

---

# 🚀 Run Locally

## 1. Clone

```bash
git clone https://github.com/Nersu-Abhinav/CineMatch-AI.git
cd CineMatch-AI
```

## 2. Create Virtual Environment

### Windows

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure TMDB

Create a `.env` file:

```env
TMDB_API_TOKEN=YOUR_TMDB_API_TOKEN
```

> 🔐 Never commit your `.env` file or private credentials.

## 5. Start the Backend

```bash
uvicorn backend.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000
```

---

# 🧪 Machine Learning Workflow

To prepare the recommendation data:

```bash
python prepare_data.py
```

Train the collaborative filtering model:

```bash
python train_collaborative.py
```

Test collaborative recommendations:

```bash
python recommend_collaborative.py
```

The basic workflow is:

```text
Dataset
   ↓
Preprocessing
   ↓
Feature / Matrix Creation
   ↓
Model Training
   ↓
Similarity Search
   ↓
Recommendations
```

---

# ⚡ Performance

CineMatch is designed to avoid unnecessary processing.

### Search

Search results are limited to a manageable number of candidates.

### Movie Posters

Posters are resolved for displayed content rather than attempting to download the entire movie catalog.

### Model Loading

Model artifacts can be loaded once and reused during the application lifecycle.

### Data Processing

Large datasets can be processed in chunks to reduce memory pressure.

---

# 🎨 Design

CineMatch AI follows a **cinematic dark-mode design language**.

### Visual principles

```text
Dark Background
      +
Glass Surfaces
      +
Golden Accents
      +
Movie Artwork
      +
Smooth Motion
      +
Strong Typography
      │
      ▼
🎬 Cinematic Experience
```

The interface is designed to make the recommendation system feel like a **modern streaming discovery platform**, rather than a traditional machine-learning demo.

---

# 📌 Project Highlights

<div align="center">

|     | Capability                       |
| :-: | :------------------------------- |
|  🎬 | Movie Discovery                  |
|  🤖 | Machine Learning Recommendations |
|  🤝 | Collaborative Filtering          |
|  📝 | Content Similarity               |
|  🎭 | Genre Intelligence               |
|  🎯 | Multi-Factor Ranking             |
|  🔎 | Smart Search                     |
|  🌐 | TMDB Integration                 |
|  ⚡  | FastAPI Backend                  |
|  🎨 | Cinematic UI                     |
|  📱 | Responsive Design                |

</div>

---

# 🎯 Project Goal

The goal of CineMatch AI is simple:

> **Turn movie discovery into an intelligent, personalized, and visually engaging experience.**

Instead of asking users to browse endlessly through movie catalogs, CineMatch uses data and recommendation algorithms to narrow the search and surface movies that are more likely to match their interests.

---

<div align="center">

# 🎬 CineMatch AI

### **Search Less. Discover More.**

<br>

**Machine Learning × Recommendation Systems × Movie Intelligence**

<br><br>

<a href="https://nersu-abhinav.github.io/CineMatch-AI/">
<img src="https://img.shields.io/badge/▶%20EXPLORE%20CINEMATCH-F5C518?style=for-the-badge&labelColor=111111" alt="Explore CineMatch">
</a>

<br><br>

Made with ❤️ by **Nersu Abhinav**

<br>

<a href="https://github.com/Nersu-Abhinav">
<img src="https://img.shields.io/badge/GitHub-Nersu--Abhinav-181717?style=for-the-badge&logo=github" alt="GitHub">
</a>

</div>
