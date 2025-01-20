let timeLeft;
let timerId = null;
let isWorkTime = true;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const statusText = document.getElementById('status-text');
const workModeBtn = document.getElementById('work-mode');
const restModeBtn = document.getElementById('rest-mode');

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

// Task Manager
let tasks = [];
let selectedTaskId = null;

const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

// Add this near the top of the file with other variables
const STORAGE_KEY = 'tomodoro-tasks';

function updateDisplay(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.title = `${timeString} - Tomodoro Timer`;
}

function switchMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
    statusText.textContent = isWorkTime ? 'Get Sh*t Done' : 'Take a Break. You\'ve Earned It.';
    updateDisplay(timeLeft);
}

function startTimer() {
    if (timerId !== null) return;
    
    if (!selectedTaskId && isWorkTime) {
        alert('Please select a task to work on first!');
        return;
    }
    
    if (!timeLeft) {
        timeLeft = WORK_TIME;
    }

    timerId = setInterval(() => {
        timeLeft--;
        
        // Update selected task duration if in work mode
        if (isWorkTime && selectedTaskId) {
            const task = tasks.find(t => t.id === selectedTaskId);
            if (task) {
                task.duration += 1;
                saveTasks(); // Save after updating duration
                renderTasks(); // Update display
            }
        }
        
        updateDisplay(timeLeft);

        if (timeLeft === 0) {
            clearInterval(timerId);
            timerId = null;
            
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create oscillator and gain nodes
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configure sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            // Play sound
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            
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

// Task Manager functions
function createTask(text) {
    return {
        id: Date.now(),
        text,
        completed: false,
        duration: 0 // Duration in seconds
    };
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item${task.completed ? ' completed' : ''}${task.id === selectedTaskId ? ' selected' : ''}`;
        li.setAttribute('data-task-id', task.id);
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'selected-task';
        radio.className = 'task-radio';
        radio.checked = task.id === selectedTaskId;
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        // Create separate spans for text and duration
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;
        
        const durationSpan = document.createElement('span');
        durationSpan.className = 'task-duration';
        durationSpan.textContent = formatDuration(task.duration);
        
        const textContainer = document.createElement('div');
        textContainer.appendChild(textSpan);
        textContainer.appendChild(durationSpan);
        
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        // Move checkbox into actions
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.title = 'Mark as complete';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'task-edit';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit task';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete task';
        
        actions.appendChild(checkbox);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        taskContent.appendChild(textContainer);
        taskContent.appendChild(actions);
        
        li.appendChild(radio);
        li.appendChild(taskContent);
        taskList.appendChild(li);
        
        // Event listeners
        radio.addEventListener('change', () => selectTask(task.id));
        checkbox.addEventListener('change', () => toggleTask(task.id));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
    });
}

function addTask(text) {
    const task = createTask(text);
    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        
        if (task.completed) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create oscillators and gain nodes
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const oscillator3 = audioContext.createOscillator();
            const oscillator4 = audioContext.createOscillator();
            const gainNode1 = audioContext.createGain();
            const gainNode2 = audioContext.createGain();
            const gainNode3 = audioContext.createGain();
            const gainNode4 = audioContext.createGain();
            
            // Connect nodes
            oscillator1.connect(gainNode1);
            oscillator2.connect(gainNode2);
            oscillator3.connect(gainNode3);
            oscillator4.connect(gainNode4);
            gainNode1.connect(audioContext.destination);
            gainNode2.connect(audioContext.destination);
            gainNode3.connect(audioContext.destination);
            gainNode4.connect(audioContext.destination);
            
            // Configure sounds
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';
            oscillator3.type = 'sine';
            oscillator4.type = 'sine';
            
            // E6 major triad frequencies plus E7
            oscillator1.frequency.setValueAtTime(1318.51, audioContext.currentTime); // E6
            oscillator2.frequency.setValueAtTime(1661.22, audioContext.currentTime); // G#6
            oscillator3.frequency.setValueAtTime(1975.53, audioContext.currentTime); // B6
            oscillator4.frequency.setValueAtTime(2637.02, audioContext.currentTime); // E7
            
            // Set timing (in seconds)
            const startTime = audioContext.currentTime;
            const beatDuration = 0.25; // Quarter note at 60 BPM
            const totalDuration = beatDuration * 7; // 7 beats total (added one more beat)
            
            // Initial volume (silence)
            gainNode1.gain.setValueAtTime(0, startTime);
            gainNode2.gain.setValueAtTime(0, startTime);
            gainNode3.gain.setValueAtTime(0, startTime);
            gainNode4.gain.setValueAtTime(0, startTime);
            
            // Volume for each note entry (with quick attack)
            const peakVolume = 0.01;
            
            // E6 enters on beat 1
            gainNode1.gain.setTargetAtTime(peakVolume, startTime, 0.01);
            
            // G#6 enters on beat 2
            gainNode2.gain.setTargetAtTime(peakVolume, startTime + beatDuration, 0.01);
            
            // B6 enters on beat 3
            gainNode3.gain.setTargetAtTime(peakVolume, startTime + (beatDuration * 2), 0.01);
            
            // E7 enters on beat 4
            gainNode4.gain.setTargetAtTime(peakVolume, startTime + (beatDuration * 3), 0.01);
            
            // All notes fade out together over the last 3 beats
            const fadeStartTime = startTime + (beatDuration * 4);
            gainNode1.gain.setValueAtTime(peakVolume, fadeStartTime);
            gainNode2.gain.setValueAtTime(peakVolume, fadeStartTime);
            gainNode3.gain.setValueAtTime(peakVolume, fadeStartTime);
            gainNode4.gain.setValueAtTime(peakVolume, fadeStartTime);
            
            gainNode1.gain.linearRampToValueAtTime(0, startTime + totalDuration);
            gainNode2.gain.linearRampToValueAtTime(0, startTime + totalDuration);
            gainNode3.gain.linearRampToValueAtTime(0, startTime + totalDuration);
            gainNode4.gain.linearRampToValueAtTime(0, startTime + totalDuration);
            
            // Start and stop oscillators
            oscillator1.start(startTime);
            oscillator2.start(startTime);
            oscillator3.start(startTime);
            oscillator4.start(startTime);
            
            oscillator1.stop(startTime + totalDuration);
            oscillator2.stop(startTime + totalDuration);
            oscillator3.stop(startTime + totalDuration);
            oscillator4.stop(startTime + totalDuration);
            
            // Add celebration animation
            const taskElements = document.querySelectorAll('.task-item');
            const taskElement = Array.from(taskElements).find(el => 
                el.querySelector('.task-radio').checked && task.completed
            );
            if (taskElement) {
                taskElement.classList.add('celebrate');
                setTimeout(() => taskElement.classList.remove('celebrate'), 500);
            }
        }
    }
}

function selectTask(taskId) {
    selectedTaskId = taskId;
    renderTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        statusText.textContent = `Working on: ${task.text}`;
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (!taskElement) return;
    
    const textSpan = taskElement.querySelector('.task-text');
    const currentText = task.text;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'task-edit-input';
    
    // Replace span with input
    textSpan.replaceWith(input);
    input.focus();
    input.select();
    
    // Handle save on enter or blur
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText !== '') {
            task.text = newText;
            if (taskId === selectedTaskId) {
                statusText.textContent = `Working on: ${task.text}`;
            }
        }
        saveTasks();
        renderTasks();
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

function deleteTask(taskId) {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator and gain node
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.15);
    
    // Configure volume
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    // Play sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
    
    // Delete the task
    tasks = tasks.filter(t => t.id !== taskId);
    if (taskId === selectedTaskId) {
        selectedTaskId = null;
        statusText.textContent = 'Get Sh*t Done';
    }
    saveTasks();
    renderTasks();
}

addTaskButton.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text) {
        addTask(text);
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = taskInput.value.trim();
        if (text) {
            addTask(text);
        }
    }
});

// Initialize the display
timeLeft = WORK_TIME;
updateDisplay(timeLeft);
statusText.textContent = 'Get Sh*t Done';

// Add these functions
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
} 