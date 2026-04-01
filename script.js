// DOM Elements
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const dueDateInput = document.getElementById('dueDateInput');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const exportBtn = document.getElementById('exportBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const overdueTasksEl = document.getElementById('overdueTasks');


// State
let tasks = [];
let currentCategory = 'all';
let draggedTask = null;


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
    renderTasks();
    setupCategoryFilters();
});


// Setup Event Listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', addsTask);
    exportBtn.addEventListener('click', exportedTasks);
}

function setupCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderTasks();
        });
    });
}


// Add Task

function addTask(e) {
    e.preventDefault();


    const taskText = taskInput.value.trim();
    const category = categorySelect.value;
    const dueDate = dueDateInput.value;


    if (!taskText) {
        alert('Please enter a task title');
        return;
    }


    const newTask = {
        id: Date.now(),
        text: taskText,
        category: category,
        dueDate: dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
        order: tasks.length
    };


    tasks.push(newTask);
    saveTasks();
    renderTasks();


    // Reset form
    taskInput.value = '';
    dueDateInput.value = '';
    categorySelect.value = 'personal';
    taskInput.focus();
}


// Delete Task
function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        }
}


// Toggle Task Completion
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}


// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';


    // Filter tasks by category
    const filteredTasks = currentCategory === 'all'
        ? tasks
        : tasks.filter(task => task.category === currentCategory);


    // Sort by order
    filteredTasks.sort((a, b) => a.order - b.order);


    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
        updateStats();
        return;
    }


    emptyState.style.display = 'none';


    filteredTasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    });


    updateStats();
}


// Create Task Element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.draggable = true;
    li.dataset.taskId = task.id;


    if (task.completed) li.classList.add('completed');
    if (isOverdue(task.dueDate) && !task.completed) li.classList.add('overdue');


    const categoryEmoji = {
        work: '💼',
        school: '🎓',
        personal: '🎯'
    };


    const daysUntil = task.dueDate ? getDaysUntil(task.dueDate) : null;
    const isOverdueTask = daysUntil !== null && daysUntil < 0;


    li.innerHTML = `
        <input
            type="checkbox"
            class="task-checkbox"
            ${task.completed ? 'checked' : ''}
            onchange="toggleTask(${task.id})"
        >
        <div class="task-content">
            <div class="task-header">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-category ${task.category}">
                    ${categoryEmoji[task.category]} ${task.category}
                </span>
            </div>
            <div class="task-footer">
                ${task.dueDate ? `
                    <span class="task-date ${isOverdueTask ? 'overdue' : ''}">
                        📅 ${formatDate(task.dueDate)}
                    </span>
                ` : ''}
            </div>
        </div>
        <div class="task-actions">
            <button class="task-btn task-btn-delete" onclick="deleteTask(${task.id})">
                🗑️
            </button>
        </div>
    `;


    // Drag and Drop
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragend', handleDragEnd);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);


    return li;
}


// Drag and Drop Functions
function handleDragStart(e) {
    draggedTask = e.target.closest('.task-item');
    draggedTask.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}


function handleDragEnd(e) {
    draggedTask.classList.remove('dragging');
    draggedTask = null;
}


function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    }


function handleDrop(e) {
    e.preventDefault();


    const targetTask = e.target.closest('.task-item');
    if (!targetTask || !draggedTask || draggedTask === targetTask) return;


    // Get task IDs
    const draggedId = parseInt(draggedTask.dataset.taskId);
    const targetId = parseInt(targetTask.dataset.taskId);


    // Swap order
    const draggedTask_obj = tasks.find(t => t.id === draggedId);
    const targetTask_obj = tasks.find(t => t.id === targetId);


    [draggedTask_obj.order, targetTask_obj.order] = [targetTask_obj.order, draggedTask_obj.order];


    saveTasks();
    renderTasks();
}


// Update Statistics
function updateStats() {
    const total = currentCategory === 'all'
        ? tasks.length
        : tasks.filter(t => t.category === currentCategory).length;
   
    const completed = currentCategory === 'all'
        ? tasks.filter(t => t.completed).length
        : tasks.filter(t => t.completed && t.category === currentCategory).length;


    const overdue = currentCategory === 'all'
        ? tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length
        : tasks.filter(t => !t.completed && isOverdue(t.dueDate) && t.category === currentCategory).length;
        

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    overdueTasksEl.textContent = overdue;


    // Update progress bar
    const percent = total === 0 ? 0 : (completed / total) * 100;
    progressFill.style.width = percent + '%';
    progressText.textContent = `${completed} of ${total} completed`;
}


// Export Tasks to JSON
function exportTasks() {
    if (tasks.length === 0) {
        alert('No tasks to export!');
        return;
    }


    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);


    alert('Tasks exported successfully!');
}


// Helper Functions
function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
}

function getDaysUntil(dueDate) {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}


function formatDate(dateStr) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}


function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}


// Storage Functions
function saveTasks() {
    localStorage.setItem('advancedTasks', JSON.stringify(tasks));
}


function loadTasks() {
    const saved = localStorage.getItem('advancedTasks');
    tasks = saved ? JSON.parse(saved) : [];
}
