<div align="center">

# 🎬 CineMatch AI

<a href="https://readme-typing-svg.herokuapp.com">
  <img src="https://readme-typing-svg.herokuapp.com?font=Outfit&weight=800&size=22&duration=2500&pause=800&color=F5C518&center=true&vCenter=true&width=900&lines=%F0%9F%8F%AC+CineMatch+AI+%E2%80%94+Next-Gen+Movie+Recommendation+Engine;%F0%9F%8C%8C+Item-Item+Collaborative+Filtering+(29M%2B+Ratings);%F0%9F%9A%80+Real-Time+TMDB+v3+Metadata+%26+4K+Poster+Enrichment;%E2%9C%A8+Sparse+Vector+Space+Cosine+Math+%26+FastAPI" alt="Typing SVG" />
</a>

<br><br>

[![Live Web Application](https://img.shields.io/badge/🌐_LIVE_SITE-ONLINE-f5c518?style=for-the-badge&logo=googlechrome&logoColor=black)](https://nersu-abhinav.github.io/CineMatch-AI/)
[![Python](https://img.shields.io/badge/PYTHON-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FASTAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/SCIKIT--LEARN-1.3+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![TMDB API](https://img.shields.io/badge/TMDB_API-v3-01b4e4?style=for-the-badge&logo=themoviedb&logoColor=white)](https://www.themoviedb.org/)
[![License](https://img.shields.io/badge/LICENSE-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br>

[🌐 Live Application](https://nersu-abhinav.github.io/CineMatch-AI/) • [🔮 Features](#-quantum-engine-features) • [🏗️ Architecture](#%EF%B8%8F-futuristic-system-architecture) • [🛠️ Tech Stack](#%EF%B8%8F-high-tech-matrix) • [🚀 Quick Start](#-launch-engine-quick-start)

---

</div>

> [!IMPORTANT]
> 🍿 **EXPERIENCE THE LIVE DISCOVERY ENGINE**: Launch the web application right now in your browser at **[https://nersu-abhinav.github.io/CineMatch-AI/](https://nersu-abhinav.github.io/CineMatch-AI/)**. No setup or installation required!

---

## 🍿 The Cinematic Experience

**CineMatch AI** is a futuristic movie recommendation engine built with **Item-Item Collaborative Filtering** ($k$-Nearest Neighbors across a 29+ million user rating matrix). It seamlessly blends machine learning vector calculations with live **TMDB API v3** metadata to deliver instantaneous, high-precision recommendations in a glassmorphic single-page web environment.

---

## 🔮 Quantum Engine Features

<table width="100%">
  <tr>
    <td width="50%">
      <h3>🌌 Vector Space Similarity</h3>
      <p>High-dimensional cosine distance similarity vectors computed over 29M+ ratings using <code>scikit-learn</code> <code>NearestNeighbors</code>.</p>
    </td>
    <td width="50%">
      <h3>⚡ Sparse CSR Pipeline</h3>
      <p>Memory-optimized chunked processing pipeline transforming raw rating datasets into compressed sparse CSR matrices without RAM exhaustion.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🖼️ TMDB Live Metadata 4K</h3>
      <p>Dynamic live fetching of high-res 4K backdrops, poster artwork, vote metrics, genre tags, and official synopses via TMDB API v3.</p>
    </td>
    <td width="50%">
      <h3>🎨 Glassmorphic Interface</h3>
      <p>State-of-the-art dark mode single-page application featuring glowing neon accents, dynamic backdrop blurs, and liquid smooth transitions.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💎 Chain Discovery Engine</h3>
      <p>Interactive 1-click discovery loop: click any movie card to instantly spawn fresh recommendations for that title on the fly.</p>
    </td>
    <td width="50%">
      <h3>🚀 1-Click Launch Automation</h3>
      <p>Includes an automated PowerShell launcher script (<code>start_project.ps1</code>) to start the API backend & UI frontend in parallel.</p>
    </td>
  </tr>
</table>

---

## 🏗️ Futuristic System Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Movie Enthusiast
    participant UI as 🎨 Glassmorphic UI (index.html / script.js)
    participant API as ⚡ FastAPI Core (main.py)
    participant Rec as 🧠 Recommender Matrix (recommender.py)
    participant Model as 📐 Sparse k-NN (collaborative_model.pkl)
    participant TMDB as 🎬 TMDB API v3

    User->>UI: Types title ("Dark Knight") & clicks Discover
    UI->>API: GET /recommend?movie=Dark%20Knight&limit=10
    API->>Rec: get_recommendations("Dark Knight", 10)
    Rec->>Rec: Map title -> MovieLens ID (58559)
    Rec->>TMDB: Fetch metadata & high-res posters
    TMDB-->>Rec: Poster, backdrop, overview, ratings
    Rec->>Model: Compute Cosine Distance (n_neighbors=11)
    Model-->>Rec: Nearest neighbor indices & distances
    loop For each recommended movie
        Rec->>TMDB: Live metadata & poster fetch
        TMDB-->>Rec: Enriched metadata object
    end
    Rec-->>API: JSON recommendation payload
    API-->>UI: HTTP 200 OK JSON Response
    UI->>UI: Renders Spotlight & Recommendations Grid
```

---

## 🛠️ High-Tech Matrix

| Layer | Technologies |
| :--- | :--- |
| **Backend Engine** | ![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white) ![Uvicorn](https://img.shields.io/badge/Uvicorn-0.22+-499848?style=flat-square) ![Scikit-Learn](https://img.shields.io/badge/Scikit_Learn-1.3+-F7931E?style=flat-square&logo=scikit-learn&logoColor=white) ![Pandas](https://img.shields.io/badge/Pandas-2.0+-150458?style=flat-square&logo=pandas&logoColor=white) |
| **Frontend UI** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![CSS3](https://img.shields.io/badge/CSS3_Glassmorphism-1572B6?style=flat-square&logo=css3&logoColor=white) ![Google Outfit](https://img.shields.io/badge/Google_Fonts-Outfit-4285F4?style=flat-square&logo=google&logoColor=white) |
| **Data Enrichment** | ![TMDB](https://img.shields.io/badge/TMDB_API-v3-01b4e4?style=flat-square&logo=themoviedb&logoColor=white) ![MovieLens](https://img.shields.io/badge/MovieLens-29M+_Ratings-FF6F00?style=flat-square) |

---

## 🚀 Launch Engine (Quick Start)

### 1. Prerequisites
- **Python 3.10** or higher
- Free TMDB API Access Token ([Get Token](https://www.themoviedb.org/settings/api))

### 2. Environment Setup

```bash
# Clone repository
git clone https://github.com/Nersu-Abhinav/CineMatch-AI.git
cd CineMatch-AI

# Create virtual environment
python -m venv venv

# Activate Virtual Environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pandas numpy scipy scikit-learn joblib requests python-dotenv
```

### 3. Environment Variables
Copy `.env.example` to `.env` and set your TMDB API Token:

```bash
cp .env.example .env
```

```env
TMDB_API_TOKEN=your_tmdb_read_access_token_here
```

### 4. Train Model & Launch

```bash
# 1. Filter raw ratings to top 5,000 catalog items
python prepare_data.py

# 2. Train Collaborative Nearest-Neighbors Model
python train_collaborative.py
```

> [!TIP]
> **1-Click Launch (Windows PowerShell)**:
> ```powershell
> .\start_project.ps1
> ```

---

## 📁 Cyber File Matrix

```
CineMatch-AI/
├── 📁 backend/
│   ├── main.py                # FastAPI routes & CORS setup
│   └── recommender.py         # 3-tier recommendation cascade engine
├── 📁 data/                      # MovieLens links & dataset files
├── 📁 frontend/
│   ├── index.html             # Application structure & glass layout
│   ├── script.js              # State engine & dynamic TMDB pipeline
│   └── style.css              # Custom dark-mode glassmorphic styling
├── 📁 model/                     # Serialized k-NN model artifacts (.pkl)
├── movie_metadata.py          # MovieLens ID to TMDB API bridge
├── prepare_data.py            # Chunked data filtering pipeline
├── recommend_collaborative.py # CLI recommendation test script
├── start_project.ps1          # 1-click Windows PowerShell launcher
├── tmdb.py                    # TMDB API v3 client wrapper
├── train_collaborative.py     # NearestNeighbors sparse model trainer
├── .env.example               # Environment variables template
└── README.md                  # Project documentation & reference
```

---

<div align="center">

## 🌟 Support & Feedback

If you enjoy using **CineMatch AI**, please consider giving this repository a ⭐ **Star** on GitHub!

<br>

<a href="https://github.com/Nersu-Abhinav/CineMatch-AI/stargazers">
  <img src="https://img.shields.io/github/stars/Nersu-Abhinav/CineMatch-AI?style=for-the-badge&color=f5c518&logo=github&logoColor=black" alt="GitHub Stars" />
</a>
<a href="https://github.com/Nersu-Abhinav/CineMatch-AI/network/members">
  <img src="https://img.shields.io/github/forks/Nersu-Abhinav/CineMatch-AI?style=for-the-badge&color=06b6d4&logo=github&logoColor=black" alt="GitHub Forks" />
</a>

<br><br>

<a href="#top">
  <img src="https://img.shields.io/badge/🚀_LAUNCH_TO_TOP-f5c518?style=for-the-badge&logoColor=black" alt="Back to Top" />
</a>

<br><br>

> *"May the recommendations be with you."* 🍿

**Crafted with ❤️ for movie lovers worldwide.**

*Powered by MovieLens Datasets & TMDB API v3*

© 2026 **CineMatch AI**. Distributed under the [MIT License](LICENSE).

---

</div>
