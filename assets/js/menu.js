/* =============================================
   menu.js — Burger Button & Side Menu Toggle
   ============================================= */

const menu = document.getElementById("menu");

/**
 * Toggles the side navigation menu open/closed.
 * Called by the burger button's onclick in HTML.
 */
function toggleMenu() {
    menu.classList.toggle("active");
}

// Close menu when clicking outside of it
document.addEventListener("click", (e) => {
    const burger = document.querySelector(".burger");
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
        menu.classList.remove("active");
    }
});