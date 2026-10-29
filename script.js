const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const keypad = document.querySelector(".keypad");
const scientificGrid = document.querySelector(".scientific-grid");

let currentInput = "0";
let storedValue = null;
let currentOperator = null;
let waitingForOperand = false;
let expressionText = "";
let hasError = false;

function updateDisplay() {
    resultDisplay.textContent = currentInput;
    expressionDisplay.textContent = expressionText || "Ready to calculate";
}

function clearCalculator() {
    currentInput = "0";
    storedValue = null;
    currentOperator = null;
    waitingForOperand = false;
    expressionText = "";
    hasError = false;
    updateDisplay();
}

function inputNumber(number) {
    if (hasError) clearCalculator();

    if (waitingForOperand) {
        currentInput = number;
        waitingForOperand = false;
    } else if (currentInput === "0") {
        currentInput = number;
    } else if (currentInput.length < 16) {
        currentInput += number;
    }
    updateDisplay();
}

function inputDecimal() {
    if (hasError) clearCalculator();

    if (waitingForOperand) {
        currentInput = "0.";
        waitingForOperand = false;
    } else if (!currentInput.includes(".")) {
        currentInput += ".";
    }
    updateDisplay();
}

function calculate(a, operator, b) {
    if (operator === "+") return a + b;
    if (operator === "-") return a - b;
    if (operator === "×") return a * b;
    if (operator === "÷") {
        if (b === 0) throw new Error("Cannot divide by zero");
        return a / b;
    }
    return b;
}

function formatNumber(number) {
    if (!Number.isFinite(number)) throw new Error("Result is not finite");
    return String(Number.parseFloat(number.toPrecision(12)));
}

function chooseOperator(operator) {
    if (hasError) clearCalculator();

    const inputValue = Number(currentInput);
    if (currentOperator && !waitingForOperand) {
        try {
            const result = calculate(storedValue, currentOperator, inputValue);
            currentInput = formatNumber(result);
            storedValue = result;
        } catch (error) {
            showError(error.message);
            return;
        }
    } else {
        storedValue = inputValue;
    }

    currentOperator = operator;
    waitingForOperand = true;
    expressionText = `${currentInput} ${operator}`;
    updateDisplay();
}

function showError(message) {
    currentInput = message;
    expressionText = "Calculation error";
    storedValue = null;
    currentOperator = null;
    waitingForOperand = true;
    hasError = true;
    updateDisplay();
}

function calculateResult() {
    if (!currentOperator || storedValue === null || waitingForOperand) return;

    const firstValue = storedValue;
    const secondValue = Number(currentInput);
    const operator = currentOperator;

    try {
        const result = calculate(firstValue, operator, secondValue);
        expressionText = `${formatNumber(firstValue)} ${operator} ${formatNumber(secondValue)} =`;
        currentInput = formatNumber(result);
        storedValue = null;
        currentOperator = null;
        waitingForOperand = true;
        updateDisplay();
    } catch (error) {
        showError(error.message);
    }
}

function backspace() {
    if (hasError || waitingForOperand) {
        clearCalculator();
        return;
    }
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
    if (currentInput === "-" || currentInput === "") currentInput = "0";
    updateDisplay();
}

function applyScientificFunction(name) {
    if (hasError) clearCalculator();

    const value = Number(currentInput);
    let result;
    let label;

    try {
        switch (name) {
            case "sin":
                result = Math.sin(value * Math.PI / 180);
                label = `sin(${value}°)`;
                break;
            case "cos":
                result = Math.cos(value * Math.PI / 180);
                label = `cos(${value}°)`;
                break;
            case "tan":
                if (Math.abs(Math.cos(value * Math.PI / 180)) < 1e-12) {
                    throw new Error("Undefined for this angle");
                }
                result = Math.tan(value * Math.PI / 180);
                label = `tan(${value}°)`;
                break;
            case "sqrt":
                if (value < 0) throw new Error("Invalid square root");
                result = Math.sqrt(value);
                label = `√(${value})`;
                break;
            case "square":
                result = value * value;
                label = `(${value})²`;
                break;
            case "log":
                if (value <= 0) throw new Error("log needs a positive number");
                result = Math.log10(value);
                label = `log(${value})`;
                break;
            case "ln":
                if (value <= 0) throw new Error("ln needs a positive number");
                result = Math.log(value);
                label = `ln(${value})`;
                break;
            case "reciprocal":
                if (value === 0) throw new Error("Cannot divide by zero");
                result = 1 / value;
                label = `1/(${value})`;
                break;
            default:
                return;
        }

        currentInput = formatNumber(result);
        expressionText = `${label} =`;
        storedValue = null;
        currentOperator = null;
        waitingForOperand = true;
        updateDisplay();
    } catch (error) {
        showError(error.message);
    }
}

keypad.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
    if (button.dataset.operator) chooseOperator(button.dataset.operator);

    switch (button.dataset.action) {
        case "clear":
            clearCalculator();
            break;
        case "backspace":
            backspace();
            break;
        case "decimal":
            inputDecimal();
            break;
        case "equals":
            calculateResult();
            break;
    }
});

scientificGrid.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-function]");
    if (button) applyScientificFunction(button.dataset.function);
});

document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        inputNumber(key);
    } else if (key === ".") {
        inputDecimal();
    } else if (key === "+" || key === "-") {
        chooseOperator(key);
    } else if (key === "*") {
        chooseOperator("×");
    } else if (key === "/") {
        event.preventDefault();
        chooseOperator("÷");
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
    } else if (key === "Escape") {
        clearCalculator();
    } else if (key === "Backspace") {
        backspace();
    }
});

updateDisplay();
