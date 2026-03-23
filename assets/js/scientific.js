/* =============================================
   scientific.js — Scientific Calculator Logic
   ============================================= */

const operationEl = document.getElementById("operation");
const resultEl    = document.getElementById("result");
const degRadBtn   = document.getElementById("degRadBtn");

let operation  = [];
let lastResult = null;
let isDeg      = true;

const OPERATORS = ["+", "-", "*", "/", "%"];

/* ── Degree / Radian Toggle ── */
degRadBtn.addEventListener("click", () => {
    isDeg = !isDeg;
    degRadBtn.textContent = isDeg ? "DEG" : "RAD";
});

/* ── Button Event Delegation ── */
document.querySelector(".buttons").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const num    = btn.dataset.num;
    const op     = btn.dataset.op;
    const action = btn.dataset.action;
    const fn     = btn.dataset.fn;

    if (num    !== undefined) addNumber(num);
    if (op     !== undefined) addOperator(op);
    if (fn     !== undefined) applyFunction(fn);
    if (action === "clear")   clearAll();
    if (action === "delete")  deleteLast();
    if (action === "equal")   calculate();

    updateDisplay();
});

/* ── Keyboard Support ── */
document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") { addNumber(e.key);   updateDisplay(); return; }
    if (e.key === ".")                 { addNumber(".");      updateDisplay(); return; }
    if (["+", "-", "*", "/"].includes(e.key)) { addOperator(e.key); updateDisplay(); return; }
    if (e.key === "Enter" || e.key === "=") { calculate();   updateDisplay(); return; }
    if (e.key === "Backspace")              { deleteLast();  updateDisplay(); return; }
    if (e.key === "Escape")                 { clearAll();    updateDisplay(); return; }
});

/* ── Number Input ── */
function addNumber(num) {
    if (num === ".") {
        const lastNum = getLastNumber();
        if (lastNum.includes(".")) return;
        if (lastNum === "") operation.push("0");
    }
    operation.push(num);
}

/* ── Operator Input ── */
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

/* ── Scientific Functions ── */
function applyFunction(fn) {
    const lastNum = parseFloat(getLastNumber());

    // Constants — just insert the value
    if (fn === "pi") { operation.push(String(Math.PI)); updateDisplay(); return; }
    if (fn === "e")  { operation.push(String(Math.E));  updateDisplay(); return; }

    // Need a number to work with
    if (isNaN(lastNum) && lastResult === null) return;

    const val = isNaN(lastNum) ? lastResult : lastNum;

    // Remove last number from operation to replace with result
    if (!isNaN(lastNum)) {
        const str = getLastNumber();
        for (let i = 0; i < str.length; i++) operation.pop();
    }

    let result;
    const toRad = isDeg ? (Math.PI / 180) : 1;

    switch (fn) {
        case "sin":   result = Math.sin(val * toRad); break;
        case "cos":   result = Math.cos(val * toRad); break;
        case "tan":   result = Math.tan(val * toRad); break;
        case "log":   result = Math.log10(val);        break;
        case "ln":    result = Math.log(val);          break;
        case "sqrt":  result = Math.sqrt(val);         break;
        case "sq":    result = Math.pow(val, 2);       break;
        case "inv":   result = 1 / val;                break;
        case "sign":  result = -val;                   break;
        case "fact":  result = factorial(Math.round(val)); break;
        default: return;
    }

    result = parseFloat(result.toFixed(10));
    operation.push(String(result));
    lastResult = result;
}

/* ── Power (xʸ) ── */
// Inserts ** operator so the next number typed becomes the exponent
function addPowerOp() {
    if (operation.length === 0) return;
    const last = operation[operation.length - 1];
    if (!OPERATORS.includes(last)) operation.push("**");
    updateDisplay();
}

/* ── Factorial ── */
function factorial(n) {
    if (n < 0)  return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 1; i <= n; i++) result *= i;
    return result;
}

/* ── Clear / Delete ── */
function clearAll() {
    operation  = [];
    lastResult = null;
    resultEl.textContent = "0";
}

function deleteLast() {
    operation.pop();
}

/* ── Helpers ── */
function getLastNumber() {
    let lastNumber = "";
    for (let i = operation.length - 1; i >= 0; i--) {
        if (OPERATORS.includes(operation[i]) || operation[i] === "**") break;
        lastNumber = operation[i] + lastNumber;
    }
    return lastNumber;
}

/* ── Display ── */
function updateDisplay() {
    // Show ** as ^ for readability
    operationEl.textContent = operation.join("").replace(/\*\*/g, "^");

    const len = resultEl.textContent.length;
    resultEl.style.fontSize = len > 12 ? "1.4rem" : len > 9 ? "1.8rem" : "2.2rem";
}

/* ── Calculate ── */
function calculate() {
    if (operation.length === 0) return;

    try {
        const expression    = operation.join("");
        const sanitizedExpr = expression.replace(/(\d+\.?\d*)%/g, "($1/100)");
        const result        = eval(sanitizedExpr);

        if (!isFinite(result)) throw new Error("Math Error");

        const formatted = parseFloat(result.toFixed(10)).toString();

        addToHistory(operation.join("").replace(/\*\*/g, "^"), formatted);

        resultEl.textContent = formatted;
        lastResult = parseFloat(formatted);
        operation  = [];
    } catch {
        resultEl.textContent = "Error";
        operation = [];
    }
}