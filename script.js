const dateInput = document.getElementById("task-date");
const inputField = document.getElementById("input-field");
const addTaskButton = document.getElementById("add-task-btn");
const tasksContainer = document.getElementById("tasks-container");
const allButton = document.getElementById("all-tasks");
const doneButton = document.getElementById("done-tasks");
const undoneButton = document.getElementById("undone-tasks");
let tasks = [];
let currentFilter = "all";

dateInput.addEventListener("change", () => {
  localStorage.setItem("selectedDate", dateInput.value);
});

addTaskButton.addEventListener("click", () => {
  const text = inputField.value.trim();

  if (!text) {
    showToast("Please enter a task.");
    return;
  }

  const task = createTask(text);
  tasks.push(task);
  saveTasks();
  renderAllTasks();
  inputField.value = "";
});

doneButton.addEventListener("click", () => {
  currentFilter = "done";
  renderAllTasks();
  updateActiveButtons();
});

allButton.addEventListener("click", () => {
  currentFilter = "all";
  renderAllTasks();
  updateActiveButtons();
});

undoneButton.addEventListener("click", () => {
  currentFilter = "undone";
  renderAllTasks();
  updateActiveButtons();
});

async function loadTasks() {
  const url = "https://jsonplaceholder.typicode.com/todos";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status:${response.status}`);
    }
    const data = await response.json();
    const newTasks = data.slice(0, 10).map((item) => {
      return {
        id: item.id,
        text: item.title,
        done: item.completed,
        reminder: false,
      };
    });
    tasks = newTasks;
    saveTasks();
    renderAllTasks();
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

function createTask(text) {
  return {
    id: Date.now(),
    text,
    done: false,
    reminder: false,
  };
}

function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  taskElement.classList.toggle("done", task.done);

  taskElement.innerHTML = `
    <input type="checkbox" class="task-checkbox">
    <p>${task.text}</p>
    <button class="remind-btn">⏰</button>
    <button class="delete-task-btn">Delete</button>
  `;

  return taskElement;
}

function bindTaskEvents(taskElement, task) {
  const checkbox = taskElement.querySelector(".task-checkbox");
  checkbox.checked = task.done;

  checkbox.addEventListener("change", () => {
    const foundTask = tasks.find((t) => t.id === task.id);
    foundTask.done = checkbox.checked;
    saveTasks();
    renderAllTasks();
  });

  const deleteBtn = taskElement.querySelector(".delete-task-btn");
  deleteBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => t.id !== task.id);
    saveTasks();
    renderAllTasks();
  });

  const remindBtn = taskElement.querySelector(".remind-btn");
  remindBtn.addEventListener("click", () => {
    toggleReminder(task.id);
  });

  if (task.reminder) {
    taskElement.classList.add("reminder");
  }
}
function renderTask(task) {
  const taskElement = createTaskElement(task);
  tasksContainer.appendChild(taskElement);
  bindTaskEvents(taskElement, task);
  taskElement.classList.toggle("reminder", task.reminder);
  const remindBtn = taskElement.querySelector(".remind-btn");

  remindBtn.classList.toggle("hidden", task.done);
}

function renderAllTasks() {
  tasksContainer.innerHTML = "";
  filterTasks().forEach((task) => {
    renderTask(task);
  });
}

function filterTasks() {
  if (currentFilter === "all") {
    return tasks;
  }
  if (currentFilter === "done") {
    return tasks.filter((task) => task.done === true);
  }
  if (currentFilter === "undone") {
    return tasks.filter((task) => task.done === false);
  }
  return tasks;
}

function updateActiveButtons() {
  allButton.classList.toggle("active", currentFilter === "all");
  doneButton.classList.toggle("active", currentFilter === "done");
  undoneButton.classList.toggle("active", currentFilter === "undone");
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleReminder(taskId) {
  const foundTask = tasks.find((t) => t.id === taskId);

  const seconds = prompt("In how many seconds should I remind you?");
  const time = Number(seconds);

  if (Number.isNaN(time) || !Number.isInteger(time) || time <= 0) {
    showToast("Please enter a positive whole number.");
    return;
  }

  foundTask.reminder = true;
  saveTasks();

  setTimeout(() => {
    showToast(`⏰ Reminder: ${foundTask.text}`);

    foundTask.reminder = false;
    saveTasks();

    renderAllTasks();
  }, time * 1000);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
function init() {
  const savedTasks = localStorage.getItem("tasks");

  if (savedTasks && savedTasks !== "[]") {
    tasks = JSON.parse(savedTasks);
    renderAllTasks();
  } else {
    loadTasks();
  }

  const savedDate = localStorage.getItem("selectedDate");
  if (savedDate) {
    dateInput.value = savedDate;
  }
}

init();
