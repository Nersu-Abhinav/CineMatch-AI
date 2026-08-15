/* ==========================================================================
   CINEMATCH AI — LANDING PAGE INTERACTION SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Teaser Search Input Handler (Enter Key)
    const teaserInput = document.getElementById('landingSearchInput');
    if (teaserInput) {
        teaserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                launchSearchFromLanding();
            }
        });
    }
});

// Redirect to Recommendation App (frontend/index.html) with query param
function launchSearchFromLanding(movieTitle) {
    const input = document.getElementById('landingSearchInput');
    const query = movieTitle || (input ? input.value.trim() : '');

    const targetUrl = './frontend/index.html';
    if (query) {
        window.location.href = `${targetUrl}?search=${encodeURIComponent(query)}`;
    } else {
        window.location.href = targetUrl;
    }
}
