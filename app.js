(() => {
  const STORAGE_KEY = "taskflow.tasks.v1";
  const THEME_KEY = "taskflow.theme.v1";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const todayISO = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  };
  const makeId = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const sampleTasks = [
    {id:makeId(),title:"Plan the week ahead",description:"Review priorities and make a realistic plan for the days ahead.",status:"In progress",priority:"High",due:todayISO(),created:Date.now()-400000},
    {id:makeId(),title:"Finish portfolio homepage",description:"Polish the hero section and check the mobile layout.",status:"To do",priority:"High",due:"",created:Date.now()-300000},
    {id:makeId(),title:"Read for 20 minutes",description:"A little learning every day goes a long way.",status:"To do",priority:"Low",due:"",created:Date.now()-200000},
    {id:makeId(),title:"Organize project files",description:"Clean up folders so everything is easy to find.",status:"Completed",priority:"Medium",due:"",created:Date.now()-100000}
  ];

  let tasks = loadTasks();
  let activeView = "all";
  let activeStatus = "All";
  let activePriority = "";
  let toastTimer;

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTasks));
      return sampleTasks;
    } catch (error) {
      return sampleTasks;
    }
  }
  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch (error) { showToast("Could not save changes in this browser."); }
  }
  function escapeHTML(value="") {
    return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString(undefined, {month:"short", day:"numeric"});
  }
  function getDueClass(due) {
    if (!due) return "";
    if (due < todayISO()) return "overdue";
    if (due === todayISO()) return "today";
    return "";
  }
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  function getFilteredTasks() {
    const query = $("#searchInput").value.trim().toLowerCase();
    let list = tasks.filter(task => {
      const matchesQuery = !query || `${task.title} ${task.description}`.toLowerCase().includes(query);
      const matchesStatus = activeStatus === "All" || task.status === activeStatus;
      const matchesPriority = !activePriority || task.priority === activePriority;
      let matchesView = true;
      if (activeView === "today") matchesView = task.due === todayISO() && task.status !== "Completed";
      if (activeView === "upcoming") matchesView = task.due > todayISO() && task.status !== "Completed";
      if (activeView === "completed") matchesView = task.status === "Completed";
      return matchesQuery && matchesStatus && matchesPriority && matchesView;
    });
    const sort = $("#sortSelect").value;
    if (sort === "due") list.sort((a,b) => (a.due || "9999").localeCompare(b.due || "9999"));
    else if (sort === "priority") { const rank={High:0,Medium:1,Low:2}; list.sort((a,b)=>rank[a.priority]-rank[b.priority]); }
    else if (sort === "title") list.sort((a,b)=>a.title.localeCompare(b.title));
    else list.sort((a,b)=>b.created-a.created);
    return list;
  }
  function renderTask(task) {
    const dueClass = getDueClass(task.due);
    const dueText = task.due ? `${task.due < todayISO() && task.status !== "Completed" ? "Overdue · " : ""}${formatDate(task.due)}` : "";
    const statusClass = task.status === "Completed" ? "status-completed" : task.status === "In progress" ? "status-in-progress" : "";
    return `<article class="task-row ${task.status === "Completed" ? "is-completed" : ""}" data-id="${escapeHTML(task.id)}">
      <input class="task-check" type="checkbox" aria-label="Mark ${escapeHTML(task.title)} completed" ${task.status === "Completed" ? "checked" : ""}>
      <div class="task-main">
        <div class="task-title">${escapeHTML(task.title)}</div>
        ${task.description ? `<div class="task-description">${escapeHTML(task.description)}</div>` : ""}
        <div class="task-meta"><span class="task-tag">${task.status === "Completed" ? "Done" : task.status === "In progress" ? "Working on it" : "Personal"}</span>${dueText ? `<span class="task-due ${task.status === "Completed" ? "" : dueClass}">◷ ${escapeHTML(dueText)}</span>` : ""}</div>
      </div>
      <span class="priority-badge ${escapeHTML(task.priority)}">${escapeHTML(task.priority)} priority</span>
      <select class="status-select ${statusClass}" aria-label="Change status for ${escapeHTML(task.title)}">
        ${["To do","In progress","Completed"].map(status => `<option ${task.status===status?"selected":""}>${status}</option>`).join("")}
      </select>
      <div class="row-actions"><button class="row-action edit-task" aria-label="Edit ${escapeHTML(task.title)}" title="Edit task">✎</button><button class="row-action delete delete-task" aria-label="Delete ${escapeHTML(task.title)}" title="Delete task">×</button></div>
    </article>`;
  }
  function render() {
    const completed = tasks.filter(t=>t.status==="Completed").length;
    const inProgress = tasks.filter(t=>t.status==="In progress").length;
    const todayTasks = tasks.filter(t=>t.due===todayISO() && t.status!=="Completed").length;
    $("#allCount").textContent = tasks.length;
    $("#todayCount").textContent = todayTasks;
    $("#completedCount").textContent = completed;
    $("#totalStat").textContent = tasks.length;
    $("#progressStat").textContent = inProgress;
    $("#doneStat").textContent = completed;
    const percent = tasks.length ? Math.round(completed/tasks.length*100) : 0;
    $("#focusProgress").style.width = `${percent}%`;
    $("#progressLabel").textContent = `${percent}%`;
    $("#tabAll").textContent = tasks.length;
    $("#tabTodo").textContent = tasks.filter(t=>t.status==="To do").length;
    $("#tabProgress").textContent = inProgress;
    $("#tabDone").textContent = completed;

    const viewNames = {all:"All tasks",today:"Today",upcoming:"Upcoming",completed:"Completed"};
    let viewName = activePriority ? `${activePriority} priority` : viewNames[activeView];
    $("#breadcrumbTitle").textContent = viewName;
    $("#listTitle").childNodes[0].textContent = activePriority ? `${activePriority} priority tasks ` : activeView==="all" ? "Your tasks " : viewName+" ";
    $("#pageTitle").innerHTML = activeView==="today" ? 'Focus on <span>today.</span>' : activeView==="upcoming" ? 'What’s coming <span>up.</span>' : activeView==="completed" ? 'Look how far <span>you’ve come.</span>' : 'Make room for <span>focus.</span>';
    $("#pageSubtitle").textContent = activeView==="today" ? "One thing at a time. Make today count." : activeView==="upcoming" ? "A quick look at what’s next on your list." : activeView==="completed" ? "Take a moment to appreciate your progress." : "A little progress each day adds up to big results.";
    $("#listDescription").textContent = activePriority ? `Tasks marked ${activePriority.toLowerCase()} priority.` : "Everything you want to get done, in one place.";

    $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === activeView && !activePriority || button.dataset.priority === activePriority && !!activePriority));
    $$(".filter-tab").forEach(button => button.classList.toggle("active", button.dataset.status === activeStatus));
    const filtered = getFilteredTasks();
    $("#visibleCount").textContent = filtered.length;
    $("#taskList").innerHTML = filtered.map(renderTask).join("");
    $("#emptyState").hidden = filtered.length !== 0;
    $("#taskList").hidden = filtered.length === 0;
    $("#footerSummary").textContent = `Showing ${filtered.length} of ${tasks.length} task${tasks.length===1?"":"s"}`;
  }
  function openModal(task=null) {
    $("#taskForm").reset();
    $("#taskId").value = task ? task.id : "";
    $("#modalTitle").textContent = task ? "Edit task" : "Create a task";
    $("#saveTaskBtn").innerHTML = task ? "Save changes <span>↗</span>" : "Save task <span>↗</span>";
    $("#taskTitle").value = task?.title || "";
    $("#taskDescription").value = task?.description || "";
    $("#taskStatus").value = task?.status || "To do";
    $("#taskPriority").value = task?.priority || "Medium";
    $("#taskDue").value = task?.due || "";
    $("#taskModal").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#taskTitle").focus(), 40);
  }
  function closeModal() {
    $("#taskModal").hidden = true;
    document.body.style.overflow = "";
  }
  function addOrUpdateTask(event) {
    event.preventDefault();
    const title = $("#taskTitle").value.trim();
    if (!title) { $("#taskTitle").focus(); return; }
    const id = $("#taskId").value;
    const existing = tasks.find(t=>t.id===id);
    const task = {
      id: id || makeId(),
      title,
      description: $("#taskDescription").value.trim(),
      status: $("#taskStatus").value,
      priority: $("#taskPriority").value,
      due: $("#taskDue").value,
      created: existing ? existing.created : Date.now()
    };
    if (existing) {
      tasks = tasks.map(t=>t.id===id ? task : t);
      showToast("Task updated successfully.");
    } else {
      tasks.unshift(task);
      showToast("Task created. You’ve got this!");
    }
    saveTasks();
    closeModal();
    activeView = "all"; activePriority = ""; activeStatus = "All";
    render();
  }
  function setTaskStatus(id, status) {
    tasks = tasks.map(task => task.id===id ? {...task,status} : task);
    saveTasks(); render();
    showToast(status==="Completed" ? "Nice work — task completed!" : "Task status updated.");
  }

  $("#addTaskBtn").addEventListener("click", () => openModal());
  $("#emptyAddBtn").addEventListener("click", () => openModal());
  $("#closeModal").addEventListener("click", closeModal);
  $("#cancelModal").addEventListener("click", closeModal);
  $("#taskModal").addEventListener("click", event => { if (event.target === $("#taskModal")) closeModal(); });
  $("#taskForm").addEventListener("submit", addOrUpdateTask);
  $("#searchInput").addEventListener("input", render);
  $("#sortSelect").addEventListener("change", render);
  $("#clearCompleted").addEventListener("click", () => {
    const count = tasks.filter(t=>t.status==="Completed").length;
    if (!count) { showToast("No completed tasks to clear."); return; }
    if (confirm(`Delete ${count} completed task${count===1?"":"s"}? This cannot be undone.`)) {
      tasks = tasks.filter(t=>t.status!=="Completed"); saveTasks(); render(); showToast("Completed tasks cleared.");
    }
  });
  $$(".nav-item").forEach(button => button.addEventListener("click", () => {
    if (button.dataset.view) { activeView = button.dataset.view; activePriority = ""; activeStatus = activeView==="completed" ? "Completed" : "All"; }
    if (button.dataset.priority) { activePriority = button.dataset.priority; activeView = "all"; activeStatus = "All"; }
    if ($("#sidebar").classList.contains("open")) $("#sidebar").classList.remove("open");
    render();
  }));
  $$(".filter-tab").forEach(button => button.addEventListener("click", () => {
    activeStatus = button.dataset.status;
    activeView = "all"; activePriority = "";
    render();
  }));
  $("#taskList").addEventListener("change", event => {
    const row = event.target.closest(".task-row"); if (!row) return;
    const task = tasks.find(t=>t.id===row.dataset.id); if (!task) return;
    if (event.target.classList.contains("task-check")) setTaskStatus(task.id, event.target.checked ? "Completed" : "To do");
    if (event.target.classList.contains("status-select")) setTaskStatus(task.id, event.target.value);
  });
  $("#taskList").addEventListener("click", event => {
    const row = event.target.closest(".task-row"); if (!row) return;
    const task = tasks.find(t=>t.id===row.dataset.id); if (!task) return;
    if (event.target.closest(".edit-task")) openModal(task);
    if (event.target.closest(".delete-task")) {
      if (confirm(`Delete "${task.title}"?`)) { tasks = tasks.filter(t=>t.id!==task.id); saveTasks(); render(); showToast("Task deleted."); }
    }
  });
  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    $("#themeToggle").textContent = dark ? "☀" : "☾";
  });
  $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("#taskModal").hidden) closeModal();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#searchInput").focus(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") { event.preventDefault(); openModal(); }
  });

  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === "dark") { document.body.classList.add("dark"); $("#themeToggle").textContent = "☀"; }
  $("#todayDate").textContent = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  render();
})();
