/* =============================================
   programmer.js — Programmer Calculator Logic
   ============================================= */

const resultEl   = document.getElementById("result");
const operationEl = document.getElementById("operation");

const hexDisplay = document.getElementById("hexDisplay");
const decDisplay = document.getElementById("decDisplay");
const octDisplay = document.getElementById("octDisplay");
const binDisplay = document.getElementById("binDisplay");

/* Current base: 'HEX' | 'DEC' | 'OCT' | 'BIN' */
let currentBase = "DEC";

/* Raw expression tokens */
let operation = [];

/* All valid operators */
const OPERATORS = ["+", "-", "*", "/", "&", "|", "^", "<<", ">>"];

/* ── Base Switch ── */
document.querySelectorAll(".base-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".base-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentBase = btn.dataset.base;
        updateButtonStates();
        updateBaseDisplays();
    });
});

/* Disable buttons that aren't valid for the current base */
function updateButtonStates() {
    document.querySelectorAll(".hex-btn").forEach(btn => {
        btn.disabled = currentBase === "OCT" || currentBase === "BIN" || currentBase === "DEC";
    });
    document.querySelectorAll("[data-num]").forEach(btn => {
        const num = parseInt(btn.dataset.num, 10);
        if (isNaN(num)) return;
        if (currentBase === "BIN") btn.disabled = num > 1;
        else if (currentBase === "OCT") btn.disabled = num > 7;
        else btn.disabled = false;
    });
}

/* ── Button Events ── */
document.querySelector(".buttons").addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn || btn.disabled) return;

    const num    = btn.dataset.num;
    const op     = btn.dataset.op;
    const action = btn.dataset.action;

    if (num    !== undefined) addNumber(num);
    if (op     !== undefined) addOperator(op);
    if (action === "clear")   clearAll();
    if (action === "delete")  deleteLast();
    if (action === "equal")   calculate();
    if (action === "not")     applyNOT();

    updateDisplay();
    updateBaseDisplays();
});

/* ── Input ── */
function addNumber(num) {
    operation.push(num);
}

function addOperator(op) {
    if (operation.length === 0) return;
    const last = operation[operation.length - 1];
    if (OPERATORS.includes(last)) {
        operation[operation.length - 1] = op;
    } else {
        operation.push(op);
    }
}

function clearAll() {
    operation = [];
    resultEl.textContent = "0";
}

function deleteLast() {
    operation.pop();
}

function applyNOT() {
    const val = getCurrentValue();
    if (val === null) return;
    const result = ~val >>> 0; // 32-bit NOT
    operation = [result.toString(getBaseRadix())];
    resultEl.textContent = operation.join("").toUpperCase();
}

/* ── Calculate ── */
function calculate() {
    if (operation.length === 0) return;

    try {
        // Convert expression tokens to decimal for eval
        const expr = operation.map(token => {
            if (OPERATORS.includes(token)) return token;
            return parseInt(token, getBaseRadix()).toString(10);
        }).join(" ");

        // eslint-disable-next-line no-eval
        let result = eval(expr);
        result = Math.trunc(result); // integers only

        if (!isFinite(result)) throw new Error("Math Error");

        const formatted = result.toString(getBaseRadix()).toUpperCase();
        addToHistory(operation.join(" ") + " =", formatted);

        resultEl.textContent = formatted;
        operation = [result.toString(getBaseRadix())];
    } catch {
        resultEl.textContent = "Error";
        operation = [];
    }
}

/* ── Helpers ── */
function getBaseRadix() {
    return { HEX: 16, DEC: 10, OCT: 8, BIN: 2 }[currentBase];
}

function getCurrentValue() {
    const expr = operation.join("");
    if (!expr) return 0;
    const val = parseInt(expr, getBaseRadix());
    return isNaN(val) ? null : val;
}

/* ── Display ── */
function updateDisplay() {
    operationEl.textContent = operation.join(" ").toUpperCase();

    const joined = operation.join("").toUpperCase();
    resultEl.textContent = joined || "0";

    const len = resultEl.textContent.length;
    resultEl.style.fontSize = len > 16 ? "1rem" : len > 12 ? "1.4rem" : len > 9 ? "1.8rem" : "2.2rem";
}

function updateBaseDisplays() {
    const val = getCurrentValue();
    const n = val ?? 0;

    hexDisplay.textContent = "HEX  " + (n >>> 0).toString(16).toUpperCase();
    decDisplay.textContent = "DEC  " + n.toString(10);
    octDisplay.textContent = "OCT  " + (n >>> 0).toString(8);
    binDisplay.textContent = "BIN  " + (n >>> 0).toString(2);
}

/* Init */
updateButtonStates();
updateBaseDisplays();