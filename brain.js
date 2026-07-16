// brain.js — To-Do List logic

const STORAGE_KEY = "todo-tasks";

/** @type {{id: string, name: string, details: string, importance: string, dueDate: string, completed: boolean}[]} */
let tasks = loadTasks();

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read saved tasks:", err);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Could not save tasks:", err);
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDueDate(dueDate) {
  if (!dueDate) return "No due date";
  const d = new Date(dueDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "No due date";
  return "Due " + d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function importanceLabel(importance) {
  return { low: "Low", med: "Medium", high: "High" }[importance] || importance;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTasks() {
  const pendingList = document.getElementById("pendingTasks");
  const completedList = document.getElementById("completedTasks");
  const pendingEmpty = document.getElementById("pendingEmpty");
  const completedEmpty = document.getElementById("completedEmpty");
  if (!pendingList || !completedList) return;

  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  pendingEmpty.hidden = pending.length > 0;
  completedEmpty.hidden = completed.length > 0;

  pending.forEach((task) => pendingList.appendChild(buildTaskItem(task)));
  completed.forEach((task) => completedList.appendChild(buildTaskItem(task)));
}

function buildTaskItem(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.completed ? " completed" : "");
  li.dataset.id = task.id;

  li.innerHTML = `
    <input type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark ${escapeHtml(task.name)} as ${task.completed ? "not complete" : "complete"}" />
    <div class="task-item-content">
      <div class="task-item-name">${escapeHtml(task.name)}</div>
      <div class="task-item-details">${escapeHtml(task.details)}</div>
      <div class="task-item-meta">
        <span class="task-importance ${task.importance}">${importanceLabel(task.importance)}</span>
        <span class="task-due">${formatDueDate(task.dueDate)}</span>
      </div>
    </div>
    <button type="button" class="task-delete" aria-label="Delete ${escapeHtml(task.name)}" title="Delete task">&times;</button>
  `;

  li.querySelector('input[type="checkbox"]').addEventListener("change", () => {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  });

  li.querySelector(".task-delete").addEventListener("click", () => {
    tasks = tasks.filter((t) => t.id !== task.id);
    saveTasks();
    renderTasks();
  });

  return li;
}

function updateTimestamp() {
  const el = document.getElementById("title-time");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function init() {
  const form = document.getElementById("tdl");
  const errorMsg = document.getElementById("tdl-error");
  const deleteAllBtn = document.getElementById("deleteAll");

  renderTasks();
  updateTimestamp();
  setInterval(updateTimestamp, 30000);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("taskname");
    const detesInput = document.getElementById("taskdetes");
    const impInput = document.getElementById("taskimp");
    const dateInput = document.getElementById("duedate");

    const name = nameInput.value.trim();
    const details = detesInput.value.trim();

    if (!name || !details) {
      errorMsg.hidden = false;
      return;
    }
    errorMsg.hidden = true;

    tasks.push({
      id: makeId(),
      name,
      details,
      importance: impInput.value,
      dueDate: dateInput.value,
      completed: false,
    });

    saveTasks();
    renderTasks();
    form.reset();
    nameInput.focus();
  });

  deleteAllBtn.addEventListener("click", () => {
    if (tasks.length === 0) return;
    const confirmed = window.confirm(
      `Delete all ${tasks.length} task${tasks.length === 1 ? "" : "s"}? This cannot be undone.`
    );
    if (confirmed) {
      tasks = [];
      saveTasks();
      renderTasks();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
