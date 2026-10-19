// ===============================
// ELEMENTS
// ===============================

const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");

const addTaskBtn = document.getElementById("addTask");

const taskList = document.getElementById("taskList");

const search = document.getElementById("search");

const filters = document.querySelectorAll(".filter");

const themeBtn = document.getElementById("themeBtn");

// Dashboard
const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");
const highPriority = document.getElementById("highPriority");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

// ===============================
// DATA
// ===============================

function normalizeTasks(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((task) =>
      task &&
      typeof task === "object" &&
      Number.isSafeInteger(Number(task.id)) &&
      typeof task.title === "string"
    )
    .map((task) => ({
      id: Number(task.id),
      title: task.title,
      priority: ["Low", "Medium", "High"].includes(task.priority) ? task.priority : "Medium",
      dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
      completed: task.completed === true,
    }));
}

function loadTasks() {
  try {
    return normalizeTasks(JSON.parse(localStorage.getItem("tasks") || "[]"));
  } catch {
    localStorage.removeItem("tasks");
    return [];
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

let tasks = loadTasks();

let currentFilter = "all";

// ===============================
// SAVE
// ===============================

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===============================
// ADD TASK
// ===============================

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

function addTask() {
  if (taskInput.value.trim() === "") {
    alert("Enter task");

    return;
  }

  const task = {
    id: Date.now(),

    title: taskInput.value,

    priority: priority.value,

    dueDate: dueDate.value,

    completed: false,
  };

  tasks.push(task);

  saveTasks();

  taskInput.value = "";

  dueDate.value = "";

  priority.value = "Medium";

  renderTasks();
}

// ===============================
// DELETE
// ===============================

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();

  renderTasks();
}

// ===============================
// COMPLETE
// ===============================

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      task.completed = !task.completed;
    }

    return task;
  });

  saveTasks();

  renderTasks();
}

// ===============================
// EDIT
// ===============================

function editTask(id) {
  const task = tasks.find((t) => t.id === id);

  const newTitle = prompt("Edit Task", task.title);

  if (newTitle && newTitle.trim() !== "") {
    task.title = newTitle;

    saveTasks();

    renderTasks();
  }
}

// ===============================
// RENDER
// ===============================

function renderTasks() {
  taskList.innerHTML = "";

  let filtered = tasks;

  if (currentFilter === "active") {
    filtered = tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    filtered = tasks.filter((task) => task.completed);
  }

  const keyword = search.value.trim().toLowerCase();
  if (keyword) {
    filtered = filtered.filter((task) => task.title.toLowerCase().includes(keyword));
  }

  filtered.forEach((task) => {
    const li = document.createElement("li");

    li.className = "task " + (task.completed ? "completed" : "");

    const taskId = Number(task.id);
    const taskTitle = escapeHTML(task.title);
    const taskDate = escapeHTML(task.dueDate || "No Date");
    const taskPriority = ["Low", "Medium", "High"].includes(task.priority) ? task.priority : "Medium";

    li.innerHTML = `

<div class="task-info">

<h3 class="task-title">
${taskTitle}
</h3>

<div class="task-date">
📅 ${taskDate}
</div>

<span class="priority ${taskPriority.toLowerCase()}">
${taskPriority}
</span>

</div>

<div class="actions">

<button
class="completeBtn"
onclick="toggleTask(${taskId})"
aria-label="Complete task">

<i class="fa-solid fa-check"></i>

</button>

<button
class="editBtn"
onclick="editTask(${taskId})"
aria-label="Edit task">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="deleteBtn"
onclick="deleteTask(${taskId})"
aria-label="Delete task">

<i class="fa-solid fa-trash"></i>

</button>

</div>

`;

    taskList.appendChild(li);
  });

  updateDashboard();
}

renderTasks();
// ===============================
// SEARCH
// ===============================

search.addEventListener("input", () => renderTasks());

// ===============================
// FILTERS
// ===============================

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((button) => button.classList.remove("active"));

    btn.classList.add("active");

    currentFilter = btn.dataset.filter;

    renderTasks();
  });
});

// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {
  totalTasks.textContent = tasks.length;

  const completed = tasks.filter((task) => task.completed);

  completedTasks.textContent = completed.length;

  activeTasks.textContent = tasks.length - completed.length;

  highPriority.textContent = tasks.filter(
    (task) => task.priority === "High",
  ).length;

  let percent = 0;

  if (tasks.length > 0) {
    percent = Math.round((completed.length / tasks.length) * 100);
  }

  progressFill.style.width = percent + "%";

  progressPercent.textContent = percent + "%";
}

// ===============================
// DARK / LIGHT MODE
// ===============================

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  if (document.body.classList.contains("light")) {
    localStorage.setItem("theme", "light");

    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    localStorage.setItem("theme", "dark");

    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
});

// Load saved theme

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light");

  themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

// ===============================
// EMPTY MESSAGE
// ===============================

function showEmptyMessage() {
  if (tasks.length === 0) {
    taskList.innerHTML = `

<div class="empty">

<i
class="fa-solid fa-box-open"
style="font-size:60px;margin-bottom:20px;">
</i>

<h2>No Tasks Yet</h2>

<p>Add your first task above.</p>

</div>

`;
  } else if (taskList.children.length === 0) {
    taskList.innerHTML = `
      <div class="empty">
        <h2>No matching tasks</h2>
        <p>Try another search or task filter.</p>
      </div>
    `;
  }
}

// ===============================
// UPDATE RENDER
// ===============================

// Replace your existing renderTasks()
// ending with this:

const oldRender = renderTasks;

renderTasks = function () {
  oldRender();

  updateDashboard();

  showEmptyMessage();
};

renderTasks();
// ===============================
// TOAST NOTIFICATION
// ===============================

function showToast(message) {
  const toast = document.createElement("div");

  toast.className = "toast";

  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}

// ===============================
// OVERRIDE ADD BUTTON
// ===============================

const oldAddTask = addTask;

addTask = function () {
  oldAddTask();

  showToast("✅ Task Added");
};

// Reattach event

addTaskBtn.onclick = addTask;

// ===============================
// OVERDUE TASK
// ===============================

function checkOverdue() {
  const today = new Date();

  tasks.forEach((task) => {
    if (task.dueDate && !task.completed) {
      const due = new Date(task.dueDate);

      if (due < today) {
        task.overdue = true;
      } else {
        task.overdue = false;
      }
    }
  });
}

setInterval(checkOverdue, 1000);

// ===============================
// KEYBOARD SHORTCUTS
// ===============================

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();

    search.focus();
  }
});

// ===============================
// AUTO SAVE
// ===============================

window.addEventListener("beforeunload", () => {
  saveTasks();
});

// ===============================
// TASK SORT
// ===============================

tasks.sort((a, b) => {
  if (a.completed === b.completed) {
    return b.id - a.id;
  }

  return a.completed - b.completed;
});

// ===============================
// START
// ===============================

checkOverdue();

updateDashboard();

renderTasks();

showToast("🚀 Todo Ready");
