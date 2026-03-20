/* =============================================
   history.js — History Panel Logic
   ============================================= */

const historyPanel = document.getElementById("historyPanel");
const historyList  = document.getElementById("historyList");

/** In-memory history array — most recent first. */
let history = [];

/**
 * Toggles the history panel open/closed.
 * Called by the "History" toggle in HTML.
 */
function toggleHistory() {
    historyPanel.classList.toggle("active");
}

/**
 * Adds an entry to history and re-renders the list.
 * @param {string} expression - The full expression string (e.g. "3 + 5")
 * @param {number|string} result - The computed result
 */
function addToHistory(expression, result) {
    history.unshift({ expression, result });
    renderHistory();
}

/**
 * Renders the current history array into the <ul>.
 */
function renderHistory() {
    historyList.innerHTML = history
        .map(item => `<li>${item.expression} = ${item.result}</li>`)
        .join("");
}

// Clear history button
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    history = [];
    historyList.innerHTML = "";
});