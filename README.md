# 🧮 Calculator

A multi-mode calculator web app built with plain HTML, CSS, and JavaScript. No frameworks, no dependencies — just clean, structured code.

## ✨ Features

- **Standard** calculator with full arithmetic and percentage support
- **History panel** — tracks recent calculations per session
- **Side navigation** — switch between calculator modes
- **Keyboard support** — type numbers and operators directly
- Responsive and accessible (ARIA labels throughout)

## 📁 File Structure

```
calculator/
├── index.html              # Standard calculator (default)
├── README.md
├── pages/
│   ├── scientific.html
│   ├── programmer.html
│   ├── currency.html
│   ├── temperature.html
│   ├── bmi.html
│   ├── speed.html
│   └── time.html
├── assets/
│   ├── css/
│   │   ├── base.css        # CSS variables, reset, body layout
│   │   ├── layout.css      # Wrapper, side menu, history panel
│   │   └── calculator.css  # Calculator display and button styles
│   └── js/
│       ├── menu.js         # Burger toggle + outside-click close
│       ├── history.js      # History panel state and rendering
│       └── calculator.js   # Core calculator logic + keyboard support
```

## 🚀 Getting Started

No build tools required. Just open `index.html` in your browser, or use the **VS Code Live Server** extension.

## 🗺️ Planned Pages

| Page | Status |
|---|---|
| Standard | ✅ Done |
| Scientific | 🔧 So close |
| Programmer | 🔧 Not yet finished |
| Currency | 🔧 In progress |
| Temperature | 🔧 In progress |
| BMI | 🔧 In progress |
| Speed | 🔧 In progress |
| Time | 🔧 In progress |

## 🛠️ Tech Stack

- HTML5
- CSS3 (custom properties, grid, transitions)
- JavaScript (ES6+)
