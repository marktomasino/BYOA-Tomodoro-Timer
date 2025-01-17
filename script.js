let timeLeft;
let timerId = null;
let isWorkTime = true;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const statusText = document.getElementById('status-text');

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

const workModeBtn = document.getElementById('work-mode');
const restModeBtn = document.getElementById('rest-mode');

function updateDisplay(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function switchMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
    statusText.textContent = isWorkTime ? 'Get Sh*t Done' : 'Take a Break. You\'ve Earned It.';
    updateDisplay(timeLeft);
}

function startTimer() {
    if (timerId !== null) return;
    
    if (!timeLeft) {
        timeLeft = WORK_TIME;
    }

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay(timeLeft);

        if (timeLeft === 0) {
            clearInterval(timerId);
            timerId = null;
            new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
            switchMode();
        }
    }, 1000);

    startButton.textContent = 'Pause';
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    if (isWorkTime) {
        setWorkMode();
    } else {
        setRestMode();
    }
    startButton.textContent = 'Start';
}

function toggleTimer() {
    if (timerId === null) {
        startTimer();
    } else {
        clearInterval(timerId);
        timerId = null;
        startButton.textContent = 'Start';
    }
}

function setWorkMode() {
    workModeBtn.classList.add('active');
    restModeBtn.classList.remove('active');
    isWorkTime = true;
    timeLeft = WORK_TIME;
    statusText.textContent = 'Get Sh*t Done';
    updateDisplay(timeLeft);
}

function setRestMode() {
    restModeBtn.classList.add('active');
    workModeBtn.classList.remove('active');
    isWorkTime = false;
    timeLeft = BREAK_TIME;
    statusText.textContent = 'Take a Break. You\'ve Earned It.';
    updateDisplay(timeLeft);
}

workModeBtn.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    startButton.textContent = 'Start';
    setWorkMode();
});

restModeBtn.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    startButton.textContent = 'Start';
    setRestMode();
});

startButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);

// Initialize the display
timeLeft = WORK_TIME;
updateDisplay(timeLeft);
statusText.textContent = 'Get Sh*t Done'; 