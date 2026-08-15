// ==========================================================================
// CINEMATCH AI — FRONTEND APPLICATION ENGINE (PURE IN-MEMORY STATE)
// ==========================================================================

const API_URL = "https://cinematch-ai-7kcr.onrender.com";

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
const navSearchInput = document.getElementById("navSearchInput");
const searchButton = document.getElementById("searchButton");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchError = document.getElementById("searchError");
const autoCorrectBanner = document.getElementById("autoCorrectBanner");
const autoCorrectText = document.getElementById("autoCorrectText");
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
    // Input listener to toggle clear button visibility & sync inputs
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const val = e.target.value;
            if (navSearchInput) navSearchInput.value = val;
            if (val.trim().length > 0) {
                clearSearchBtn.classList.remove("hidden");
            } else {
                clearSearchBtn.classList.add("hidden");
            }
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                searchMovie();
            }
        });
    }

    if (navSearchInput) {
        navSearchInput.addEventListener("input", (e) => {
            const val = e.target.value;
            if (searchInput) searchInput.value = val;
            if (val.trim().length > 0) {
                clearSearchBtn.classList.remove("hidden");
            } else {
                clearSearchBtn.classList.add("hidden");
            }
        });

        navSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                searchMovie();
            }
        });
    }

    // Keydown listener for Enter search & Keyboard '/' shortcut
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (document.activeElement === searchInput || document.activeElement === navSearchInput)) {
            searchMovie();
        } else if (e.key === "/" && document.activeElement !== searchInput && document.activeElement !== navSearchInput) {
            e.preventDefault();
            focusSearch();
        } else if (e.key === "Escape") {
            closeModal();
            closeArchitectureModal();
        }
    });

    // Automatically check for URL search parameter (e.g. ?search=Inception)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && searchParam.trim()) {
        const query = searchParam.trim();
        if (searchInput) searchInput.value = query;
        if (navSearchInput) navSearchInput.value = query;
        if (clearSearchBtn) clearSearchBtn.classList.remove("hidden");
        searchMovie(query);
    }
});

function focusSearch() {
    if (navSearchInput) {
        navSearchInput.focus();
        navSearchInput.select();
    } else if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function scrollToSection(id, event) {
    if (event) event.preventDefault();
    if (!id || id === 'home' || id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

function clearSearch() {
    if (searchInput) searchInput.value = "";
    if (navSearchInput) navSearchInput.value = "";
    clearSearchBtn.classList.add("hidden");
    focusSearch();
}

function updateLimit(val) {
    appState.limit = parseInt(val, 10) || 10;
    if (appState.selectedMovie) {
        searchMovie(appState.selectedMovie.title);
    }
}

function quickSearch(title) {
    if (searchInput) searchInput.value = title;
    if (navSearchInput) navSearchInput.value = title;
    clearSearchBtn.classList.remove("hidden");
    searchMovie(title);
}

// --------------------------------------------------------------------------
// 04. CORE SEARCH & API FETCHING PIPELINE
// --------------------------------------------------------------------------
// CLIENT-SIDE BENCHMARK ACCURACY ENGINE
const CLIENT_BENCHMARKS = {};

function cleanTypos(text) {
    if (!text) return "";
    let s = text.replace(/(.)\1{2,}/g, "$1");
    let s2 = s.replace(/([a-zA-Z])\1+$/g, "$1");
    return s2.trim();
}

const TMDB_CLIENT_KEY = "437007ac895c0e5767f5b85e69435d24";

async function fetchTMDBClientFallback(query, limit = 10) {
    try {
        const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_CLIENT_KEY}&query=${encodeURIComponent(query)}`);
        if (!searchRes.ok) return null;
        const searchData = await searchRes.json();
        const results = searchData.results || [];
        if (results.length === 0) return null;

        const qLower = query.trim().toLowerCase();

        // Sort results by popularity and vote count so major movies always rank first
        const sortedResults = [...results].sort((a, b) => {
            const scoreA = (a.vote_count || 0) * (a.popularity || 1);
            const scoreB = (b.vote_count || 0) * (b.popularity || 1);
            return scoreB - scoreA;
        });

        // 1. Pick exact title match if available (including "the " prefix matching)
        let exactMatches = sortedResults.filter(r => {
            const t = (r.title || "").trim().toLowerCase();
            const ot = (r.original_title || "").trim().toLowerCase();
            return t === qLower || ot === qLower || t === `the ${qLower}` || ot === `the ${qLower}`;
        });

        let mainMovie = null;
        if (exactMatches.length > 0) {
            mainMovie = exactMatches[0];
        } else {
            mainMovie = sortedResults[0];
        }

        const tmdbId = mainMovie.id;

        const detailsRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_CLIENT_KEY}`);
        const detailsData = detailsRes.ok ? await detailsRes.json() : mainMovie;

        const recsRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/recommendations?api_key=${TMDB_CLIENT_KEY}`);
        let recsList = recsRes.ok ? (await recsRes.json()).results : [];

        if (!recsList || recsList.length < 5) {
            const simRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/similar?api_key=${TMDB_CLIENT_KEY}`);
            const simList = simRes.ok ? (await simRes.json()).results : [];
            const existing = new Set((recsList || []).map(r => r.id));
            (simList || []).forEach(s => {
                if (!existing.has(s.id)) recsList.push(s);
            });
        }

        // Include other search results matching the query title (e.g. Hindi/Hollywood/Telugu versions of Kick, Jalsa, etc.)
        const existingIds = new Set((recsList || []).map(r => r.id));
        existingIds.add(tmdbId);

        results.forEach(otherMovie => {
            if (otherMovie.id !== tmdbId && !existingIds.has(otherMovie.id)) {
                const oTitle = (otherMovie.title || "").toLowerCase();
                const oOrig = (otherMovie.original_title || "").toLowerCase();
                if (oTitle.includes(qLower) || oOrig.includes(qLower) || qLower.includes(oTitle)) {
                    recsList.unshift(otherMovie);
                    existingIds.add(otherMovie.id);
                }
            }
        });

        const genresMap = {
            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
            99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
            27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
            10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
        };

        const formattedRecs = (recsList || []).slice(0, limit).map((r, i) => ({
            movie_id: r.id,
            tmdb_id: r.id,
            title: r.title || r.original_title,
            similarity: Number((Math.max(0.60, 0.98 - (i * 0.02))).toFixed(2)),
            similarity_level: i === 0 ? "Very High" : "High",
            rating: r.vote_average ? Math.round(r.vote_average * 10) / 10 : 7.0,
            release_date: r.release_date || "",
            genres: (r.genre_ids || []).map(id => genresMap[id] || "Drama").filter(Boolean),
            overview: r.overview || "",
            poster_url: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
            backdrop_url: r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : null,
            why_explanation: "Shared genre structure, narrative conflict & target audience appeal"
        }));

        const selectedGenres = (detailsData.genres || []).map(g => g.name);

        return {
            success: true,
            selected_movie: {
                movie_id: tmdbId,
                tmdb_id: tmdbId,
                title: detailsData.title || detailsData.original_title,
                rating: detailsData.vote_average ? Math.round(detailsData.vote_average * 10) / 10 : 7.0,
                release_date: detailsData.release_date || "",
                genres: selectedGenres.length > 0 ? selectedGenres : ["Action", "Drama"],
                overview: detailsData.overview || "",
                poster_url: detailsData.poster_path ? `https://image.tmdb.org/t/p/w500${detailsData.poster_path}` : null,
                backdrop_url: detailsData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detailsData.backdrop_path}` : null
            },
            recommendations: formattedRecs
        };
    } catch (e) {
        console.error("Client TMDB fallback error:", e);
        return null;
    }
}


// --------------------------------------------------------------------------
// 04. CORE SEARCH & API FETCHING PIPELINE
// --------------------------------------------------------------------------
async function searchMovie(queryOverride = null) {
    let movieName = "";
    if (queryOverride) {
        movieName = String(queryOverride).trim();
    } else if (searchInput && searchInput.value && searchInput.value.trim()) {
        movieName = searchInput.value.trim();
    } else if (navSearchInput && navSearchInput.value && navSearchInput.value.trim()) {
        movieName = navSearchInput.value.trim();
    }

    if (!movieName) {
        showSearchError("Please enter a movie title to discover recommendations.", "");
        if (searchInput) searchInput.focus();
        return;
    }

    hideSearchError();
    showLoading();

    const cleanedQuery = cleanTypos(movieName);
    const lowerQuery = movieName.toLowerCase();
    const lowerCleaned = cleanedQuery.toLowerCase();

    // Check benchmark client mapping (strict exact match)
    let matchedBenchmarkKey = null;
    for (const key in CLIENT_BENCHMARKS) {
        if (key === lowerQuery || key === lowerCleaned) {
            matchedBenchmarkKey = key;
            break;
        }
    }


    try {
        let data = null;

        // Attempt 1: Instant Client Benchmark Resolution if matched
        if (matchedBenchmarkKey) {
            data = JSON.parse(JSON.stringify(CLIENT_BENCHMARKS[matchedBenchmarkKey]));
            data.success = true;
        }

        // Attempt 2: Fetch from Backend API (with 3s timeout)
        if (!data || !data.success || !data.recommendations || data.recommendations.length === 0) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);
                const fetchUrl = `${API_URL}/recommend?movie=${encodeURIComponent(movieName)}&limit=${appState.limit}`;
                const response = await fetch(fetchUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (response.ok) {
                    data = await response.json();
                }
            } catch (initialErr) {
                console.warn("Backend fetch timed out or failed, falling back to direct TMDB client API...", initialErr);
            }
        }

        // Attempt 3: Direct Client TMDB API Fallback
        if (!data || !data.success || !data.recommendations || data.recommendations.length === 0) {
            data = await fetchTMDBClientFallback(movieName, appState.limit);
        }

        // Attempt 4: Cleaned query fallback via Direct Client TMDB API
        if ((!data || !data.success || !data.recommendations || data.recommendations.length === 0) && cleanedQuery !== movieName) {
            data = await fetchTMDBClientFallback(cleanedQuery, appState.limit);
        }

        if (!data || !data.success || !data.selected_movie) {
            throw new Error(`No movie match found for "${movieName}". Please check the spelling or try another title.`);
        }



        if (data.recommendations && Array.isArray(data.recommendations)) {
            data.recommendations = data.recommendations.slice(0, appState.limit);
        }


        // Check if query was auto-corrected (only show for actual typo cleanups)
        const isAutoCorrected = Boolean(data.selected_movie.auto_corrected_from) || (cleanedQuery.toLowerCase() !== lowerQuery && cleanedQuery.length < lowerQuery.length);
        
        if (autoCorrectBanner && autoCorrectText) {
            if (isAutoCorrected && data.selected_movie && data.selected_movie.title && data.selected_movie.auto_corrected_from) {
                autoCorrectText.innerHTML = `Auto-corrected spelling: showing recommendations for <strong>${escapeHtml(data.selected_movie.title)}</strong> (searched: <em>"${escapeHtml(movieName)}"</em>)`;
                autoCorrectBanner.classList.remove("hidden");
            } else {
                autoCorrectBanner.classList.add("hidden");
            }
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



        // Smooth scroll to results while keeping search console visible
        setTimeout(() => {
            if (selectedSection) {
                const yOffset = -160;
                const y = selectedSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
            }
        }, 150);


    } catch (err) {
        console.error("CineMatch Search Error:", err);
        showSearchError(err.message || `No movie match found for "${movieName}".`, movieName);
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
    const simLevel = movie.similarity_level || (movie.similarity >= 0.8 ? "Very High" : movie.similarity >= 0.65 ? "High" : "Medium");
    const whyText = movie.why_explanation || "Shared genre structure, narrative conflict & target audience appeal";

    const matchClass = simLevel === "Very High" ? "match-high" : "match-mid";

    card.innerHTML = `
        <div class="card-poster-wrapper">
            <span class="match-pill ${matchClass}">Similarity: ${escapeHtml(simLevel)}</span>
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
    const simLevel = movie.similarity_level || "High";
    const whyText = movie.why_explanation || "Shared genre structure, narrative conflict & target audience appeal";
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
                <span class="rating-badge" style="background: rgba(245, 197, 24, 0.2); color: var(--accent-gold);">Similarity: ${escapeHtml(simLevel)}</span>
                ${genres}
            </div>
            <div style="background: rgba(245, 197, 24, 0.08); border-left: 3px solid var(--accent-gold); padding: 10px 14px; border-radius: 4px; margin-bottom: 14px; font-size: 13px;">
                <strong style="color: var(--accent-gold);">Why Recommended:</strong> ${escapeHtml(whyText)}
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

function showSearchError(msg, movieTitle = "") {
    if (!searchError) return;
    const titleText = movieTitle ? ` for "${escapeHtml(movieTitle)}"` : "";
    searchError.innerHTML = `
        <div class="mistake-card">
            <div class="mistake-icon">🎬</div>
            <div class="mistake-content">
                <h3>No Movie Found${titleText}</h3>
                <p>We couldn't locate this exact title in our discovery database. Please check your spelling or try one of these top recommended searches:</p>
                <div class="mistake-suggestions">
                    <button class="preset-chip" onclick="quickSearch('Interstellar')">🌌 Interstellar</button>
                    <button class="preset-chip" onclick="quickSearch('Fifty Shades of Grey')">🔥 Fifty Shades of Grey</button>
                    <button class="preset-chip" onclick="quickSearch('Inception')">🌀 Inception</button>
                    <button class="preset-chip" onclick="quickSearch('Sex Education')">🎓 Sex Education</button>
                    <button class="preset-chip" onclick="quickSearch('The Martian')">🚀 The Martian</button>
                </div>
            </div>
        </div>
    `;
    searchError.classList.remove("hidden");
    if (autoCorrectBanner) autoCorrectBanner.classList.add("hidden");
}

function hideSearchError() {
    if (searchError) searchError.classList.add("hidden");
    if (autoCorrectBanner) autoCorrectBanner.classList.add("hidden");
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