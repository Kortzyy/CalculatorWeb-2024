/* =============================================
   calculator.js — Core Calculator Logic
   ============================================= */

const operationEl = document.getElementById("operation");
const resultEl    = document.getElementById("result");

/** Current token list representing the expression. */
let operation = [];

const OPERATORS = ["+", "-", "*", "/", "%"];

/* ── Button Event Delegation ── */
document.querySelector(".buttons").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.num    !== undefined) addNumber(btn.dataset.num);
    if (btn.dataset.op     !== undefined) addOperator(btn.dataset.op);
    if (btn.dataset.action === "clear")   clearAll();
    if (btn.dataset.action === "delete")  deleteLast();
    if (btn.dataset.action === "equal")   calculate();

    updateDisplay();
});

/* ── Keyboard Support ── */
document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") { addNumber(e.key); updateDisplay(); return; }
    if (e.key === ".")                 { addNumber(".");   updateDisplay(); return; }
    if (["+", "-", "*", "/", "%"].includes(e.key)) { addOperator(e.key); updateDisplay(); return; }
    if (e.key === "Enter" || e.key === "=") { calculate(); updateDisplay(); return; }
    if (e.key === "Backspace")              { deleteLast(); updateDisplay(); return; }
    if (e.key === "Escape")                 { clearAll();   updateDisplay(); return; }
});

/* ── Input Logic ── */

/**
 * Appends a number or decimal point to the current expression.
 * Prevents multiple decimals within the same number segment.
 * @param {string} num
 */
function addNumber(num) {
    if (num === ".") {
        const lastNumber = getLastNumber();
        if (lastNumber.includes(".")) return;
        // Prefix bare decimal with 0
        if (lastNumber === "") operation.push("0");
    }
    operation.push(num);
}

/**
 * Appends an operator, replacing the last one if it already is an operator.
 * Allows leading minus for negative numbers.
 * @param {string} op
 */
function addOperator(op) {
    if (operation.length === 0) {
        if (op === "-") operation.push(op);
        return;
    }

    const last = operation[operation.length - 1];
    if (OPERATORS.includes(last) && last !== "%") {
        operation[operation.length - 1] = op;
    } else {
        operation.push(op);
    }
}

/** Resets the entire calculator state. */
function clearAll() {
    operation = [];
    resultEl.textContent = "0";
}

/** Removes the last token from the expression. */
function deleteLast() {
    operation.pop();
}

/* ── Helpers ── */

/**
 * Extracts the last numeric segment from the token list.
 * Used for decimal-point validation.
 * @returns {string}
 */
function getLastNumber() {
    let lastNumber = "";
    for (let i = operation.length - 1; i >= 0; i--) {
        if (OPERATORS.includes(operation[i])) break;
        lastNumber = operation[i] + lastNumber;
    }
    return lastNumber;
}

/* ── Display ── */

/** Syncs the operation display line with the current token list. */
function updateDisplay() {
    const expr = operation.join("");
    operationEl.textContent = expr;

    // Shrink font if result is long
    const len = resultEl.textContent.length;
    resultEl.style.fontSize = len > 12 ? "1.4rem" : len > 9 ? "1.8rem" : "2.2rem";
}

/* ── Calculation ── */

/**
 * Evaluates the current expression, stores the result,
 * and pushes an entry to history.
 */
function calculate() {
    if (operation.length === 0) return;

    try {
        const expression    = operation.join("");
        // Convert  N%  →  (N/100)  for correct percentage math
        const sanitizedExpr = expression.replace(/(\d+\.?\d*)%/g, "($1/100)");
        // eslint-disable-next-line no-eval
        const result        = eval(sanitizedExpr);

        if (!isFinite(result)) throw new Error("Division by zero");

        // Format: avoid unnecessary floating-point noise
        const formatted = parseFloat(result.toFixed(10)).toString();

        // Push to history (history.js exposes addToHistory)
        addToHistory(operation.join(" "), formatted);

        resultEl.textContent = formatted;
        operation = [];
    } catch (err) {
        resultEl.textContent = "Error";
        operation = [];
    }
}