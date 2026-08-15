// ==========================================================================
// CINEMATCH AI — FRONTEND APPLICATION ENGINE (PURE IN-MEMORY STATE)
// ==========================================================================

const API_URL = "http://127.0.0.1:8000";

// --------------------------------------------------------------------------
// 01. APPLICATION IN-MEMORY STATE (STRICTLY NO LOCALSTORAGE)
// --------------------------------------------------------------------------
const appState = {
    selectedMovie: null,
    recommendations: [],
    filteredRecommendations: [],
    limit: 10,
    sortBy: "match",      // 'match' | 'rating' | 'year_desc' | 'year_asc' | 'title'
    filterGenre: "all",
    minRating: 0,
    viewMode: "grid",     // 'grid' | 'list'
    sessionHistory: [],   // Array of strings kept in JS memory only
    isSearching: false
};

// --------------------------------------------------------------------------
// 02. DOM ELEMENT REFERENCES
// --------------------------------------------------------------------------
const searchInput = document.getElementById("movieSearch");
const searchButton = document.getElementById("searchButton");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchError = document.getElementById("searchError");
const loadingOverlay = document.getElementById("loading");

const selectedSection = document.getElementById("selectedMovieSection");
const selectedMovieContainer = document.getElementById("selectedMovie");

const recommendationsSection = document.getElementById("recommendations");
const movieGrid = document.getElementById("movieGrid");
const recommendationCount = document.getElementById("recommendationCount");
const noResultsAlert = document.getElementById("noResultsAlert");

const backdrop = document.getElementById("backdrop");
const genreFilterSelect = document.getElementById("genreFilterSelect");
const gridViewBtn = document.getElementById("gridViewBtn");
const listViewBtn = document.getElementById("listViewBtn");

const movieModal = document.getElementById("movieModal");
const modalMovieBody = document.getElementById("modalMovie");
const architectureModal = document.getElementById("architectureModal");

const recentSearchSection = document.getElementById("recentSearchSection");
const recentChips = document.getElementById("recentChips");

// --------------------------------------------------------------------------
// 03. EVENT LISTENERS & INITIALIZATION
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // Input listener to toggle clear button visibility
    searchInput.addEventListener("input", (e) => {
        if (e.target.value.trim().length > 0) {
            clearSearchBtn.classList.remove("hidden");
        } else {
            clearSearchBtn.classList.add("hidden");
        }
    });

    // Keydown listener for Enter search & Keyboard '/' shortcut
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && document.activeElement === searchInput) {
            searchMovie();
        } else if (e.key === "/" && document.activeElement !== searchInput) {
            // Prevent forward slash typing into focus
            e.preventDefault();
            focusSearch();
        } else if (e.key === "Escape") {
            closeModal();
            closeArchitectureModal();
        }
    });
});

function focusSearch() {
    searchInput.focus();
    searchInput.select();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearSearch() {
    searchInput.value = "";
    clearSearchBtn.classList.add("hidden");
    searchInput.focus();
}

function updateLimit(val) {
    appState.limit = parseInt(val, 10) || 10;
    // Re-run search if a movie is currently displayed
    if (appState.selectedMovie) {
        searchMovie(appState.selectedMovie.title);
    }
}

function quickSearch(title) {
    searchInput.value = title;
    clearSearchBtn.classList.remove("hidden");
    searchMovie(title);
}

// --------------------------------------------------------------------------
// 04. CORE SEARCH & API FETCHING PIPELINE
// --------------------------------------------------------------------------
async function searchMovie(queryOverride = null) {
    const movieName = (queryOverride || searchInput.value).trim();

    if (!movieName) {
        showSearchError("Please enter a movie title to discover recommendations.");
        searchInput.focus();
        return;
    }

    hideSearchError();
    showLoading();

    try {
        const fetchUrl = `${API_URL}/recommend?movie=${encodeURIComponent(movieName)}&limit=${appState.limit}`;
        const response = await fetch(fetchUrl);

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}. Ensure backend is running.`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || "Movie not found in vector database.");
        }

        // Update state
        appState.selectedMovie = data.selected_movie;
        appState.recommendations = data.recommendations || [];

        // Push into in-memory session history
        addSessionHistory(data.selected_movie.title);

        // Populate dynamic genre filter pills from recommendations
        populateGenreDropdown();

        // Apply active sorting and filtering
        applyFiltersAndSort();

        // Render UI Components
        renderSelectedMovie();
        updateBackdrop(data.selected_movie.backdrop_url);

        // Smooth scroll to results
        setTimeout(() => {
            selectedSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);

    } catch (err) {
        console.error("CineMatch Search Error:", err);
        showSearchError(err.message || "Unable to fetch recommendations. Please check API server.");
    } finally {
        hideLoading();
    }
}

// --------------------------------------------------------------------------
// 05. IN-MEMORY SESSION HISTORY MANAGEMENT (NO LOCALSTORAGE)
// --------------------------------------------------------------------------
function addSessionHistory(title) {
    if (!title) return;
    // Prevent duplicates & keep top 5
    appState.sessionHistory = appState.sessionHistory.filter(item => item.toLowerCase() !== title.toLowerCase());
    appState.sessionHistory.unshift(title);
    if (appState.sessionHistory.length > 5) {
        appState.sessionHistory.pop();
    }
    renderSessionHistory();
}

function renderSessionHistory() {
    if (appState.sessionHistory.length === 0) {
        recentSearchSection.classList.add("hidden");
        return;
    }
    recentSearchSection.classList.remove("hidden");
    recentChips.innerHTML = appState.sessionHistory.map(title => `
        <button class="recent-chip" onclick="quickSearch('${escapeHtml(title)}')">
            ${escapeHtml(title)}
        </button>
    `).join("");
}

function clearSessionHistory() {
    appState.sessionHistory = [];
    renderSessionHistory();
}

// --------------------------------------------------------------------------
// 06. IN-MEMORY FILTERING & SORTING LOGIC
// --------------------------------------------------------------------------
function populateGenreDropdown() {
    const genresSet = new Set();
    appState.recommendations.forEach(m => {
        if (Array.isArray(m.genres)) {
            m.genres.forEach(g => genresSet.add(g));
        }
    });

    const sortedGenres = Array.from(genresSet).sort();
    
    let html = `<option value="all" ${appState.filterGenre === "all" ? "selected" : ""}>All Genres (${sortedGenres.length})</option>`;
    sortedGenres.forEach(g => {
        html += `<option value="${escapeHtml(g)}" ${appState.filterGenre === g ? "selected" : ""}>${escapeHtml(g)}</option>`;
    });
    
    genreFilterSelect.innerHTML = html;
}

function handleSortChange(sortVal) {
    appState.sortBy = sortVal;
    applyFiltersAndSort();
}

function handleGenreFilter(genreVal) {
    appState.filterGenre = genreVal;
    applyFiltersAndSort();
}

function handleRatingFilter(ratingVal, btnEl) {
    appState.minRating = parseFloat(ratingVal) || 0;
    
    // Update active button UI
    document.querySelectorAll(".rating-filter-buttons .filter-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    if (btnEl) btnEl.classList.add("active");

    applyFiltersAndSort();
}

function resetFilters() {
    appState.sortBy = "match";
    appState.filterGenre = "all";
    appState.minRating = 0;

    document.getElementById("sortSelect").value = "match";
    genreFilterSelect.value = "all";
    
    document.querySelectorAll(".rating-filter-buttons .filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.rating === "0");
    });

    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let result = [...appState.recommendations];

    // Filter by Genre
    if (appState.filterGenre !== "all") {
        result = result.filter(m => Array.isArray(m.genres) && m.genres.includes(appState.filterGenre));
    }

    // Filter by Min Rating
    if (appState.minRating > 0) {
        result = result.filter(m => (m.rating || 0) >= appState.minRating);
    }

    // Sort
    result.sort((a, b) => {
        switch (appState.sortBy) {
            case "match":
                return (b.similarity || 0) - (a.similarity || 0);
            case "rating":
                return (b.rating || 0) - (a.rating || 0);
            case "year_desc":
                return getYear(b.release_date) - getYear(a.release_date);
            case "year_asc":
                return getYear(a.release_date) - getYear(b.release_date);
            case "title":
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    appState.filteredRecommendations = result;
    renderRecommendations();
}

function getYear(dateStr) {
    if (!dateStr) return 0;
    return parseInt(dateStr.substring(0, 4), 10) || 0;
}

// --------------------------------------------------------------------------
// 07. RENDER COMPONENT FUNCTIONS
// --------------------------------------------------------------------------
function renderSelectedMovie() {
    const movie = appState.selectedMovie;
    if (!movie) return;

    const poster = movie.poster_url || createFallbackPoster(movie.title);
    const year = movie.release_date ? movie.release_date.substring(0, 4) : "N/A";
    const rating = movie.rating ? Number(movie.rating).toFixed(1) : "N/A";
    
    const genrePills = (movie.genres || []).map(g => `<span class="genre-pill">${escapeHtml(g)}</span>`).join("");
    const tmdbLink = movie.tmdb_id ? `https://www.themoviedb.org/movie/${movie.tmdb_id}` : "#";

    selectedMovieContainer.innerHTML = `
        <div class="spotlight-poster-wrapper">
            <img class="spotlight-poster" src="${poster}" alt="${escapeHtml(movie.title)}" onerror="this.src='${createFallbackPoster(movie.title)}'">
        </div>
        <div class="spotlight-details">
            <h2>${escapeHtml(movie.title)}</h2>
            <div class="movie-meta-bar">
                <span class="rating-badge">★ ${rating}</span>
                <span class="year-badge">Released: ${year}</span>
                ${movie.tmdb_id ? `<span class="tmdb-badge">TMDB #${movie.tmdb_id}</span>` : ""}
            </div>
            <div class="genre-tags-list" style="margin-bottom: 20px;">
                ${genrePills}
            </div>
            <p class="synopsis">${escapeHtml(movie.overview || "No plot overview available for this title.")}</p>
            <div class="spotlight-actions">
                <button class="primary-action-btn" onclick="scrollToRecommendations()">Explore Recommendations ↓</button>
                ${movie.tmdb_id ? `<a class="secondary-action-btn" href="${tmdbLink}" target="_blank" rel="noopener">View on TMDB ↗</a>` : ""}
            </div>
        </div>
    `;

    selectedSection.classList.remove("hidden");
}

function scrollToRecommendations() {
    recommendationsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderRecommendations() {
    const movies = appState.filteredRecommendations;

    recommendationCount.textContent = `${movies.length} ${movies.length === 1 ? 'Match' : 'Matches'}`;

    if (movies.length === 0) {
        movieGrid.innerHTML = "";
        noResultsAlert.classList.remove("hidden");
        recommendationsSection.classList.remove("hidden");
        return;
    }

    noResultsAlert.classList.add("hidden");
    movieGrid.innerHTML = "";

    movies.forEach(movie => {
        const card = createMovieCard(movie);
        movieGrid.appendChild(card);
    });

    recommendationsSection.classList.remove("hidden");
}

function createMovieCard(movie) {
    const card = document.createElement("article");
    card.className = "movie-card";

    const poster = movie.poster_url || createFallbackPoster(movie.title);
    const year = movie.release_date ? movie.release_date.substring(0, 4) : "N/A";
    const rating = movie.rating ? Number(movie.rating).toFixed(1) : "N/A";
    const matchScore = Math.round((movie.similarity || 0) * 100);

    const matchClass = matchScore >= 80 ? "match-high" : "match-mid";

    card.innerHTML = `
        <div class="card-poster-wrapper">
            <span class="match-pill ${matchClass}">${matchScore}% MATCH</span>
            <img class="card-poster" src="${poster}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.src='${createFallbackPoster(movie.title)}'">
            <div class="card-gradient-overlay"></div>
        </div>
        <div class="card-info">
            <h3>${escapeHtml(movie.title)}</h3>
            <div class="card-meta">
                <span class="star-rating">★ ${rating}</span>
                <span>•</span>
                <span>${year}</span>
            </div>
            <p class="list-overview">${escapeHtml(movie.overview || "No overview available.")}</p>
        </div>
    `;

    card.addEventListener("click", () => openModal(movie));
    return card;
}

function switchView(mode) {
    appState.viewMode = mode;
    if (mode === "grid") {
        movieGrid.className = "movie-grid grid-mode";
        gridViewBtn.classList.add("active");
        listViewBtn.classList.remove("active");
    } else {
        movieGrid.className = "movie-grid list-mode";
        listViewBtn.classList.add("active");
        gridViewBtn.classList.remove("active");
    }
}

// --------------------------------------------------------------------------
// 08. ENDLESS DISCOVERY MODAL & CHAIN DISCOVERY
// --------------------------------------------------------------------------
function openModal(movie) {
    const poster = movie.poster_url || createFallbackPoster(movie.title);
    const year = movie.release_date ? movie.release_date.substring(0, 4) : "N/A";
    const rating = movie.rating ? Number(movie.rating).toFixed(1) : "N/A";
    const genres = (movie.genres || []).map(g => `<span class="genre-pill">${escapeHtml(g)}</span>`).join("");
    const tmdbLink = movie.tmdb_id ? `https://www.themoviedb.org/movie/${movie.tmdb_id}` : "#";

    modalMovieBody.innerHTML = `
        <div>
            <img class="modal-poster" src="${poster}" alt="${escapeHtml(movie.title)}" onerror="this.src='${createFallbackPoster(movie.title)}'">
        </div>
        <div class="modal-info">
            <h2>${escapeHtml(movie.title)}</h2>
            <div class="movie-meta-bar">
                <span class="rating-badge">★ ${rating}</span>
                <span class="year-badge">${year}</span>
                ${genres}
            </div>
            <p>${escapeHtml(movie.overview || "No overview available.")}</p>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <button class="chain-discover-btn" onclick="chainDiscover('${escapeJavaScriptString(movie.title)}')">
                    ⚡ Discover Movies Similar to This
                </button>
                ${movie.tmdb_id ? `<a class="secondary-action-btn" href="${tmdbLink}" target="_blank" rel="noopener">TMDB Details ↗</a>` : ""}
            </div>
        </div>
    `;

    movieModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    movieModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function openArchitectureModal(e) {
    if (e) e.preventDefault();
    architectureModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeArchitectureModal() {
    architectureModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function chainDiscover(title) {
    closeModal();
    searchInput.value = title;
    clearSearchBtn.classList.remove("hidden");
    searchMovie(title);
}

// --------------------------------------------------------------------------
// 09. BACKDROP & UTILITY HELPERS
// --------------------------------------------------------------------------
function updateBackdrop(backdropUrl) {
    if (!backdropUrl) {
        backdrop.classList.remove("active");
        return;
    }
    backdrop.style.backgroundImage = `url("${backdropUrl}")`;
    backdrop.classList.add("active");
}

function createFallbackPoster(title) {
    const text = encodeURIComponent(title || "Movie");
    return `https://placehold.co/500x750/0e0f17/f5c518?text=${text}`;
}

function showSearchError(msg) {
    searchError.textContent = msg;
    searchError.classList.remove("hidden");
}

function hideSearchError() {
    searchError.classList.add("hidden");
}

function showLoading() {
    loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
    loadingOverlay.classList.add("hidden");
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJavaScriptString(str) {
    if (!str) return "";
    return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}