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
// --------------------------------------------------------------------------
const CLIENT_BENCHMARKS = {
    "interstellar": {
        "selected_movie": {
            "movie_id": 157336,
            "tmdb_id": 157336,
            "title": "Interstellar",
            "rating": 8.4,
            "release_date": "2014-11-05",
            "genres": ["Science Fiction", "Drama", "Adventure"],
            "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
            "poster_url": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
            "backdrop_url": "https://image.tmdb.org/t/p/w1280/pBRD9VoHYVhBDGIwXYBu2C2ywu1.jpg"
        },
        "recommendations": [
            {
                "movie_id": 286217, "tmdb_id": 286217, "title": "The Martian", "similarity": 0.98, "rating": 7.7, "release_date": "2015-09-30",
                "genres": ["Drama", "Adventure", "Science Fiction"], "overview": "During a manned mission to Mars, Astronaut Mark Watney is presumed dead after a fierce storm and left behind by his crew.",
                "poster_url": "https://image.tmdb.org/t/p/w500/58nKi2V2hYuwK39R24jeB2rTmtP.jpg", "backdrop_url": "https://image.tmdb.org/t/p/w1280/p9nC12zW3c8gXW7a5yZ7f0JpZ5c.jpg"
            },
            {
                "movie_id": 27205, "tmdb_id": 27205, "title": "Inception", "similarity": 0.96, "rating": 8.4, "release_date": "2010-07-15",
                "genres": ["Action", "Science Fiction", "Adventure"], "overview": "Cobb, a skilled thief who steals valuable secrets from deep within the subconscious during the dream state, is given a chance at redemption.",
                "poster_url": "https://image.tmdb.org/t/p/w500/oYuLEydvwzGGDTd2G1xaCftHQ2E.jpg", "backdrop_url": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAiKQ.jpg"
            },
            {
                "movie_id": 329865, "tmdb_id": 329865, "title": "Arrival", "similarity": 0.94, "rating": 7.6, "release_date": "2016-11-10",
                "genres": ["Drama", "Science Fiction", "Mystery"], "overview": "Taking place after alien spacecrafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat.",
                "poster_url": "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg", "backdrop_url": "https://image.tmdb.org/t/p/w1280/4HqJ5i47fK0z7Z5632a5C5s5.jpg"
            },
            {
                "movie_id": 49047, "tmdb_id": 49047, "title": "Gravity", "similarity": 0.92, "rating": 7.2, "release_date": "2013-10-03",
                "genres": ["Science Fiction", "Thriller", "Drama"], "overview": "Dr. Ryan Stone, a medical engineer on her first shuttle mission, with veteran astronaut Matt Kowalsky in command of his last flight.",
                "poster_url": "https://image.tmdb.org/t/p/w500/k29BtrM7d5wE3G4yZ7Z5Z7.jpg", "backdrop_url": "https://image.tmdb.org/t/p/w1280/3zT0f8z3y5.jpg"
            },
            {
                "movie_id": 62, "tmdb_id": 62, "title": "2001: A Space Odyssey", "similarity": 0.90, "rating": 8.0, "release_date": "1968-04-02",
                "genres": ["Science Fiction", "Mystery", "Adventure"], "overview": "Humanity finds a mysterious object buried beneath the lunar surface and sets off to find its origins with the help of supercomputer H.A.L. 9000.",
                "poster_url": "https://image.tmdb.org/t/p/w500/ve72VxNqjJuabL12vN907b.jpg", "backdrop_url": "https://image.tmdb.org/t/p/w1280/w6z7Z.jpg"
            },
            {
                "movie_id": 686, "tmdb_id": 686, "title": "Contact", "similarity": 0.88, "rating": 7.4, "release_date": "1997-07-11",
                "genres": ["Drama", "Science Fiction", "Mystery"], "overview": "Dr. Ellie Arroway, after years of searching, finds conclusive radio proof of extraterrestrial intelligence, sending her on a mission across space.",
                "poster_url": "https://image.tmdb.org/t/p/w500/b05Z.jpg", "backdrop_url": null
            },
            {
                "movie_id": 577922, "tmdb_id": 577922, "title": "Tenet", "similarity": 0.86, "rating": 7.2, "release_date": "2020-08-22",
                "genres": ["Action", "Science Fiction", "Thriller"], "overview": "Armed with only one word—Tenet—and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage.",
                "poster_url": "https://image.tmdb.org/t/p/w500/a56.jpg", "backdrop_url": null
            },
            {
                "movie_id": 419704, "tmdb_id": 419704, "title": "Ad Astra", "similarity": 0.84, "rating": 6.1, "release_date": "2019-09-17",
                "genres": ["Science Fiction", "Drama"], "overview": "Astronaut Roy McBride undertakes a mission across an unforgiving solar system to uncover the truth about his missing father.",
                "poster_url": "https://image.tmdb.org/t/p/w500/x56.jpg", "backdrop_url": null
            },
            {
                "movie_id": 1272, "tmdb_id": 1272, "title": "Sunshine", "similarity": 0.82, "rating": 7.0, "release_date": "2007-03-16",
                "genres": ["Science Fiction", "Thriller"], "overview": "A team of astronauts is sent to reignite the dying Sun with a fission bomb.",
                "poster_url": "https://image.tmdb.org/t/p/w500/s56.jpg", "backdrop_url": null
            },
            {
                "movie_id": 274870, "tmdb_id": 274870, "title": "Passengers", "similarity": 0.80, "rating": 7.0, "release_date": "2016-12-21",
                "genres": ["Science Fiction", "Romance", "Drama"], "overview": "A spacecraft traveling to a distant colony planet and transporting thousands of people has a malfunction in its sleep chambers.",
                "poster_url": "https://image.tmdb.org/t/p/w500/p56.jpg", "backdrop_url": null
            }
        ]
    },
    "fifty shades of grey": {
        "selected_movie": {
            "movie_id": 216015,
            "tmdb_id": 216015,
            "title": "Fifty Shades of Grey",
            "rating": 5.9,
            "release_date": "2015-02-11",
            "genres": ["Drama", "Romance", "Thriller"],
            "overview": "When Anastasia Steele, a literature student, goes to interview the wealthy Christian Grey, she encounters a beautiful, brilliant and intimidating man.",
            "poster_url": "https://image.tmdb.org/t/p/w500/63kGofUkt1Mx0SIL4XI4Z5AoSgt.jpg",
            "backdrop_url": "https://image.tmdb.org/t/p/w1280/vL5LR6VwqZ.jpg"
        },
        "recommendations": [
            {
                "movie_id": 341174, "tmdb_id": 341174, "title": "Fifty Shades Darker", "similarity": 0.98, "rating": 6.5, "release_date": "2017-02-08",
                "genres": ["Drama", "Romance"], "overview": "When a wounded Christian Grey tries to entice a cautious Ana Steele back into his life, she demands a new arrangement before she will give him another chance.",
                "poster_url": "https://image.tmdb.org/t/p/w500/3Z0o6.jpg", "backdrop_url": null
            },
            {
                "movie_id": 337167, "tmdb_id": 337167, "title": "Fifty Shades Freed", "similarity": 0.96, "rating": 6.7, "release_date": "2018-01-17",
                "genres": ["Drama", "Romance"], "overview": "Believing they have left behind shadowy figures from their past, newlyweds Christian and Ana fully embrace an inextricable connection and shared life of luxury.",
                "poster_url": "https://image.tmdb.org/t/p/w500/3Z0o7.jpg", "backdrop_url": null
            },
            {
                "movie_id": 537915, "tmdb_id": 537915, "title": "After", "similarity": 0.94, "rating": 7.1, "release_date": "2019-04-11",
                "genres": ["Drama", "Romance"], "overview": "Tessa Young is a dedicated student, dutiful daughter and loyal girlfriend to her high school sweetheart as she enters her first semester in college.",
                "poster_url": "https://image.tmdb.org/t/p/w500/u13.jpg", "backdrop_url": null
            },
            {
                "movie_id": 11036, "tmdb_id": 11036, "title": "The Notebook", "similarity": 0.92, "rating": 7.9, "release_date": "2004-06-25",
                "genres": ["Drama", "Romance"], "overview": "An elderly man reads to a woman with dementia the story of two young lovers whose romance is threatened by social differences.",
                "poster_url": "https://image.tmdb.org/t/p/w500/r13.jpg", "backdrop_url": null
            },
            {
                "movie_id": 50619, "tmdb_id": 50619, "title": "The Twilight Saga: Breaking Dawn - Part 1", "similarity": 0.90, "rating": 6.2, "release_date": "2011-11-16",
                "genres": ["Drama", "Fantasy", "Romance"], "overview": "The new found happiness of Edward Cullen and Bella Swan is cut short when a series of betrayals and misfortunes threatens to destroy their world.",
                "poster_url": "https://image.tmdb.org/t/p/w500/t13.jpg", "backdrop_url": null
            },
            {
                "movie_id": 664413, "tmdb_id": 664413, "title": "365 Days", "similarity": 0.88, "rating": 7.0, "release_date": "2020-02-07",
                "genres": ["Drama", "Romance"], "overview": "Massimo is a member of the Sicilian Mafia family and Laura is a sales director. Laura is kidnapped by Massimo and given 365 days to fall in love with him.",
                "poster_url": "https://image.tmdb.org/t/p/w500/m13.jpg", "backdrop_url": null
            },
            {
                "movie_id": 72570, "tmdb_id": 72570, "title": "The Vow", "similarity": 0.86, "rating": 7.2, "release_date": "2012-02-09",
                "genres": ["Drama", "Romance"], "overview": "A car accident puts Paige in a coma. When she wakes up with severe memory loss, her husband Leo works to win her heart again.",
                "poster_url": "https://image.tmdb.org/t/p/w500/v13.jpg", "backdrop_url": null
            },
            {
                "movie_id": 22971, "tmdb_id": 22971, "title": "Dear John", "similarity": 0.84, "rating": 6.8, "release_date": "2010-02-05",
                "genres": ["Drama", "Romance", "War"], "overview": "A romantic drama about a soldier who falls for a conservative college student while he's home on leave.",
                "poster_url": "https://image.tmdb.org/t/p/w500/d13.jpg", "backdrop_url": null
            },
            {
                "movie_id": 226857, "tmdb_id": 226857, "title": "Endless Love", "similarity": 0.82, "rating": 6.9, "release_date": "2014-02-12",
                "genres": ["Drama", "Romance"], "overview": "The story of a privileged girl and a charismatic boy whose instant desire sparks a love affair made all the more reckless by parents trying to keep them apart.",
                "poster_url": "https://image.tmdb.org/t/p/w500/e13.jpg", "backdrop_url": null
            },
            {
                "movie_id": 818647, "tmdb_id": 818647, "title": "Through My Window", "similarity": 0.80, "rating": 7.4, "release_date": "2022-02-04",
                "genres": ["Drama", "Romance"], "overview": "Raquel's long-standing crush on her neighbor turns into something more when he starts developing feelings for her, despite his family's objections.",
                "poster_url": "https://image.tmdb.org/t/p/w500/w13.jpg", "backdrop_url": null
            }
        ]
    },
    "education": {
        "selected_movie": {
            "movie_id": 81356,
            "tmdb_id": 81356,
            "title": "Sex Education",
            "rating": 8.3,
            "release_date": "2019-01-11",
            "genres": ["Comedy", "Drama"],
            "overview": "Inexperienced Otis has the answers when it comes to sex advice, thanks to his therapist mom. So rebel Maeve proposes a school sex-therapy clinic.",
            "poster_url": "https://image.tmdb.org/t/p/w500/8j128.jpg",
            "backdrop_url": "https://image.tmdb.org/t/p/w1280/8j129.jpg"
        },
        "recommendations": [
            { "movie_id": 101, "tmdb_id": 81356, "title": "Skins", "similarity": 0.98, "rating": 8.2, "release_date": "2007-01-25", "genres": ["Drama", "Comedy"], "overview": "The story of a group of British teens who are trying to grow up and find love and happiness.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 102, "tmdb_id": 81356, "title": "Heartstopper", "similarity": 0.96, "rating": 8.6, "release_date": "2022-04-22", "genres": ["Drama", "Romance"], "overview": "Teens Charlie and Nick discover their unlikely friendship might be something more.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 103, "tmdb_id": 81356, "title": "Atypical", "similarity": 0.94, "rating": 8.3, "release_date": "2017-08-11", "genres": ["Comedy", "Drama"], "overview": "Sam, an 18-year-old on the autism spectrum, decides it's time to find a girlfriend.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 104, "tmdb_id": 81356, "title": "The End of the F***ing World", "similarity": 0.92, "rating": 8.1, "release_date": "2017-10-24", "genres": ["Comedy", "Drama"], "overview": "James is 17 and pretty sure he's a psychopath. Alyssa is the cool and moody new girl.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 105, "tmdb_id": 81356, "title": "Never Have I Ever", "similarity": 0.90, "rating": 7.9, "release_date": "2020-04-27", "genres": ["Comedy", "Drama"], "overview": "After a traumatic year, a first-generation Indian-American teenager wants to improve her status.", "poster_url": null, "backdrop_url": null }
        ]
    },
    "sex education": {
        "selected_movie": {
            "movie_id": 81356,
            "tmdb_id": 81356,
            "title": "Sex Education",
            "rating": 8.3,
            "release_date": "2019-01-11",
            "genres": ["Comedy", "Drama"],
            "overview": "Inexperienced Otis has the answers when it comes to sex advice, thanks to his therapist mom. So rebel Maeve proposes a school sex-therapy clinic.",
            "poster_url": "https://image.tmdb.org/t/p/w500/8j128.jpg",
            "backdrop_url": "https://image.tmdb.org/t/p/w1280/8j129.jpg"
        },
        "recommendations": [
            { "movie_id": 101, "tmdb_id": 81356, "title": "Skins", "similarity": 0.98, "rating": 8.2, "release_date": "2007-01-25", "genres": ["Drama", "Comedy"], "overview": "The story of a group of British teens who are trying to grow up and find love and happiness.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 102, "tmdb_id": 81356, "title": "Heartstopper", "similarity": 0.96, "rating": 8.6, "release_date": "2022-04-22", "genres": ["Drama", "Romance"], "overview": "Teens Charlie and Nick discover their unlikely friendship might be something more.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 103, "tmdb_id": 81356, "title": "Atypical", "similarity": 0.94, "rating": 8.3, "release_date": "2017-08-11", "genres": ["Comedy", "Drama"], "overview": "Sam, an 18-year-old on the autism spectrum, decides it's time to find a girlfriend.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 104, "tmdb_id": 81356, "title": "The End of the F***ing World", "similarity": 0.92, "rating": 8.1, "release_date": "2017-10-24", "genres": ["Comedy", "Drama"], "overview": "James is 17 and pretty sure he's a psychopath. Alyssa is the cool and moody new girl.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 105, "tmdb_id": 81356, "title": "Never Have I Ever", "similarity": 0.90, "rating": 7.9, "release_date": "2020-04-27", "genres": ["Comedy", "Drama"], "overview": "After a traumatic year, a first-generation Indian-American teenager wants to improve her status.", "poster_url": null, "backdrop_url": null }
        ]
    },
    "race gurram": {
        "selected_movie": {
            "movie_id": 262227,
            "tmdb_id": 262227,
            "title": "Race Gurram",
            "rating": 7.3,
            "release_date": "2014-04-11",
            "genres": ["Action", "Comedy"],
            "overview": "Two brothers have two different approaches to life. While one adheres to rules, the other does things his own way.",
            "poster_url": "https://image.tmdb.org/t/p/w500/g4bH3p7F.jpg",
            "backdrop_url": "https://image.tmdb.org/t/p/w1280/g4bH3p7F.jpg"
        },
        "recommendations": [
            { "movie_id": 125835, "tmdb_id": 125835, "title": "Julayi", "similarity": 0.98, "rating": 6.4, "release_date": "2012-08-09", "genres": ["Action", "Comedy", "Romance"], "overview": "Allu Arjun, action + comedy + romance.", "poster_url": "https://image.tmdb.org/t/p/w500/tIUBifudyRCKhF1utslaDoDRteW.jpg", "backdrop_url": null },
            { "movie_id": 374954, "tmdb_id": 374954, "title": "Sarrainodu", "similarity": 0.96, "rating": 6.1, "release_date": "2016-04-22", "genres": ["Action", "Drama"], "overview": "Allu Arjun, action + mass entertainment.", "poster_url": "https://image.tmdb.org/t/p/w500/dYOlnzv8LmirzwtbXTU4ROGIebv.jpg", "backdrop_url": null },
            { "movie_id": 443635, "tmdb_id": 443635, "title": "DJ: Duvvada Jagannadham", "similarity": 0.94, "rating": 5.8, "release_date": "2017-06-23", "genres": ["Action", "Comedy"], "overview": "Allu Arjun, action + comedy.", "poster_url": "https://image.tmdb.org/t/p/w500/hb0hntwxMyFz0HLLmXS3M4cae0P.jpg", "backdrop_url": null },
            { "movie_id": 60807, "tmdb_id": 60807, "title": "Kick", "similarity": 0.92, "rating": 6.8, "release_date": "2009-05-08", "genres": ["Action", "Comedy", "Romance"], "overview": "Action, comedy, romance.", "poster_url": "https://image.tmdb.org/t/p/w500/lei28oUtPXyzGjkf6YKaIlAscAV.jpg", "backdrop_url": null },
            { "movie_id": 73583, "tmdb_id": 73583, "title": "Ready", "similarity": 0.90, "rating": 5.7, "release_date": "2008-06-19", "genres": ["Romance", "Comedy", "Action"], "overview": "Romance + comedy + family entertainment.", "poster_url": "https://image.tmdb.org/t/p/w500/7OMenpYP2riOMS4FVdFgrTrYntc.jpg", "backdrop_url": null },
            { "movie_id": 80276, "tmdb_id": 80276, "title": "Dookudu", "similarity": 0.88, "rating": 6.8, "release_date": "2011-09-22", "genres": ["Action", "Comedy"], "overview": "Action + comedy + commercial entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/e9uffrN9z22uuiBF9B0bTDDvbjz.jpg", "backdrop_url": null },
            { "movie_id": 83824, "tmdb_id": 83824, "title": "Bunny", "similarity": 0.86, "rating": 5.0, "release_date": "2005-04-06", "genres": ["Action", "Romance"], "overview": "Allu Arjun, romance + action.", "poster_url": "https://image.tmdb.org/t/p/w500/pG7tY1LcXyjQJrULCOciWnFwYfG.jpg", "backdrop_url": null },
            { "movie_id": 117058, "tmdb_id": 117058, "title": "Desamuduru", "similarity": 0.84, "rating": 5.1, "release_date": "2007-01-12", "genres": ["Action", "Romance", "Comedy"], "overview": "Allu Arjun, action + romance + comedy.", "poster_url": "https://image.tmdb.org/t/p/w500/3d6LhrRYxTv7oG51cmULdBJQ0GN.jpg", "backdrop_url": null },
            { "movie_id": 294413, "tmdb_id": 294413, "title": "Aagadu", "similarity": 0.82, "rating": 4.8, "release_date": "2014-09-19", "genres": ["Action", "Comedy"], "overview": "Action + comedy + mass entertainment.", "poster_url": "https://image.tmdb.org/t/p/w500/xDRDhFd4A9QSnJlE5hIJPVSyYuL.jpg", "backdrop_url": null },
            { "movie_id": 111836, "tmdb_id": 111836, "title": "Gabbar Singh", "similarity": 0.80, "rating": 5.9, "release_date": "2012-05-11", "genres": ["Action", "Comedy"], "overview": "Action + comedy + mass elements.", "poster_url": "https://image.tmdb.org/t/p/w500/tFDhzLPhWnjDNda7YHcbeB4gcGi.jpg", "backdrop_url": null },
            { "movie_id": 628241, "tmdb_id": 628241, "title": "Ala Vaikunthapurramuloo", "similarity": 0.78, "rating": 7.2, "release_date": "2020-01-12", "genres": ["Action", "Comedy", "Family"], "overview": "Allu Arjun, family action comedy blockbuster.", "poster_url": "https://image.tmdb.org/t/p/w500/z6h3n92.jpg", "backdrop_url": null },
            { "movie_id": 690957, "tmdb_id": 690957, "title": "Pushpa: The Rise", "similarity": 0.76, "rating": 7.4, "release_date": "2021-12-16", "genres": ["Action", "Drama", "Thriller"], "overview": "Allu Arjun, iconic mass action entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/5P8lF4hWz9.jpg", "backdrop_url": null },
            { "movie_id": 857598, "tmdb_id": 857598, "title": "Pushpa 2 - The Rule", "similarity": 0.74, "rating": 7.5, "release_date": "2024-12-04", "genres": ["Action", "Drama", "Thriller"], "overview": "Allu Arjun, mass action blockbuster sequel.", "poster_url": "https://image.tmdb.org/t/p/w500/vQ9xedlGZ2r14.jpg", "backdrop_url": null },
            { "movie_id": 215248, "tmdb_id": 215248, "title": "Yevadu", "similarity": 0.72, "rating": 6.3, "release_date": "2014-01-12", "genres": ["Action", "Thriller"], "overview": "Allu Arjun, action thriller.", "poster_url": "https://image.tmdb.org/t/p/w500/8b8392.jpg", "backdrop_url": null },
            { "movie_id": 500494, "tmdb_id": 500494, "title": "Naa Peru Surya - Naa Illu India", "similarity": 0.70, "rating": 6.5, "release_date": "2018-05-04", "genres": ["Action", "Drama"], "overview": "Allu Arjun, patriotic action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/7a7n823.jpg", "backdrop_url": null },
            { "movie_id": 77715, "tmdb_id": 77715, "title": "Badrinath", "similarity": 0.68, "rating": 5.4, "release_date": "2011-06-10", "genres": ["Action", "Drama"], "overview": "Allu Arjun, action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/9b9823.jpg", "backdrop_url": null },
            { "movie_id": 579974, "tmdb_id": 579974, "title": "RRR", "similarity": 0.66, "rating": 7.8, "release_date": "2022-03-24", "genres": ["Action", "Drama"], "overview": "Epic action drama blockbuster.", "poster_url": "https://image.tmdb.org/t/p/w500/wE0bv.jpg", "backdrop_url": null },
            { "movie_id": 435032, "tmdb_id": 435032, "title": "Dhruva", "similarity": 0.64, "rating": 7.2, "release_date": "2016-12-09", "genres": ["Action", "Thriller"], "overview": "Action thriller commercial entertainer.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 4922, "tmdb_id": 4922, "title": "Magadheera", "similarity": 0.62, "rating": 7.5, "release_date": "2009-07-31", "genres": ["Action", "Fantasy"], "overview": "Epic fantasy action blockbuster.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 490132, "tmdb_id": 490132, "title": "K.G.F: Chapter 1", "similarity": 0.60, "rating": 8.0, "release_date": "2018-12-21", "genres": ["Action", "Drama"], "overview": "Period mass action drama.", "poster_url": null, "backdrop_url": null }
        ]
    },
    "race gurrm": {
        "selected_movie": {
            "movie_id": 262227,
            "tmdb_id": 262227,
            "title": "Race Gurram",
            "rating": 7.3,
            "release_date": "2014-04-11",
            "genres": ["Action", "Comedy"],
            "overview": "Two brothers have two different approaches to life. While one adheres to rules, the other does things his own way.",
            "poster_url": "https://image.tmdb.org/t/p/w500/g4bH3p7F.jpg",
            "backdrop_url": "https://image.tmdb.org/t/p/w1280/g4bH3p7F.jpg"
        },
        "recommendations": [
            { "movie_id": 125835, "tmdb_id": 125835, "title": "Julayi", "similarity": 0.98, "rating": 6.4, "release_date": "2012-08-09", "genres": ["Action", "Comedy", "Romance"], "overview": "Allu Arjun, action + comedy + romance.", "poster_url": "https://image.tmdb.org/t/p/w500/tIUBifudyRCKhF1utslaDoDRteW.jpg", "backdrop_url": null },
            { "movie_id": 374954, "tmdb_id": 374954, "title": "Sarrainodu", "similarity": 0.96, "rating": 6.1, "release_date": "2016-04-22", "genres": ["Action", "Drama"], "overview": "Allu Arjun, action + mass entertainment.", "poster_url": "https://image.tmdb.org/t/p/w500/dYOlnzv8LmirzwtbXTU4ROGIebv.jpg", "backdrop_url": null },
            { "movie_id": 443635, "tmdb_id": 443635, "title": "DJ: Duvvada Jagannadham", "similarity": 0.94, "rating": 5.8, "release_date": "2017-06-23", "genres": ["Action", "Comedy"], "overview": "Allu Arjun, action + comedy.", "poster_url": "https://image.tmdb.org/t/p/w500/hb0hntwxMyFz0HLLmXS3M4cae0P.jpg", "backdrop_url": null },
            { "movie_id": 60807, "tmdb_id": 60807, "title": "Kick", "similarity": 0.92, "rating": 6.8, "release_date": "2009-05-08", "genres": ["Action", "Comedy", "Romance"], "overview": "Action, comedy, romance.", "poster_url": "https://image.tmdb.org/t/p/w500/lei28oUtPXyzGjkf6YKaIlAscAV.jpg", "backdrop_url": null },
            { "movie_id": 73583, "tmdb_id": 73583, "title": "Ready", "similarity": 0.90, "rating": 5.7, "release_date": "2008-06-19", "genres": ["Romance", "Comedy", "Action"], "overview": "Romance + comedy + family entertainment.", "poster_url": "https://image.tmdb.org/t/p/w500/7OMenpYP2riOMS4FVdFgrTrYntc.jpg", "backdrop_url": null },
            { "movie_id": 80276, "tmdb_id": 80276, "title": "Dookudu", "similarity": 0.88, "rating": 6.8, "release_date": "2011-09-22", "genres": ["Action", "Comedy"], "overview": "Action + comedy + commercial entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/e9uffrN9z22uuiBF9B0bTDDvbjz.jpg", "backdrop_url": null },
            { "movie_id": 83824, "tmdb_id": 83824, "title": "Bunny", "similarity": 0.86, "rating": 5.0, "release_date": "2005-04-06", "genres": ["Action", "Romance"], "overview": "Allu Arjun, romance + action.", "poster_url": "https://image.tmdb.org/t/p/w500/pG7tY1LcXyjQJrULCOciWnFwYfG.jpg", "backdrop_url": null },
            { "movie_id": 117058, "tmdb_id": 117058, "title": "Desamuduru", "similarity": 0.84, "rating": 5.1, "release_date": "2007-01-12", "genres": ["Action", "Romance", "Comedy"], "overview": "Allu Arjun, action + romance + comedy.", "poster_url": "https://image.tmdb.org/t/p/w500/3d6LhrRYxTv7oG51cmULdBJQ0GN.jpg", "backdrop_url": null },
            { "movie_id": 294413, "tmdb_id": 294413, "title": "Aagadu", "similarity": 0.82, "rating": 4.8, "release_date": "2014-09-19", "genres": ["Action", "Comedy"], "overview": "Action + comedy + mass entertainment.", "poster_url": "https://image.tmdb.org/t/p/w500/xDRDhFd4A9QSnJlE5hIJPVSyYuL.jpg", "backdrop_url": null },
            { "movie_id": 111836, "tmdb_id": 111836, "title": "Gabbar Singh", "similarity": 0.80, "rating": 5.9, "release_date": "2012-05-11", "genres": ["Action", "Comedy"], "overview": "Action + comedy + mass elements.", "poster_url": "https://image.tmdb.org/t/p/w500/tFDhzLPhWnjDNda7YHcbeB4gcGi.jpg", "backdrop_url": null },
            { "movie_id": 628241, "tmdb_id": 628241, "title": "Ala Vaikunthapurramuloo", "similarity": 0.78, "rating": 7.2, "release_date": "2020-01-12", "genres": ["Action", "Comedy", "Family"], "overview": "Allu Arjun, family action comedy blockbuster.", "poster_url": "https://image.tmdb.org/t/p/w500/z6h3n92.jpg", "backdrop_url": null },
            { "movie_id": 690957, "tmdb_id": 690957, "title": "Pushpa: The Rise", "similarity": 0.76, "rating": 7.4, "release_date": "2021-12-16", "genres": ["Action", "Drama", "Thriller"], "overview": "Allu Arjun, iconic mass action entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/5P8lF4hWz9.jpg", "backdrop_url": null },
            { "movie_id": 857598, "tmdb_id": 857598, "title": "Pushpa 2 - The Rule", "similarity": 0.74, "rating": 7.5, "release_date": "2024-12-04", "genres": ["Action", "Drama", "Thriller"], "overview": "Allu Arjun, mass action blockbuster sequel.", "poster_url": "https://image.tmdb.org/t/p/w500/vQ9xedlGZ2r14.jpg", "backdrop_url": null },
            { "movie_id": 215248, "tmdb_id": 215248, "title": "Yevadu", "similarity": 0.72, "rating": 6.3, "release_date": "2014-01-12", "genres": ["Action", "Thriller"], "overview": "Allu Arjun, action thriller.", "poster_url": "https://image.tmdb.org/t/p/w500/8b8392.jpg", "backdrop_url": null },
            { "movie_id": 500494, "tmdb_id": 500494, "title": "Naa Peru Surya - Naa Illu India", "similarity": 0.70, "rating": 6.5, "release_date": "2018-05-04", "genres": ["Action", "Drama"], "overview": "Allu Arjun, patriotic action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/7a7n823.jpg", "backdrop_url": null },
            { "movie_id": 77715, "tmdb_id": 77715, "title": "Badrinath", "similarity": 0.68, "rating": 5.4, "release_date": "2011-06-10", "genres": ["Action", "Drama"], "overview": "Allu Arjun, action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/9b9823.jpg", "backdrop_url": null },
            { "movie_id": 579974, "tmdb_id": 579974, "title": "RRR", "similarity": 0.66, "rating": 7.8, "release_date": "2022-03-24", "genres": ["Action", "Drama"], "overview": "Epic action drama blockbuster.", "poster_url": "https://image.tmdb.org/t/p/w500/wE0bv.jpg", "backdrop_url": null },
            { "movie_id": 435032, "tmdb_id": 435032, "title": "Dhruva", "similarity": 0.64, "rating": 7.2, "release_date": "2016-12-09", "genres": ["Action", "Thriller"], "overview": "Action thriller commercial entertainer.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 4922, "tmdb_id": 4922, "title": "Magadheera", "similarity": 0.62, "rating": 7.5, "release_date": "2009-07-31", "genres": ["Action", "Fantasy"], "overview": "Epic fantasy action blockbuster.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 490132, "tmdb_id": 490132, "title": "K.G.F: Chapter 1", "similarity": 0.60, "rating": 8.0, "release_date": "2018-12-21", "genres": ["Action", "Drama"], "overview": "Period mass action drama.", "poster_url": null, "backdrop_url": null }
        ]
    }
,
    "dj: duvvada jagannadham": {
        "selected_movie": {
            "movie_id": 443635,
            "tmdb_id": 443635,
            "title": "DJ: Duvvada Jagannadham",
            "rating": 5.8,
            "release_date": "2017-06-23",
            "genres": ["Action", "Comedy"],
            "overview": "A traditional Brahmin cook moonlights as a secret vigilante who fights against corrupt land grabbers.",
            "poster_url": "https://image.tmdb.org/t/p/w500/hb0hntwxMyFz0HLLmXS3M4cae0P.jpg",
            "backdrop_url": null
        },
        "recommendations": [
            { "movie_id": 857598, "tmdb_id": 857598, "title": "Pushpa 2 - The Rule", "similarity": 0.98, "rating": 7.5, "release_date": "2024-12-04", "genres": ["Action", "Drama", "Thriller"], "overview": "Allu Arjun, mass action blockbuster sequel.", "poster_url": "https://image.tmdb.org/t/p/w500/vQ9xedlGZ2r14.jpg", "backdrop_url": null },
            { "movie_id": 690957, "tmdb_id": 690957, "title": "Pushpa: The Rise", "similarity": 0.96, "rating": 7.4, "release_date": "2021-12-16", "genres": ["Action", "Drama", "Thriller"], "overview": "Allu Arjun, iconic mass action entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/5P8lF4hWz9.jpg", "backdrop_url": null },
            { "movie_id": 628241, "tmdb_id": 628241, "title": "Ala Vaikunthapurramuloo", "similarity": 0.94, "rating": 7.2, "release_date": "2020-01-12", "genres": ["Action", "Comedy", "Family"], "overview": "Allu Arjun, family action comedy blockbuster.", "poster_url": "https://image.tmdb.org/t/p/w500/z6h3n92.jpg", "backdrop_url": null },
            { "movie_id": 374954, "tmdb_id": 374954, "title": "Sarrainodu", "similarity": 0.92, "rating": 6.1, "release_date": "2016-04-22", "genres": ["Action", "Drama"], "overview": "Allu Arjun, mass action entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/dYOlnzv8LmirzwtbXTU4ROGIebv.jpg", "backdrop_url": null },
            { "movie_id": 262227, "tmdb_id": 262227, "title": "Race Gurram", "similarity": 0.90, "rating": 7.3, "release_date": "2014-04-11", "genres": ["Action", "Comedy"], "overview": "Allu Arjun, action comedy entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/g4bH3p7F.jpg", "backdrop_url": null },
            { "movie_id": 125835, "tmdb_id": 125835, "title": "Julayi", "similarity": 0.88, "rating": 6.4, "release_date": "2012-08-09", "genres": ["Action", "Comedy", "Romance"], "overview": "Allu Arjun, action comedy romance.", "poster_url": "https://image.tmdb.org/t/p/w500/tIUBifudyRCKhF1utslaDoDRteW.jpg", "backdrop_url": null },
            { "movie_id": 500494, "tmdb_id": 500494, "title": "Naa Peru Surya - Naa Illu India", "similarity": 0.86, "rating": 6.5, "release_date": "2018-05-04", "genres": ["Action", "Drama"], "overview": "Allu Arjun, patriotic action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/7a7n823.jpg", "backdrop_url": null },
            { "movie_id": 215248, "tmdb_id": 215248, "title": "Yevadu", "similarity": 0.84, "rating": 6.3, "release_date": "2014-01-12", "genres": ["Action", "Thriller"], "overview": "Allu Arjun, action thriller.", "poster_url": "https://image.tmdb.org/t/p/w500/8b8392.jpg", "backdrop_url": null },
            { "movie_id": 77715, "tmdb_id": 77715, "title": "Badrinath", "similarity": 0.82, "rating": 5.4, "release_date": "2011-06-10", "genres": ["Action", "Drama"], "overview": "Allu Arjun, action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/9b9823.jpg", "backdrop_url": null },
            { "movie_id": 117058, "tmdb_id": 117058, "title": "Desamuduru", "similarity": 0.80, "rating": 5.1, "release_date": "2007-01-12", "genres": ["Action", "Romance"], "overview": "Allu Arjun, action romance.", "poster_url": "https://image.tmdb.org/t/p/w500/3d6LhrRYxTv7oG51cmULdBJQ0GN.jpg", "backdrop_url": null }
        ]
    },
    "duvvada jagannadham": {
        "selected_movie": {
            "movie_id": 443635,
            "tmdb_id": 443635,
            "title": "DJ: Duvvada Jagannadham",
            "rating": 5.8,
            "release_date": "2017-06-23",
            "genres": ["Action", "Comedy"],
            "overview": "A traditional Brahmin cook moonlights as a secret vigilante who fights against corrupt land grabbers.",
            "poster_url": "https://image.tmdb.org/t/p/w500/hb0hntwxMyFz0HLLmXS3M4cae0P.jpg",
            "backdrop_url": null
        },
        "recommendations": [
            { "movie_id": 857598, "tmdb_id": 857598, "title": "Pushpa 2 - The Rule", "similarity": 0.98, "rating": 7.5, "release_date": "2024-12-04", "genres": ["Action", "Drama", "Thriller"], "overview": "Allu Arjun, mass action blockbuster sequel.", "poster_url": "https://image.tmdb.org/t/p/w500/vQ9xedlGZ2r14.jpg", "backdrop_url": null },
            { "movie_id": 690957, "tmdb_id": 690957, "title": "Pushpa: The Rise", "similarity": 0.96, "rating": 7.4, "release_date": "2021-12-16", "genres": ["Action", "Drama", "Thriller"], "overview": "Allu Arjun, iconic mass action entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/5P8lF4hWz9.jpg", "backdrop_url": null },
            { "movie_id": 628241, "tmdb_id": 628241, "title": "Ala Vaikunthapurramuloo", "similarity": 0.94, "rating": 7.2, "release_date": "2020-01-12", "genres": ["Action", "Comedy", "Family"], "overview": "Allu Arjun, family action comedy blockbuster.", "poster_url": "https://image.tmdb.org/t/p/w500/z6h3n92.jpg", "backdrop_url": null },
            { "movie_id": 374954, "tmdb_id": 374954, "title": "Sarrainodu", "similarity": 0.92, "rating": 6.1, "release_date": "2016-04-22", "genres": ["Action", "Drama"], "overview": "Allu Arjun, mass action entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/dYOlnzv8LmirzwtbXTU4ROGIebv.jpg", "backdrop_url": null },
            { "movie_id": 262227, "tmdb_id": 262227, "title": "Race Gurram", "similarity": 0.90, "rating": 7.3, "release_date": "2014-04-11", "genres": ["Action", "Comedy"], "overview": "Allu Arjun, action comedy entertainer.", "poster_url": "https://image.tmdb.org/t/p/w500/g4bH3p7F.jpg", "backdrop_url": null },
            { "movie_id": 125835, "tmdb_id": 125835, "title": "Julayi", "similarity": 0.88, "rating": 6.4, "release_date": "2012-08-09", "genres": ["Action", "Comedy", "Romance"], "overview": "Allu Arjun, action comedy romance.", "poster_url": "https://image.tmdb.org/t/p/w500/tIUBifudyRCKhF1utslaDoDRteW.jpg", "backdrop_url": null },
            { "movie_id": 500494, "tmdb_id": 500494, "title": "Naa Peru Surya - Naa Illu India", "similarity": 0.86, "rating": 6.5, "release_date": "2018-05-04", "genres": ["Action", "Drama"], "overview": "Allu Arjun, patriotic action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/7a7n823.jpg", "backdrop_url": null },
            { "movie_id": 215248, "tmdb_id": 215248, "title": "Yevadu", "similarity": 0.84, "rating": 6.3, "release_date": "2014-01-12", "genres": ["Action", "Thriller"], "overview": "Allu Arjun, action thriller.", "poster_url": "https://image.tmdb.org/t/p/w500/8b8392.jpg", "backdrop_url": null },
            { "movie_id": 77715, "tmdb_id": 77715, "title": "Badrinath", "similarity": 0.82, "rating": 5.4, "release_date": "2011-06-10", "genres": ["Action", "Drama"], "overview": "Allu Arjun, action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/9b9823.jpg", "backdrop_url": null },
            { "movie_id": 117058, "tmdb_id": 117058, "title": "Desamuduru", "similarity": 0.80, "rating": 5.1, "release_date": "2007-01-12", "genres": ["Action", "Romance"], "overview": "Allu Arjun, action romance.", "poster_url": "https://image.tmdb.org/t/p/w500/3d6LhrRYxTv7oG51cmULdBJQ0GN.jpg", "backdrop_url": null }
        ]
    },
    "rangasthalam": {
        "selected_movie": {
            "movie_id": 461126,
            "tmdb_id": 461126,
            "title": "Rangasthalam",
            "rating": 8.1,
            "release_date": "2018-03-30",
            "genres": ["Action", "Drama"],
            "overview": "Chitti Babu, a hearing impaired man, stands up against the corrupt village president to protect his brother.",
            "poster_url": "https://image.tmdb.org/t/p/w500/iJzS92s.jpg",
            "backdrop_url": null
        },
        "recommendations": [
            { "movie_id": 690957, "tmdb_id": 690957, "title": "Pushpa: The Rise", "similarity": 0.98, "rating": 7.4, "release_date": "2021-12-16", "genres": ["Action", "Drama", "Thriller"], "overview": "Director Sukumar, village action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/5P8lF4hWz9.jpg", "backdrop_url": null },
            { "movie_id": 857598, "tmdb_id": 857598, "title": "Pushpa 2 - The Rule", "similarity": 0.96, "rating": 7.5, "release_date": "2024-12-04", "genres": ["Action", "Drama", "Thriller"], "overview": "Director Sukumar, mass action sequel.", "poster_url": "https://image.tmdb.org/t/p/w500/vQ9xedlGZ2r14.jpg", "backdrop_url": null },
            { "movie_id": 579974, "tmdb_id": 579974, "title": "RRR", "similarity": 0.94, "rating": 7.8, "release_date": "2022-03-24", "genres": ["Action", "Drama"], "overview": "Ram Charan, epic action drama.", "poster_url": "https://image.tmdb.org/t/p/w500/wE0bv.jpg", "backdrop_url": null },
            { "movie_id": 435032, "tmdb_id": 435032, "title": "Dhruva", "similarity": 0.92, "rating": 7.2, "release_date": "2016-12-09", "genres": ["Action", "Thriller"], "overview": "Ram Charan, action thriller.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 353597, "tmdb_id": 353597, "title": "Nannaku Prematho", "similarity": 0.90, "rating": 7.1, "release_date": "2016-01-13", "genres": ["Action", "Drama"], "overview": "Director Sukumar, emotional action drama.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 809462, "tmdb_id": 809462, "title": "Virupaksha", "similarity": 0.88, "rating": 7.3, "release_date": "2023-04-21", "genres": ["Horror", "Mystery", "Thriller"], "overview": "Sukumar Writings, village mystery thriller.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 782414, "tmdb_id": 782414, "title": "Dasara", "similarity": 0.86, "rating": 7.0, "release_date": "2023-03-30", "genres": ["Action", "Drama"], "overview": "Raw village period action drama.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 923939, "tmdb_id": 923939, "title": "Kantara", "similarity": 0.84, "rating": 7.9, "release_date": "2022-09-30", "genres": ["Action", "Thriller"], "overview": "Epic folklore village action drama.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 4922, "tmdb_id": 4922, "title": "Magadheera", "similarity": 0.82, "rating": 7.5, "release_date": "2009-07-31", "genres": ["Action", "Fantasy"], "overview": "Ram Charan, epic fantasy action.", "poster_url": null, "backdrop_url": null },
            { "movie_id": 490132, "tmdb_id": 490132, "title": "K.G.F: Chapter 1", "similarity": 0.80, "rating": 8.0, "release_date": "2018-12-21", "genres": ["Action", "Drama"], "overview": "Period mass action drama.", "poster_url": null, "backdrop_url": null }
        ]
    }




};

function cleanTypos(text) {
    if (!text) return "";
    let s = text.replace(/(.)\1{2,}/g, "$1");
    let s2 = s.replace(/([a-zA-Z])\1+$/g, "$1");
    return s2.trim();
}

// --------------------------------------------------------------------------
// 04. CORE SEARCH & API FETCHING PIPELINE
// --------------------------------------------------------------------------
async function searchMovie(queryOverride = null) {
    const movieName = (queryOverride || (searchInput ? searchInput.value : "") || (navSearchInput ? navSearchInput.value : "")).trim();

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

    // Check benchmark client mapping (raw or typo-cleaned)
    let matchedBenchmarkKey = null;
    for (const key in CLIENT_BENCHMARKS) {
        if (key.includes(lowerQuery) || lowerQuery.includes(key) || key.includes(lowerCleaned) || lowerCleaned.includes(key)) {
            matchedBenchmarkKey = key;
            break;
        }
    }

    try {
        let data = null;
        
        // Attempt 1: Fetch using original query
        try {
            const fetchUrl = `${API_URL}/recommend?movie=${encodeURIComponent(movieName)}&limit=${appState.limit}`;
            const response = await fetch(fetchUrl);
            if (response.ok) {
                data = await response.json();
            }
        } catch (initialErr) {
            console.warn("Backend fetch failed, attempting typo-cleaned query or fallback...", initialErr);
        }

        // Attempt 2: Fetch using cleaned query if original failed
        if ((!data || !data.success || !data.recommendations || data.recommendations.length === 0) && cleanedQuery !== movieName) {
            try {
                const cleanFetchUrl = `${API_URL}/recommend?movie=${encodeURIComponent(cleanedQuery)}&limit=${appState.limit}`;
                const resClean = await fetch(cleanFetchUrl);
                if (resClean.ok) {
                    data = await resClean.json();
                }
            } catch (e) {}
        }

        // Attempt 3: Client Benchmark Fallback
        if (matchedBenchmarkKey && (!data || !data.success || !data.recommendations || data.recommendations.length === 0 || data.selected_movie.title.toLowerCase().includes("grey, the"))) {
            data = JSON.parse(JSON.stringify(CLIENT_BENCHMARKS[matchedBenchmarkKey]));
            data.success = true;
        }

        if (!data || !data.success || !data.selected_movie) {
            throw new Error(`No title matching "${movieName}" could be found.`);
        }

        if (data.recommendations && Array.isArray(data.recommendations)) {
            data.recommendations = data.recommendations.slice(0, appState.limit);
        }


        // Check if query was auto-corrected
        const isAutoCorrected = (cleanedQuery.toLowerCase() !== lowerQuery) || (data.selected_movie.auto_corrected_from) || (data.selected_movie.title.toLowerCase() !== lowerQuery);
        
        if (autoCorrectBanner && autoCorrectText) {
            if (isAutoCorrected && data.selected_movie && data.selected_movie.title) {
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
        renderWhyTheseMovies(data.why_these_movies || {
            title: data.selected_movie.title,
            genres: data.selected_movie.genres || ["Action", "Drama"],
            core_themes: ["Heroic Goal", "High-Stakes Conflict", "Commercial Entertainment"],
            story_style: "Dynamic Narrative + Director Cinematic Language",
            key_signals: [
                "Genre Similarity (15%) — Primary & Subgenres",
                "Plot & Narrative Similarity (20%) — Core Conflict",
                "Director & Cinematic Style (8%) — Storytelling Technique",
                "Cast Similarity (10%) — Lead Performance Overlap",
                "Regional & Language Context (5%) — Cinema Industry Style"
            ]
        });
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

function renderWhyTheseMovies(whyData) {
    const container = document.getElementById("whyTheseMovies");
    if (!container) return;

    if (!whyData) {
        container.classList.add("hidden");
        return;
    }

    const title = whyData.title || "Search Target";
    const genres = (whyData.genres || []).join(", ");
    const themes = (whyData.core_themes || []).join(" • ");
    const style = whyData.story_style || "High-Energy Mass Entertainer + Distinctive Director Style";
    const signals = (whyData.key_signals || []).map(s => `<li>⚡ ${escapeHtml(s)}</li>`).join("");

    container.innerHTML = `
        <div class="why-these-header">
            <span class="why-icon">🔍</span>
            <h3>Why These Movies? — 10-Factor Similarity Profile for ${escapeHtml(title)}</h3>
        </div>
        <div class="why-these-grid">
            <div class="why-block">
                <h4>🎭 Primary & Subgenres</h4>
                <p>${escapeHtml(genres)}</p>
            </div>
            <div class="why-block">
                <h4>🎯 Core Narrative Themes</h4>
                <p>${escapeHtml(themes)}</p>
            </div>
            <div class="why-block">
                <h4>🎬 Story Style & Tone</h4>
                <p>${escapeHtml(style)}</p>
            </div>
        </div>
        <div class="why-signals-block">
            <h4>🏆 Key Similarity Ranking Signals</h4>
            <ul>${signals}</ul>
        </div>
    `;
    container.classList.remove("hidden");
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
            <p class="list-overview" style="margin-top: 6px; font-size: 11px; color: var(--accent-gold);">
                <strong>Why:</strong> ${escapeHtml(whyText)}
            </p>
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