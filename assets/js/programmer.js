/* =============================================
   programmer.js — Programmer Calculator Logic
   BigInt-based: 8/16/32/64-bit, signed/unsigned
   ============================================= */

const $ = (sel) => document.querySelector(sel);
const resultEl    = $("#result");
const operationEl = $("#operation");
const bitGrid     = $("#bitGrid");

const RADIX  = { HEX: 16, DEC: 10, OCT: 8, BIN: 2 };
const PREFIX = { HEX: "0x", DEC: "", OCT: "0o", BIN: "0b" };
const SYMBOL = { "&": "AND", "|": "OR", "^": "XOR", "<<": "<<", ">>": ">>", "*": "×", "/": "÷", "+": "+", "-": "−" };

let base = "DEC", width = 32, signed = true;
let tokens = [];      // e.g. ["FF", "+", "1"] — numbers are whole strings
let lastValue = 0n;   // result of the last "="
let hasError = false;

/* ── Helpers ── */
const isOp  = (t) => Object.hasOwn(SYMBOL, t);
const show  = (t) => (isOp(t) ? SYMBOL[t] : t.toUpperCase());
const wrap  = (v) => (signed ? BigInt.asIntN(width, v) : BigInt.asUintN(width, v));
const parse = (s, b = base) => BigInt(PREFIX[b] + s);
const fmt   = (v, b = base) => (b === "DEC" ? v : BigInt.asUintN(width, v)).toString(RADIX[b]).toUpperCase();
const group = (s) => s.replace(/\B(?=(.{4})+$)/g, " ");

const lastIsNum = () => tokens.length > 0 && !isOp(tokens.at(-1));
const current = () => {
    const nums = tokens.filter((t) => !isOp(t));
    return nums.length ? wrap(parse(nums.at(-1))) : lastValue;
};

/* ── Input ── */
function addDigit(d) {
    if (lastIsNum()) tokens[tokens.length - 1] += d;
    else tokens.push(d);
}

function addOp(op) {
    if (!tokens.length) tokens.push(fmt(lastValue));
    if (isOp(tokens.at(-1))) tokens[tokens.length - 1] = op;
    else tokens.push(op);
}

function backspace() {
    if (!tokens.length) return;
    const last = tokens.at(-1);
    const next = last.slice(0, -1);
    if (isOp(last) || next === "" || next === "-") tokens.pop();
    else tokens[tokens.length - 1] = next;
}

function setValue(v) {
    if (lastIsNum()) tokens[tokens.length - 1] = fmt(v);
    else tokens.push(fmt(v));
}

function calculate() {
    if (!tokens.length) return;
    if (isOp(tokens.at(-1))) tokens.pop();
    try {
        const expr = tokens.map((t) => (isOp(t) ? t : wrap(parse(t)) + "n")).join(" ");
        const out = wrap(eval(expr));
        addToHistory(`${tokens.map(show).join(" ")} (${base})`, fmt(out));
        lastValue = out;
    } catch {
        hasError = true;
        lastValue = 0n;
    }
    tokens = [];
}

/* ── Bit grid ── */
function buildBits() {
    let html = "";
    for (let n = width / 4 - 1; n >= 0; n--) {
        html += '<div class="nibble">';
        for (let i = n * 4 + 3; i >= n * 4; i--) {
            html += `<div class="bit-cell"><small>${i}</small><button class="bit" data-bit="${i}" aria-pressed="false">0</button></div>`;
        }
        html += "</div>";
    }
    bitGrid.innerHTML = html;
    bitGrid.dataset.width = width;
}

function renderBits(v) {
    if (bitGrid.dataset.width !== String(width)) buildBits();
    const u = BigInt.asUintN(width, v);
    bitGrid.querySelectorAll(".bit").forEach((b) => {
        const on = (u >> BigInt(b.dataset.bit)) & 1n;
        b.textContent = on;
        b.setAttribute("aria-pressed", on === 1n);
    });
}

/* ── Render ── */
function render() {
    const v = current();

    operationEl.textContent = tokens.map(show).join(" ");
    resultEl.textContent = hasError ? "Error" : lastIsNum() ? tokens.at(-1).toUpperCase() : fmt(v);

    const len = resultEl.textContent.length;
    resultEl.style.fontSize = len > 32 ? "1rem" : len > 16 ? "1.4rem" : len > 10 ? "1.8rem" : "2.2rem";

    for (const b in RADIX) {
        const s = fmt(v, b);
        $(`#${b.toLowerCase()}Display`).textContent = b === "HEX" || b === "BIN" ? group(s) : s;
    }
    document.querySelectorAll(".readout").forEach((r) => r.classList.toggle("active-base", r.dataset.base === base));

    renderBits(v);
    document.querySelectorAll(".keypad [data-num]").forEach((b) => {
        b.disabled = parseInt(b.dataset.num, 16) >= RADIX[base];
    });
}

/* ── Events ── */
$(".keypad").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || btn.disabled) return;
    hasError = false;

    const { num, op, action } = btn.dataset;
    if (num !== undefined)          addDigit(num);
    else if (op !== undefined)      addOp(op);
    else if (action === "clear")    { tokens = []; lastValue = 0n; }
    else if (action === "delete")   backspace();
    else if (action === "not")      setValue(wrap(~current()));
    else if (action === "equal")    calculate();

    render();
});

$(".mode-bar").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const prev = base;
    const { base: b, width: w, sign } = btn.dataset;
    if (b)    base = b;
    if (w)    width = Number(w);
    if (sign) signed = sign === "signed";

    btn.parentElement.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === btn));

    lastValue = wrap(lastValue);
    tokens = tokens.map((t) => (isOp(t) ? t : fmt(wrap(parse(t, prev)))));
    render();
});

bitGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".bit");
    if (!btn) return;
    hasError = false;
    setValue(wrap(current() ^ (1n << BigInt(btn.dataset.bit))));
    render();
});

$(".readouts").addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const text = $(`#${btn.dataset.copy}`).textContent.replace(/\s/g, "");
    try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
    } catch {
        btn.textContent = "Failed";
    }
    setTimeout(() => (btn.textContent = "Copy"), 1000);
});

/* Small screens: history is an overlay, so close it when tapping outside */
document.addEventListener("click", (e) => {
    if (!matchMedia("(max-width: 1100px)").matches) return;
    if (!historyPanel.contains(e.target) && !e.target.closest(".history-toggle")) {
        historyPanel.classList.remove("active");
    }
});

render();