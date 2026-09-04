const STORAGE_KEY = "qbc-workboard-v1";
/* Bumped when the seed grows a collection, so a workspace saved by an earlier version of this
   mock is reseeded rather than read back without it. */
const APP_VERSION = 2;

const seedWorkspace = () => ({
  version: APP_VERSION,
  assistants: [
    { id: "asst-maya", name: "Maya Chen", role: "Product & Research Assistant", specialties: ["Discovery", "User research", "Product ops"], availability: "Available" },
    { id: "asst-noah", name: "Noah Williams", role: "Software Development Assistant", specialties: ["Full-stack", "Quality", "APIs"], availability: "Available" },
    { id: "asst-amara", name: "Amara Okafor", role: "AI Delivery Assistant", specialties: ["AI workflows", "Evaluation", "Data"], availability: "Limited" }
  ],
  initiatives: [
    { id: "init-client", title: "Client Delivery Excellence", description: "# Client Delivery Excellence\n\nMake every consulting engagement clear, predictable, and valuable.\n\n## Outcome\n\nA client can see where their engagement stands without asking for a status call." },
    { id: "init-ai", title: "AI-Enabled Consulting", description: "# AI-Enabled Consulting\n\nBuild practical AI capabilities that improve how clients work.\n\n## Outcome\n\nA consultant reaches a defensible recommendation in days rather than weeks." }
  ],
  epics: [
    { id: "epic-portal", initiativeId: "init-client", title: "Client project portal", summary: "# Client project portal\n\nA calm, shared view of delivery progress and decisions.\n\n## Scope\n\n- Outcomes, decisions, and milestones on one page" },
    { id: "epic-playbook", initiativeId: "init-client", title: "Delivery playbook", summary: "Reusable practices for faster project starts." },
    { id: "epic-copilot", initiativeId: "init-ai", title: "Consulting copilot", summary: "Responsible AI assistance for research and delivery." }
  ],
  stories: [
    {
      id: "story-101", key: "QBC-101", epicId: "epic-portal", title: "See a concise project health summary",
      description: "As a client, I want a quick project health summary so that I know where attention is needed.",
      acceptanceCriteria: "Shows delivery status, risks, next milestone, and last updated time.", points: 5,
      state: "active", ready: true, assistantId: "asst-noah", sprintId: "sprint-14", boardStatus: "progress",
      tasks: [
        { id: "task-101a", title: "Build summary card", done: true, assistantId: "asst-noah" },
        { id: "task-101b", title: "Review health language", done: false, assistantId: "asst-maya" }
      ]
    },
    {
      id: "story-102", key: "QBC-102", epicId: "epic-portal", title: "Capture a client decision",
      description: "As a consultant, I want to record a client decision with context so that the team can act consistently.",
      acceptanceCriteria: "A decision includes owner, date, context, and outcome.", points: 3,
      state: "active", ready: true, assistantId: "asst-maya", sprintId: "sprint-14", boardStatus: "todo",
      tasks: [{ id: "task-102a", title: "Draft decision form", done: false, assistantId: "asst-maya" }]
    },
    {
      id: "story-103", key: "QBC-103", epicId: "epic-copilot", title: "Evaluate answers against source material",
      description: "As an AI delivery lead, I want grounded-answer evaluation so that client recommendations remain trustworthy.",
      acceptanceCriteria: "Evaluation reports citation coverage and unsupported claims for a test set.", points: 8,
      state: "active", ready: true, assistantId: "asst-amara", sprintId: "sprint-14", boardStatus: "todo", tasks: []
    },
    {
      id: "story-104", key: "QBC-104", epicId: "epic-playbook", title: "Start a project from a lightweight checklist",
      description: "As a delivery lead, I want a repeatable kickoff checklist so that setup work is not missed.",
      acceptanceCriteria: "Checklist covers access, stakeholders, goals, risks, and communication cadence.", points: 3,
      state: "active", ready: true, assistantId: null, sprintId: "sprint-14", boardStatus: "done",
      tasks: [{ id: "task-104a", title: "Validate with recent projects", done: true, assistantId: "asst-maya" }]
    },
    {
      id: "story-105", key: "QBC-105", epicId: "epic-copilot", title: "Create an AI engagement risk canvas",
      description: "As a consultant, I want to identify AI delivery risks early so that mitigations are part of the plan.",
      acceptanceCriteria: "Canvas covers privacy, quality, adoption, security, and human oversight.", points: 5,
      state: "active", ready: true, assistantId: "asst-amara", sprintId: null, boardStatus: "todo", tasks: []
    },
    {
      id: "story-106", key: "QBC-106", epicId: "epic-portal", title: "Share milestone notes with clients",
      description: "As a client, I want milestone notes in one place so that I can review decisions and outcomes.",
      acceptanceCriteria: "", points: 0, state: "draft", ready: false, assistantId: null, sprintId: null, boardStatus: "todo", tasks: []
    },
    {
      id: "story-097", key: "QBC-097", epicId: "epic-playbook", title: "Compare kickoff template formats",
      description: "An older exploration retained for reference.", acceptanceCriteria: "Research is summarized.", points: 2,
      state: "archived", ready: false, assistantId: null, sprintId: null, boardStatus: "todo", tasks: []
    }
  ],
  /* Time entries are the study's own invention: nothing in the product records how long work
     took. An entry ties one assistant to one story on one day, which is also what makes
     "every story an assistant worked on" answerable — the story's own assistantId only ever
     names who owns it now. */
  timeEntries: [
    { id: "time-001", storyId: "story-101", assistantId: "asst-noah", date: "2026-08-31", hours: 3, note: "Sketched the summary card" },
    { id: "time-002", storyId: "story-101", assistantId: "asst-noah", date: "2026-09-01", hours: 4.5, note: "Built the card and its states" },
    { id: "time-003", storyId: "story-101", assistantId: "asst-maya", date: "2026-09-02", hours: 1.5, note: "Reviewed the health language" },
    { id: "time-004", storyId: "story-101", assistantId: "asst-noah", date: "2026-09-03", hours: 2, note: "Handled the empty and stale cases" },
    { id: "time-005", storyId: "story-102", assistantId: "asst-maya", date: "2026-09-01", hours: 2.5, note: "Drafted the decision form" },
    { id: "time-006", storyId: "story-102", assistantId: "asst-maya", date: "2026-09-03", hours: 3, note: "Walked it through with delivery" },
    { id: "time-007", storyId: "story-103", assistantId: "asst-amara", date: "2026-09-01", hours: 5, note: "Built the citation-coverage check" },
    { id: "time-008", storyId: "story-103", assistantId: "asst-amara", date: "2026-09-02", hours: 3, note: "Assembled the test set" },
    { id: "time-009", storyId: "story-103", assistantId: "asst-noah", date: "2026-09-04", hours: 1.5, note: "Paired on the evaluation harness" },
    { id: "time-010", storyId: "story-104", assistantId: "asst-maya", date: "2026-08-31", hours: 4, note: "Validated against three recent projects" },
    { id: "time-011", storyId: "story-104", assistantId: "asst-noah", date: "2026-09-01", hours: 2, note: "Turned the notes into a checklist" },
    { id: "time-012", storyId: "story-105", assistantId: "asst-amara", date: "2026-09-03", hours: 2.5, note: "First pass at the risk canvas" },
    { id: "time-013", storyId: "story-097", assistantId: "asst-maya", date: "2026-08-31", hours: 1, note: "Closed out the old comparison" },
    { id: "time-014", storyId: "story-102", assistantId: "asst-noah", date: "2026-09-04", hours: 1, note: "Wired the form to the store" }
  ],
  sprints: [
    { id: "sprint-14", name: "Sprint 14", goal: "Give clients a clearer view of delivery and decisions.", startDate: "2026-08-31", status: "active" },
    { id: "sprint-15", name: "Sprint 15", goal: "Make responsible AI engagement planning repeatable.", startDate: "2026-09-14", status: "planned" },
    { id: "sprint-13", name: "Sprint 13", goal: "Standardize the first week of a new engagement.", startDate: "2026-08-17", status: "completed" }
  ]
});

let workspace = loadWorkspace();
let viewState = { search: "", backlogFilter: "all" };
let modalTasks = [];
let modalTimeEntries = [];

const main = document.querySelector("#main-content");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const confirmDialog = document.querySelector("#confirm-dialog");

function loadWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.version === APP_VERSION) return saved;
  } catch (error) {
    console.warn("The saved QBC workspace could not be loaded.", error);
  }
  const seeded = seedWorkspace();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveWorkspace() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function commit(message, type = "success") {
  saveWorkspace();
  render();
  if (message) toast(message, type);
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?";
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${dateString}T12:00:00`));
}

function formatSprintDates(sprint) {
  return `${formatDate(sprint.startDate)} – ${formatDate(addDays(sprint.startDate, 13))}`;
}

function nextStoryKey() {
  const max = workspace.stories.reduce((result, story) => Math.max(result, Number(story.key?.split("-")[1]) || 0), 100);
  return `QBC-${max + 1}`;
}

function getAssistant(id) { return workspace.assistants.find(item => item.id === id); }
function getEpic(id) { return workspace.epics.find(item => item.id === id); }
function getInitiative(id) { return workspace.initiatives.find(item => item.id === id); }
function getSprint(id) { return workspace.sprints.find(item => item.id === id); }

function assistantAvatar(id, large = false) {
  const assistant = getAssistant(id);
  return assistant
    ? `<span class="avatar ${large ? "large" : ""}" title="${escapeHTML(assistant.name)}" aria-label="Assigned to ${escapeHTML(assistant.name)}">${escapeHTML(initials(assistant.name))}</span>`
    : `<span class="avatar unassigned ${large ? "large" : ""}" title="Unassigned" aria-label="Unassigned">—</span>`;
}

function route() {
  const candidate = location.hash.replace("#", "") || "board";
  return ["board", "backlog", "hierarchy", "assistants"].includes(candidate) ? candidate : "board";
}

function render() {
  const current = route();
  document.querySelectorAll("[data-nav]").forEach(link => link.classList.toggle("active", link.dataset.nav === current));
  document.querySelector("#breadcrumb").textContent = `Workspace / ${current === "hierarchy" ? "Initiatives" : current[0].toUpperCase() + current.slice(1)}`;
  main.innerHTML = current === "board" ? renderBoard()
    : current === "backlog" ? renderBacklog()
    : current === "hierarchy" ? renderHierarchy()
    : renderAssistants();
  document.querySelector(".sidebar").classList.remove("open");
  document.querySelector("[data-action='toggle-nav']").setAttribute("aria-expanded", "false");
}

/* ---- Logged hours ---------------------------------------------------- */

function entriesForStory(storyId) {
  return workspace.timeEntries.filter(entry => entry.storyId === storyId);
}

function entriesForAssistant(assistantId) {
  return workspace.timeEntries.filter(entry => entry.assistantId === assistantId);
}

function sumHours(entries) {
  return entries.reduce((total, entry) => total + Number(entry.hours || 0), 0);
}

/**
 * Hours are logged in quarters, so two decimals are kept and trailing zeros dropped: 3 reads as
 * "3", 4.5 as "4.5", and 10.25 as "10.25" rather than rounding to a total that does not add up.
 */
function formatHours(hours) {
  return `${Math.round(hours * 100) / 100}`;
}

function storyHours(storyId) {
  return sumHours(entriesForStory(storyId));
}

function assistantHours(assistantId) {
  return sumHours(entriesForAssistant(assistantId));
}

function pageHead(title, copy, actions = "") {
  return `<header class="page-head"><div><h1>${title}</h1><p>${copy}</p></div>${actions ? `<div class="page-actions">${actions}</div>` : ""}</header>`;
}

function emptyState(title, copy, action = "") {
  return `<div class="empty-state"><div class="empty-icon" aria-hidden="true">◇</div><h2>${title}</h2><p>${copy}</p>${action}</div>`;
}

function renderBoard() {
  const sprint = workspace.sprints.find(item => item.status === "active");
  if (!sprint) {
    return `<section class="page">${pageHead("Sprint board", "Focus on the work that matters now.", `<button class="secondary-button" data-action="manage-sprints">Manage sprints</button>`)}${emptyState("No active sprint", "Start a planned sprint to bring ready stories onto the board.", `<button class="primary-button" data-action="manage-sprints">Choose a sprint</button>`)}</section>`;
  }

  const stories = workspace.stories.filter(story => story.sprintId === sprint.id && story.state !== "archived");
  const done = stories.filter(story => story.boardStatus === "done").length;
  const percentage = stories.length ? Math.round((done / stories.length) * 100) : 0;
  const columns = [
    ["todo", "To do"],
    ["progress", "In progress"],
    ["done", "Done"]
  ];

  return `<section class="page">
    ${pageHead("Sprint board", "A quiet view of the team’s current commitment.", `<button class="secondary-button" data-action="manage-sprints">Manage sprints</button>`)}
    <section class="sprint-hero" aria-label="Current sprint summary">
      <div><p class="eyebrow">Current sprint · ${escapeHTML(sprint.name)}</p><h2>${escapeHTML(sprint.goal)}</h2><p class="goal">${formatSprintDates(sprint)}</p></div>
      <div class="sprint-meta"><div class="sprint-meta-line"><span>${done} of ${stories.length} stories complete</span><strong>${percentage}%</strong></div><div class="progress-track"><div class="progress-bar" style="width:${percentage}%"></div></div></div>
    </section>
    <div class="board">
      ${columns.map(([status, label]) => {
        const inColumn = stories.filter(story => story.boardStatus === status);
        return `<section class="board-column" data-drop-status="${status}" aria-labelledby="column-${status}">
          <header class="column-head"><h2 id="column-${status}">${label}</h2><span class="count">${inColumn.length}</span></header>
          <div class="card-stack">${inColumn.length ? inColumn.map(renderStoryCard).join("") : `<div class="empty-state"><p>No stories here</p></div>`}</div>
        </section>`;
      }).join("")}
    </div>
  </section>`;
}

function renderStoryCard(story) {
  const epic = getEpic(story.epicId);
  const statuses = ["todo", "progress", "done"];
  const position = statuses.indexOf(story.boardStatus);
  const completedTasks = story.tasks.filter(task => task.done).length;
  const logged = storyHours(story.id);
  return `<article class="story-card" draggable="true" data-story-card="${story.id}">
    <div class="card-top"><span class="story-key">${escapeHTML(story.key)}</span><span class="card-top-meta">${logged ? `<span class="hours" title="${formatHours(logged)} hours logged">${formatHours(logged)} h</span>` : ""}<span class="points" title="${story.points} story points">${story.points}</span></span></div>
    <h3>${escapeHTML(story.title)}</h3>
    <p class="card-context">${escapeHTML(epic?.title || "No epic")}${story.tasks.length ? ` · ${completedTasks}/${story.tasks.length} tasks` : ""}</p>
    <footer class="card-foot">${assistantAvatar(story.assistantId)}<div class="card-actions">
      <button class="quiet-button" data-action="move-story" data-id="${story.id}" data-direction="-1" ${position === 0 ? "disabled" : ""} aria-label="Move ${escapeHTML(story.title)} backward">←</button>
      <button class="quiet-button" data-action="log-hours" data-id="${story.id}" aria-label="Log hours against ${escapeHTML(story.title)}">&#9201;</button>
      <button class="quiet-button" data-action="edit-story" data-id="${story.id}">Edit</button>
      <button class="quiet-button" data-action="move-story" data-id="${story.id}" data-direction="1" ${position === 2 ? "disabled" : ""} aria-label="Move ${escapeHTML(story.title)} forward">→</button>
    </div></footer>
  </article>`;
}

function renderBacklog() {
  const query = viewState.search.trim().toLowerCase();
  const filter = viewState.backlogFilter;
  const stories = workspace.stories
    .filter(story => {
      const epic = getEpic(story.epicId);
      const matchesSearch = !query || `${story.key} ${story.title} ${epic?.title || ""}`.toLowerCase().includes(query);
      const matchesFilter = filter === "all"
        || (filter === "ready" && story.ready && story.state !== "archived")
        || (filter === "draft" && story.state === "draft")
        || (filter === "archived" && story.state === "archived")
        || (filter === "unscheduled" && !story.sprintId && story.state !== "archived");
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => Number(a.state === "archived") - Number(b.state === "archived") || a.key.localeCompare(b.key, undefined, { numeric: true }));

  return `<section class="page">
    ${pageHead("Backlog", "Shape ideas into ready work, then place them into a two-week sprint.")}
    <div class="toolbar">
      <label class="search-wrap"><span aria-hidden="true">⌕</span><span class="visually-hidden"></span><input data-control="backlog-search" value="${escapeHTML(viewState.search)}" placeholder="Search stories or epics" aria-label="Search backlog"></label>
      <select data-control="backlog-filter" aria-label="Filter backlog">
        ${[["all", "All stories"], ["unscheduled", "Unscheduled"], ["ready", "Ready"], ["draft", "Draft"], ["archived", "Archived"]].map(([value, label]) => `<option value="${value}" ${filter === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </div>
    ${stories.length ? `<div class="data-list">${stories.map(renderBacklogRow).join("")}</div>` : emptyState("No matching stories", "Try a different search or create a new story.", `<button class="primary-button" data-action="new-story">New story</button>`) }
  </section>`;
}

function renderBacklogRow(story) {
  const epic = getEpic(story.epicId);
  const initiative = getInitiative(epic?.initiativeId);
  const sprint = getSprint(story.sprintId);
  let badge = `<span class="pill draft">Draft</span>`;
  if (story.state === "archived") badge = `<span class="pill archived">Archived</span>`;
  else if (story.ready) badge = `<span class="pill ready">Ready</span>`;
  const plannedSprints = workspace.sprints.filter(item => item.status !== "completed");
  return `<article class="data-row">
    <div class="row-title"><span class="story-key">${escapeHTML(story.key)}</span><div><strong>${escapeHTML(story.title)}</strong><small>${escapeHTML(initiative?.title || "No initiative")} / ${escapeHTML(epic?.title || "No epic")}</small></div></div>
    <div><span class="cell-label">Readiness</span>${badge}</div>
    <div><span class="cell-label">Points</span><span class="points">${story.points || "—"}</span></div>
    <div><span class="cell-label">Sprint</span>${story.state === "archived"
      ? `<span class="pill muted">Not planned</span>`
      : sprint?.status === "completed"
        ? `<span class="pill done">${escapeHTML(sprint.name)} complete</span>`
        : `<select data-control="story-sprint" data-id="${story.id}" aria-label="Sprint for ${escapeHTML(story.title)}" ${!story.ready ? "disabled" : ""}><option value="">Backlog</option>${plannedSprints.map(item => `<option value="${item.id}" ${story.sprintId === item.id ? "selected" : ""}>${escapeHTML(item.name)}</option>`).join("")}</select>`}</div>
    <div class="row-actions">
      ${story.state === "archived"
        ? `<button class="secondary-button" data-action="restore-story" data-id="${story.id}">Restore</button>`
        : `<button class="secondary-button" data-action="${story.ready ? "ungroom-story" : "groom-story"}" data-id="${story.id}">${story.ready ? "Unready" : "Groom"}</button>`}
      <button class="quiet-button" data-action="edit-story" data-id="${story.id}">Edit</button>
      <button class="quiet-button" data-action="story-more" data-id="${story.id}" aria-label="More actions for ${escapeHTML(story.title)}">•••</button>
    </div>
  </article>`;
}

function renderHierarchy() {
  return `<section class="page">
    ${pageHead("Initiatives", "Connect today’s stories to the outcomes they move forward.", `<button class="secondary-button" data-action="new-epic">New epic</button><button class="primary-button" data-action="new-initiative">New initiative</button>`)}
    ${workspace.initiatives.length ? `<div class="hierarchy-list">${workspace.initiatives.map(renderInitiative).join("")}</div>` : emptyState("No initiatives yet", "Create an initiative to give your work a shared direction.", `<button class="primary-button" data-action="new-initiative">New initiative</button>`)}
  </section>`;
}

/**
 * An initiative's description is a markdown outcome brief, and the card has one line for it, so it
 * carries the brief's first line of prose. Headings, quotes, and table rows are skipped: a brief
 * that opens with its title would otherwise be summarised by its own scaffolding.
 */
function summariseBrief(markdown = "") {
  const prose = markdown.split("\n").find(line => line.trim() && !/^[#>|]/.test(line.trim()));
  return prose === undefined ? "No brief written yet." : prose.replace(/[*_`]/g, "");
}

/** An assistant's hours live on their own page, which the directory links out to. */
function openAssistantHours(id) {
  window.location.href = `assistant-hours.html?assistantId=${encodeURIComponent(id)}`;
}

/** The name and the brief are saved together, so both are written on the initiative's own page. */
function openInitiativeEditor(id) {
  window.location.href = id ? `initiative-editor.html?id=${encodeURIComponent(id)}` : "initiative-editor.html?new";
}

/** An epic is a parent, a name, and a markdown summary, written on the same page an initiative is. */
function openEpicEditor(id, initiativeId) {
  const query = id
    ? `?kind=epic&id=${encodeURIComponent(id)}`
    : `?kind=epic&new&initiativeId=${encodeURIComponent(initiativeId || "")}`;
  window.location.href = `initiative-editor.html${query}`;
}

function renderInitiative(initiative) {
  const epics = workspace.epics.filter(epic => epic.initiativeId === initiative.id);
  const storyCount = epics.reduce((count, epic) => count + workspace.stories.filter(story => story.epicId === epic.id && story.state !== "archived").length, 0);
  return `<article class="initiative-card">
    <header class="initiative-head">
      <div class="initiative-title"><span class="brand-mark" aria-hidden="true">↗</span><div><h2>${escapeHTML(initiative.title)}</h2><p>${escapeHTML(summariseBrief(initiative.description))}</p></div></div>
      <div class="hierarchy-actions"><span class="pill muted">${epics.length} epics · ${storyCount} stories</span><button class="quiet-button" data-action="edit-initiative" data-id="${initiative.id}">Edit</button><button class="quiet-button" data-action="delete-initiative" data-id="${initiative.id}">Delete</button></div>
    </header>
    <div class="epic-list">
      ${epics.length ? epics.map(renderEpic).join("") : `<div class="epic-row"><small>No epics in this initiative</small><button class="secondary-button" data-action="new-epic" data-initiative-id="${initiative.id}">Add epic</button></div>`}
      ${epics.length ? `<button class="quiet-button" data-action="new-epic" data-initiative-id="${initiative.id}">＋ Add epic</button>` : ""}
    </div>
  </article>`;
}

function renderEpic(epic) {
  const stories = workspace.stories.filter(story => story.epicId === epic.id && story.state !== "archived");
  const done = stories.filter(story => story.boardStatus === "done").length;
  const progress = stories.length ? Math.round(done / stories.length * 100) : 0;
  return `<div class="epic-row"><div><strong>${escapeHTML(epic.title)}</strong><small>${escapeHTML(summariseBrief(epic.summary))} · ${stories.length} stories</small></div><div class="mini-progress" aria-label="${progress}% complete"><div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div></div><div class="hierarchy-actions"><button class="quiet-button" data-action="new-story" data-epic-id="${epic.id}">＋ Story</button><button class="quiet-button" data-action="edit-epic" data-id="${epic.id}">Edit</button><button class="quiet-button" data-action="delete-epic" data-id="${epic.id}">Delete</button></div></div>`;
}

function renderAssistants() {
  return `<section class="page">
    ${pageHead("Assistants", "Keep ownership visible across stories and the tasks inside them.", `<button class="primary-button" data-action="new-assistant">New assistant</button>`)}
    ${workspace.assistants.length ? `<div class="assistant-grid">${workspace.assistants.map(renderAssistant).join("")}</div>` : emptyState("No assistants yet", "Add an assistant, then assign them to stories and tasks.", `<button class="primary-button" data-action="new-assistant">New assistant</button>`)}
  </section>`;
}

function renderAssistant(assistant) {
  const storyWork = workspace.stories.filter(story => story.assistantId === assistant.id && story.state !== "archived").length;
  const taskWork = workspace.stories.reduce((count, story) => count + story.tasks.filter(task => task.assistantId === assistant.id && !task.done).length, 0);
  return `<article class="assistant-card">
    <div class="assistant-main">${assistantAvatar(assistant.id, true)}<div><h2>${escapeHTML(assistant.name)}</h2><p>${escapeHTML(assistant.role)}</p></div></div>
    <div class="tag-list">${assistant.specialties.map(item => `<span class="tag">${escapeHTML(item)}</span>`).join("") || `<span class="tag">No specialties added</span>`}</div>
    <footer class="assistant-foot"><div><span class="availability">${escapeHTML(assistant.availability)}</span><small>${storyWork} stories · ${taskWork} open tasks · ${formatHours(assistantHours(assistant.id))} h logged</small></div><div class="row-actions"><button class="quiet-button" data-action="assistant-hours" data-id="${assistant.id}">Hours</button><button class="quiet-button" data-action="edit-assistant" data-id="${assistant.id}">Edit</button><button class="quiet-button" data-action="delete-assistant" data-id="${assistant.id}">Delete</button></div></footer>
  </article>`;
}

function field(name, label, value = "", options = {}) {
  const required = options.required ? `<span class="required" aria-hidden="true">*</span>` : "";
  /* A number field needs its step, or the browser rejects a half hour against the default step of 1. */
  const numeric = options.type === "number" ? `min="${options.min ?? 0.25}" step="${options.step ?? 0.25}"` : "";
  const attrs = `${options.required ? "required" : ""} ${options.placeholder ? `placeholder="${escapeHTML(options.placeholder)}"` : ""} ${numeric}`;
  const control = options.type === "textarea"
    ? `<textarea id="field-${name}" name="${name}" ${attrs}>${escapeHTML(value)}</textarea>`
    : options.type === "select"
      ? `<select id="field-${name}" name="${name}" ${attrs}>${options.choices.map(([choiceValue, choiceLabel]) => `<option value="${escapeHTML(choiceValue)}" ${String(value) === String(choiceValue) ? "selected" : ""}>${escapeHTML(choiceLabel)}</option>`).join("")}</select>`
      : `<input id="field-${name}" name="${name}" type="${options.type || "text"}" value="${escapeHTML(value)}" ${attrs}>`;
  return `<div class="field ${options.full ? "full" : ""}"><label for="field-${name}">${label} ${required}</label>${control}${options.hint ? `<small class="field-hint">${options.hint}</small>` : ""}</div>`;
}

function showEntityForm(kind, id = "", preset = {}) {
  let title = "";
  let subtitle = "";
  let body = "";
  modalTasks = [];

  if (kind === "story") {
    const item = workspace.stories.find(story => story.id === id);
    title = item ? `Edit ${item.key}` : "Create a story";
    subtitle = "A small, valuable piece of work connected to an epic.";
    modalTasks = item ? structuredClone(item.tasks) : [];
    modalTimeEntries = item ? structuredClone(entriesForStory(item.id)) : [];
    const epicChoices = [["", "Choose an epic"], ...workspace.epics.map(epic => [epic.id, `${getInitiative(epic.initiativeId)?.title || "Initiative"} / ${epic.title}`])];
    const assistantChoices = [["", "Unassigned"], ...workspace.assistants.map(assistant => [assistant.id, assistant.name])];
    body = `<div class="form-grid">
      ${field("title", "Story title", item?.title, { required: true, full: true, placeholder: "Describe the outcome" })}
      ${field("epicId", "Epic", item?.epicId || preset.epicId || "", { type: "select", choices: epicChoices, required: true })}
      ${field("assistantId", "Owner", item?.assistantId || "", { type: "select", choices: assistantChoices })}
      ${field("description", "User story / description", item?.description, { type: "textarea", required: true, full: true, placeholder: "As a… I want… so that…" })}
      ${field("acceptanceCriteria", "Acceptance criteria", item?.acceptanceCriteria, { type: "textarea", required: true, full: true, placeholder: "What must be true when this is complete?" })}
      ${field("points", "Story points", item?.points || "", { type: "select", required: true, choices: [["", "Choose points"], ...[1, 2, 3, 5, 8, 13].map(point => [point, String(point)])] })}
      ${field("state", "Lifecycle", item ? (item.state === "draft" ? "draft" : "active") : "draft", { type: "select", choices: [["draft", "Draft"], ["active", "Active"]], hint: "New stories begin as drafts. Use story actions to archive work." })}
      <div class="task-editor"><div class="section-label"><h3>Tasks <span class="pill muted">Optional</span></h3><small class="field-hint">A lightweight checklist inside this story.</small></div><div class="task-list" id="modal-task-list"></div><div class="task-add"><input id="new-task-title" placeholder="Add a task" aria-label="New task title"><select id="new-task-assistant" aria-label="New task assignee">${assistantChoices.map(([value, label]) => `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`).join("")}</select><button class="secondary-button" type="button" data-action="modal-add-task">Add</button></div></div>
      ${item ? renderTimePanel(assistantChoices) : `<div class="task-editor"><div class="section-label"><h3>Time logged</h3><small class="field-hint">Hours can be logged once the story exists.</small></div></div>`}
    </div>`;
  } else if (kind === "assistant") {
    const item = workspace.assistants.find(assistant => assistant.id === id);
    title = item ? "Edit assistant" : "Create an assistant";
    subtitle = "Add a collaborator who can own stories and tasks.";
    body = `<div class="form-grid">${field("name", "Full name", item?.name, { required: true })}${field("role", "Role", item?.role, { required: true })}${field("specialties", "Specialties", item?.specialties.join(", "), { full: true, placeholder: "Research, APIs, Quality", hint: "Separate specialties with commas." })}${field("availability", "Availability", item?.availability || "Available", { type: "select", choices: [["Available", "Available"], ["Limited", "Limited"], ["Unavailable", "Unavailable"]] })}</div>`;
  } else if (kind === "sprint") {
    const item = workspace.sprints.find(sprint => sprint.id === id);
    title = item ? "Edit sprint" : "Create a sprint";
    subtitle = "Sprints last 14 calendar days. The end date is calculated for you.";
    body = `<div class="form-grid">${field("name", "Sprint name", item?.name, { required: true })}${field("startDate", "Start date", item?.startDate || new Date().toISOString().slice(0, 10), { type: "date", required: true })}${field("goal", "Sprint goal", item?.goal, { type: "textarea", required: true, full: true, placeholder: "What outcome will this sprint create?" })}</div>`;
  }

  modalContent.innerHTML = `<form class="dialog-shell" id="entity-form" data-kind="${kind}" data-id="${id}" novalidate>
    <header class="dialog-head"><div><h2 id="modal-title">${title}</h2><p>${subtitle}</p></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close dialog">×</button></header>
    <div class="dialog-body"><div id="form-error"></div>${body}</div>
    <footer class="dialog-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">${id ? "Save changes" : "Create"}</button></footer>
  </form>`;
  if (kind === "story") { renderModalTasks(); renderModalTimeEntries(); }
  modal.showModal();
  requestAnimationFrame(() => modal.querySelector("input, select, textarea")?.focus());
}

/**
 * Hours an assistant spent on this story. It mirrors the task checklist above it: a list held
 * in a module-level array while the dialog is open, merged into the store on submit.
 */
function renderTimePanel(assistantChoices) {
  const options = assistantChoices.filter(([value]) => value);
  return `<div class="task-editor time-editor">
    <div class="section-label"><h3>Time logged <span class="hours" id="modal-time-total">0 h</span></h3><small class="field-hint">Who spent how long on this story, and on what.</small></div>
    <div class="time-list" id="modal-time-list"></div>
    <div class="time-add">
      <input id="new-time-date" type="date" value="${new Date().toISOString().slice(0, 10)}" aria-label="Date worked">
      <input id="new-time-hours" type="number" min="0.25" step="0.25" placeholder="Hours" aria-label="Hours worked">
      <select id="new-time-assistant" aria-label="Who logged these hours">${options.map(([value, label]) => `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`).join("")}</select>
      <input id="new-time-note" placeholder="What was done" aria-label="What was done">
      <button class="secondary-button" type="button" data-action="modal-add-time">Add</button>
    </div>
  </div>`;
}

function renderModalTimeEntries() {
  const container = document.querySelector("#modal-time-list");
  if (!container) return;
  const ordered = [...modalTimeEntries].sort((a, b) => a.date.localeCompare(b.date));
  container.innerHTML = ordered.length
    ? ordered.map(entry => `<div class="time-row" data-time-id="${entry.id}"><span class="time-date">${formatDate(entry.date)}</span><span class="time-who">${escapeHTML(getAssistant(entry.assistantId)?.name || "Unassigned")}</span><span class="hours">${formatHours(entry.hours)} h</span><span class="time-note">${escapeHTML(entry.note) || "<em>No note</em>"}</span><button class="quiet-button" type="button" data-action="modal-delete-time" data-id="${entry.id}" aria-label="Delete the ${formatHours(entry.hours)} hour entry">×</button></div>`).join("")
    : `<small class="field-hint">No hours logged yet.</small>`;
  const total = document.querySelector("#modal-time-total");
  if (total) total.textContent = `${formatHours(sumHours(modalTimeEntries))} h`;
}

function renderModalTasks() {
  const container = document.querySelector("#modal-task-list");
  if (!container) return;
  const assistantOptions = [["", "Unassigned"], ...workspace.assistants.map(assistant => [assistant.id, assistant.name])];
  container.innerHTML = modalTasks.length ? modalTasks.map(task => `<div class="task-item ${task.done ? "done" : ""}" data-task-id="${task.id}"><input type="checkbox" data-control="modal-task-done" ${task.done ? "checked" : ""} aria-label="Mark ${escapeHTML(task.title)} complete"><input class="task-name-input" data-control="modal-task-title" value="${escapeHTML(task.title)}" aria-label="Task title" required><select data-control="modal-task-assistant" aria-label="Assignee for ${escapeHTML(task.title)}">${assistantOptions.map(([value, label]) => `<option value="${escapeHTML(value)}" ${task.assistantId === value ? "selected" : ""}>${escapeHTML(label)}</option>`).join("")}</select><button class="quiet-button" type="button" data-action="modal-delete-task" aria-label="Delete ${escapeHTML(task.title)}">×</button></div>`).join("") : `<small class="field-hint">No tasks added.</small>`;
}

function submitEntityForm(form) {
  const errorTarget = form.querySelector("#form-error");
  if (!form.checkValidity()) {
    errorTarget.innerHTML = `<p class="form-error">Complete all required fields before saving.</p>`;
    form.reportValidity();
    return;
  }
  const values = Object.fromEntries(new FormData(form));
  const { kind, id } = form.dataset;

  if (kind === "story") {
    const existing = workspace.stories.find(story => story.id === id);
    const nextState = values.state;
    const story = {
      ...(existing || {}), id: existing?.id || uid("story"), key: existing?.key || nextStoryKey(),
      title: values.title.trim(), epicId: values.epicId, assistantId: values.assistantId || null,
      description: values.description.trim(), acceptanceCriteria: values.acceptanceCriteria.trim(), points: Number(values.points),
      state: nextState, ready: nextState === "draft" ? false : Boolean(existing?.ready),
      sprintId: nextState === "draft" ? null : (existing?.sprintId || null), boardStatus: existing?.boardStatus || "todo",
      tasks: structuredClone(modalTasks)
    };
    if (existing) Object.assign(existing, story); else workspace.stories.push(story);
    if (existing) {
      workspace.timeEntries = workspace.timeEntries
        .filter(entry => entry.storyId !== story.id)
        .concat(modalTimeEntries.map(entry => ({ ...entry, storyId: story.id })));
    }
  } else if (kind === "assistant") {
    const existing = workspace.assistants.find(item => item.id === id);
    const specialties = values.specialties.split(",").map(item => item.trim()).filter(Boolean);
    const next = { id: existing?.id || uid("asst"), name: values.name.trim(), role: values.role.trim(), specialties, availability: values.availability };
    if (existing) Object.assign(existing, next); else workspace.assistants.push(next);
  } else if (kind === "sprint") {
    const existing = workspace.sprints.find(item => item.id === id);
    const next = { id: existing?.id || uid("sprint"), name: values.name.trim(), goal: values.goal.trim(), startDate: values.startDate, status: existing?.status || "planned" };
    if (existing) Object.assign(existing, next); else workspace.sprints.push(next);
  }
  modal.close();
  commit(`${kind[0].toUpperCase() + kind.slice(1)} ${id ? "updated" : "created"}.`);
}

/**
 * The quick path onto a story's hours, from the board. It asks for the same four things the
 * story editor's panel does, without opening the whole story.
 */
function showLogHours(storyId) {
  const story = workspace.stories.find(item => item.id === storyId);
  if (!story) return;
  const options = workspace.assistants.map(assistant => [assistant.id, assistant.name]);
  const suggested = story.assistantId || options[0]?.[0] || "";
  modalContent.innerHTML = `<form class="dialog-shell" id="log-hours-form" data-id="${story.id}" novalidate>
    <header class="dialog-head"><div><h2 id="modal-title">Log hours</h2><p>${escapeHTML(story.key)} · ${escapeHTML(story.title)}</p></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close dialog">×</button></header>
    <div class="dialog-body"><div id="form-error"></div><div class="form-grid">
      ${field("assistantId", "Who", suggested, { type: "select", required: true, choices: options })}
      ${field("date", "Date worked", new Date().toISOString().slice(0, 10), { type: "date", required: true })}
      ${field("hours", "Hours", "", { type: "number", required: true, placeholder: "1.5" })}
      ${field("note", "What was done", "", { full: true, placeholder: "A short note for whoever reads this later" })}
    </div></div>
    <footer class="dialog-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Log hours</button></footer>
  </form>`;
  modal.showModal();
  requestAnimationFrame(() => modal.querySelector("select, input")?.focus());
}

function submitLogHours(form) {
  const errorTarget = form.querySelector("#form-error");
  const values = Object.fromEntries(new FormData(form));
  const hours = Number(values.hours);
  if (!form.checkValidity() || !(hours > 0)) {
    errorTarget.innerHTML = `<p class="form-error">Enter who worked, the date, and a number of hours above zero.</p>`;
    form.reportValidity();
    return;
  }
  workspace.timeEntries.push({
    id: uid("time"), storyId: form.dataset.id, assistantId: values.assistantId,
    date: values.date, hours, note: values.note.trim()
  });
  modal.close();
  commit(`${formatHours(hours)} h logged.`);
}

function showSprintManager() {
  const order = { active: 0, planned: 1, completed: 2 };
  const sprints = [...workspace.sprints].sort((a, b) => order[a.status] - order[b.status] || a.startDate.localeCompare(b.startDate));
  modalContent.innerHTML = `<div class="dialog-shell">
    <header class="dialog-head"><div><h2 id="modal-title">Manage sprints</h2><p>Plan, start, and complete focused two-week cycles.</p></div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">×</button></header>
    <div class="dialog-body"><div class="section-label"><h3>${sprints.length} sprints</h3><button class="primary-button" data-action="new-sprint">＋ New sprint</button></div><div class="sprint-list">
      ${sprints.map(sprint => `<article class="sprint-row"><div><h3>${escapeHTML(sprint.name)} <span class="pill ${sprint.status}">${sprint.status}</span></h3><p>${formatSprintDates(sprint)} · ${escapeHTML(sprint.goal)}</p></div><div class="sprint-row-actions">
        ${sprint.status === "planned" ? `<button class="secondary-button" data-action="start-sprint" data-id="${sprint.id}">Start</button>` : ""}
        ${sprint.status === "active" ? `<button class="secondary-button" data-action="complete-sprint" data-id="${sprint.id}">Complete</button>` : ""}
        <button class="quiet-button" data-action="edit-sprint" data-id="${sprint.id}">Edit</button>
        ${sprint.status === "planned" ? `<button class="quiet-button" data-action="delete-sprint" data-id="${sprint.id}">Delete</button>` : ""}
      </div></article>`).join("")}
    </div></div><footer class="dialog-actions"><button class="secondary-button" data-action="close-modal">Done</button></footer>
  </div>`;
  if (!modal.open) modal.showModal();
}

function showStoryActions(id) {
  const story = workspace.stories.find(item => item.id === id);
  if (!story) return;
  modalContent.innerHTML = `<div class="dialog-shell">
    <header class="dialog-head"><div><h2 id="modal-title">${escapeHTML(story.key)}</h2><p>${escapeHTML(story.title)}</p></div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">×</button></header>
    <div class="dialog-body"><div class="sprint-list">
      <button class="secondary-button full-width" data-action="edit-story" data-id="${story.id}">Edit story and tasks</button>
      ${story.state !== "archived" ? `<button class="secondary-button full-width" data-action="archive-story" data-id="${story.id}">Archive story</button>` : `<button class="secondary-button full-width" data-action="restore-story" data-id="${story.id}">Restore to draft</button>`}
      <button class="danger-button full-width" data-action="delete-story" data-id="${story.id}">Delete permanently</button>
    </div></div><footer class="dialog-actions"><button class="secondary-button" data-action="close-modal">Cancel</button></footer>
  </div>`;
  modal.showModal();
}

function groomingProblems(story) {
  const missing = [];
  if (!story.title.trim()) missing.push("title");
  if (!getEpic(story.epicId)) missing.push("epic");
  if (!story.description.trim()) missing.push("description");
  if (!story.acceptanceCriteria.trim()) missing.push("acceptance criteria");
  if (!story.points) missing.push("story points");
  return missing;
}

function groomStory(id) {
  const story = workspace.stories.find(item => item.id === id);
  const missing = groomingProblems(story);
  if (missing.length) {
    toast(`Add ${missing.join(", ")} before marking this story Ready.`, "error");
    showEntityForm("story", id);
    return;
  }
  story.ready = true;
  story.state = "active";
  commit(`${story.key} is ready for a sprint.`);
}

function ungroomStory(id) {
  const story = workspace.stories.find(item => item.id === id);
  if (story.sprintId) {
    toast("Remove this story from its sprint before marking it unready.", "error");
    return;
  }
  story.ready = false;
  commit(`${story.key} moved back to grooming.`);
}

function moveStory(id, direction) {
  const story = workspace.stories.find(item => item.id === id);
  const statuses = ["todo", "progress", "done"];
  const next = statuses[Math.max(0, Math.min(2, statuses.indexOf(story.boardStatus) + Number(direction)))];
  if (next === story.boardStatus) return;
  story.boardStatus = next;
  commit(`${story.key} moved to ${next === "todo" ? "To do" : next === "progress" ? "In progress" : "Done"}.`);
}

function setStorySprint(id, sprintId) {
  const story = workspace.stories.find(item => item.id === id);
  if (!story.ready || story.state === "archived") {
    toast("Only ready, active stories can be placed in a sprint.", "error");
    render();
    return;
  }
  story.sprintId = sprintId || null;
  story.boardStatus = "todo";
  commit(sprintId ? `${story.key} added to ${getSprint(sprintId).name}.` : `${story.key} returned to the backlog.`);
}

function startSprint(id) {
  if (workspace.sprints.some(item => item.status === "active")) {
    toast("Complete the current sprint before starting another.", "error");
    return;
  }
  const sprint = getSprint(id);
  sprint.status = "active";
  modal.close();
  commit(`${sprint.name} started.`);
}

async function completeSprint(id) {
  const sprint = getSprint(id);
  const confirmed = await askToConfirm("Complete this sprint?", "Completed stories will stay in sprint history. Unfinished stories will return to the backlog.", "Complete sprint");
  if (!confirmed) return;
  workspace.stories.filter(story => story.sprintId === id && story.boardStatus !== "done").forEach(story => {
    story.sprintId = null;
    story.boardStatus = "todo";
  });
  sprint.status = "completed";
  modal.close();
  commit(`${sprint.name} completed. Unfinished work returned to the backlog.`);
}

async function deleteSprint(id) {
  const sprint = getSprint(id);
  if (sprint.status !== "planned") return toast("Only planned sprints can be deleted.", "error");
  const confirmed = await askToConfirm(`Delete ${sprint.name}?`, "Assigned stories will return to the backlog. This cannot be undone.", "Delete sprint");
  if (!confirmed) return;
  workspace.stories.filter(story => story.sprintId === id).forEach(story => { story.sprintId = null; story.boardStatus = "todo"; });
  workspace.sprints = workspace.sprints.filter(item => item.id !== id);
  commit(`${sprint.name} deleted.`);
  showSprintManager();
}

async function deleteInitiative(id) {
  const item = getInitiative(id);
  const count = workspace.epics.filter(epic => epic.initiativeId === id).length;
  if (count) return toast(`Move or delete ${count} linked epic${count === 1 ? "" : "s"} first.`, "error");
  if (await askToConfirm(`Delete ${item.title}?`, "This initiative will be permanently removed.", "Delete initiative")) {
    workspace.initiatives = workspace.initiatives.filter(initiative => initiative.id !== id);
    commit("Initiative deleted.");
  }
}

async function deleteEpic(id) {
  const item = getEpic(id);
  const count = workspace.stories.filter(story => story.epicId === id).length;
  if (count) return toast(`Move or delete ${count} linked stor${count === 1 ? "y" : "ies"} first.`, "error");
  if (await askToConfirm(`Delete ${item.title}?`, "This epic will be permanently removed.", "Delete epic")) {
    workspace.epics = workspace.epics.filter(epic => epic.id !== id);
    commit("Epic deleted.");
  }
}

async function deleteAssistant(id) {
  const item = getAssistant(id);
  const assignedStories = workspace.stories.filter(story => story.assistantId === id);
  const assignedTasks = workspace.stories.flatMap(story => story.tasks.filter(task => task.assistantId === id).map(task => ({ ...task, story })));
  if (assignedStories.length || assignedTasks.length) {
    modalContent.innerHTML = `<div class="dialog-shell">
      <header class="dialog-head"><div><h2 id="modal-title">${escapeHTML(item.name)} has assigned work</h2><p>Reassign or unassign this work before deleting the assistant.</p></div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">×</button></header>
      <div class="dialog-body"><div class="sprint-list">
        ${assignedStories.map(story => `<article class="sprint-row"><div><h3>${escapeHTML(story.key)} · ${escapeHTML(story.title)}</h3><p>Story owner</p></div><button class="secondary-button" data-action="edit-story" data-id="${story.id}">Open story</button></article>`).join("")}
        ${assignedTasks.map(({ story, ...task }) => `<article class="sprint-row"><div><h3>${escapeHTML(task.title)}</h3><p>Task in ${escapeHTML(story.key)} · ${escapeHTML(story.title)}</p></div><button class="secondary-button" data-action="edit-story" data-id="${story.id}">Open story</button></article>`).join("")}
      </div></div><footer class="dialog-actions"><button class="secondary-button" data-action="close-modal">Done</button></footer>
    </div>`;
    modal.showModal();
    toast(`Reassign or unassign ${assignedStories.length} linked stories and ${assignedTasks.length} linked tasks first.`, "error");
    return;
  }
  if (await askToConfirm(`Delete ${item.name}?`, "This assistant will be permanently removed.", "Delete assistant")) {
    workspace.assistants = workspace.assistants.filter(assistant => assistant.id !== id);
    commit("Assistant deleted.");
  }
}

async function archiveStory(id) {
  const story = workspace.stories.find(item => item.id === id);
  if (!await askToConfirm(`Archive ${story.key}?`, "It will leave its sprint and remain available in the Archived backlog filter.", "Archive story")) return;
  story.state = "archived";
  story.ready = false;
  story.sprintId = null;
  story.boardStatus = "todo";
  modal.close();
  commit(`${story.key} archived.`);
}

function restoreStory(id) {
  const story = workspace.stories.find(item => item.id === id);
  story.state = "draft";
  story.ready = false;
  story.sprintId = null;
  modal.close();
  commit(`${story.key} restored as a draft.`);
}

async function deleteStory(id) {
  const story = workspace.stories.find(item => item.id === id);
  if (!await askToConfirm(`Delete ${story.key} permanently?`, "The story and all of its checklist tasks will be removed. This cannot be undone.", "Delete story")) return;
  workspace.stories = workspace.stories.filter(item => item.id !== id);
  workspace.timeEntries = workspace.timeEntries.filter(entry => entry.storyId !== id);
  modal.close();
  commit(`${story.key} deleted.`);
}

function askToConfirm(title, copy, buttonLabel) {
  document.querySelector("#confirm-title").textContent = title;
  document.querySelector("#confirm-copy").textContent = copy;
  document.querySelector("#confirm-button").textContent = buttonLabel;
  confirmDialog.returnValue = "";
  confirmDialog.showModal();
  return new Promise(resolve => confirmDialog.addEventListener("close", () => resolve(confirmDialog.returnValue === "confirm"), { once: true }));
}

function toast(message, type = "success") {
  const item = document.createElement("div");
  item.className = `toast ${type === "error" ? "error" : ""}`;
  item.textContent = message;
  document.querySelector("#toast-region").append(item);
  setTimeout(() => item.remove(), 3600);
}

document.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id, epicId, initiativeId, direction } = button.dataset;

  if (action === "toggle-nav") {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("open");
    button.setAttribute("aria-expanded", String(sidebar.classList.contains("open")));
  } else if (action === "close-modal") modal.close();
  else if (action === "new-story") showEntityForm("story", "", { epicId });
  else if (action === "edit-story") { if (modal.open) modal.close(); showEntityForm("story", id); }
  else if (action === "story-more") showStoryActions(id);
  else if (action === "groom-story") groomStory(id);
  else if (action === "ungroom-story") ungroomStory(id);
  else if (action === "archive-story") archiveStory(id);
  else if (action === "restore-story") restoreStory(id);
  else if (action === "delete-story") deleteStory(id);
  else if (action === "move-story") moveStory(id, direction);
  else if (action === "new-initiative") openInitiativeEditor();
  else if (action === "edit-initiative") openInitiativeEditor(id);
  else if (action === "delete-initiative") deleteInitiative(id);
  else if (action === "new-epic") openEpicEditor("", initiativeId);
  else if (action === "edit-epic") openEpicEditor(id);
  else if (action === "delete-epic") deleteEpic(id);
  else if (action === "log-hours") { if (modal.open) modal.close(); showLogHours(id); }
  else if (action === "assistant-hours") openAssistantHours(id);
  else if (action === "new-assistant") showEntityForm("assistant");
  else if (action === "edit-assistant") showEntityForm("assistant", id);
  else if (action === "delete-assistant") deleteAssistant(id);
  else if (action === "manage-sprints") showSprintManager();
  else if (action === "new-sprint") { modal.close(); showEntityForm("sprint"); }
  else if (action === "edit-sprint") { modal.close(); showEntityForm("sprint", id); }
  else if (action === "start-sprint") startSprint(id);
  else if (action === "complete-sprint") completeSprint(id);
  else if (action === "delete-sprint") deleteSprint(id);
  else if (action === "modal-add-time") {
    const date = document.querySelector("#new-time-date");
    const hoursField = document.querySelector("#new-time-hours");
    const who = document.querySelector("#new-time-assistant");
    const note = document.querySelector("#new-time-note");
    const hours = Number(hoursField.value);
    if (!(hours > 0)) { hoursField.focus(); return; }
    modalTimeEntries.push({ id: uid("time"), assistantId: who.value, date: date.value, hours, note: note.value.trim() });
    hoursField.value = "";
    note.value = "";
    renderModalTimeEntries();
    hoursField.focus();
  }
  else if (action === "modal-delete-time") {
    modalTimeEntries = modalTimeEntries.filter(entry => entry.id !== id);
    renderModalTimeEntries();
  }
  else if (action === "modal-add-task") {
    const titleInput = document.querySelector("#new-task-title");
    if (!titleInput.value.trim()) return toast("Enter a task title first.", "error");
    modalTasks.push({ id: uid("task"), title: titleInput.value.trim(), done: false, assistantId: document.querySelector("#new-task-assistant").value || null });
    titleInput.value = "";
    renderModalTasks();
    titleInput.focus();
  } else if (action === "modal-delete-task") {
    const taskId = button.closest("[data-task-id]").dataset.taskId;
    modalTasks = modalTasks.filter(task => task.id !== taskId);
    renderModalTasks();
  } else if (action === "reset-demo") {
    if (await askToConfirm("Reset the demo workspace?", "All local changes will be replaced with the original sample data.", "Reset demo")) {
      workspace = seedWorkspace();
      viewState = { search: "", backlogFilter: "all" };
      commit("Demo workspace reset.");
    }
  }
});

document.addEventListener("submit", event => {
  if (event.target.id === "log-hours-form") {
    event.preventDefault();
    submitLogHours(event.target);
    return;
  }
  if (event.target.matches("#entity-form")) {
    event.preventDefault();
    submitEntityForm(event.target);
  }
});

document.addEventListener("input", event => {
  if (event.target.matches("[data-control='backlog-search']")) {
    viewState.search = event.target.value;
    render();
    const input = document.querySelector("[data-control='backlog-search']");
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  } else if (event.target.matches("[data-control='modal-task-title']")) {
    const task = modalTasks.find(item => item.id === event.target.closest("[data-task-id]").dataset.taskId);
    task.title = event.target.value;
  }
});

document.addEventListener("change", event => {
  const control = event.target.dataset.control;
  if (control === "backlog-filter") {
    viewState.backlogFilter = event.target.value;
    render();
  } else if (control === "story-sprint") setStorySprint(event.target.dataset.id, event.target.value);
  else if (control === "modal-task-done") {
    const task = modalTasks.find(item => item.id === event.target.closest("[data-task-id]").dataset.taskId);
    task.done = event.target.checked;
    renderModalTasks();
  } else if (control === "modal-task-assistant") {
    const task = modalTasks.find(item => item.id === event.target.closest("[data-task-id]").dataset.taskId);
    task.assistantId = event.target.value || null;
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.querySelector(".sidebar.open")) document.querySelector(".sidebar").classList.remove("open");
  if (event.key === "Enter" && event.target.id === "new-task-title") {
    event.preventDefault();
    document.querySelector("[data-action='modal-add-task']").click();
  }
});

document.addEventListener("dragstart", event => {
  const card = event.target.closest("[data-story-card]");
  if (!card) return;
  card.classList.add("dragging");
  event.dataTransfer.setData("text/plain", card.dataset.storyCard);
  event.dataTransfer.effectAllowed = "move";
});

document.addEventListener("dragend", event => {
  event.target.closest("[data-story-card]")?.classList.remove("dragging");
  document.querySelectorAll(".drag-over").forEach(item => item.classList.remove("drag-over"));
});

document.addEventListener("dragover", event => {
  const column = event.target.closest("[data-drop-status]");
  if (!column) return;
  event.preventDefault();
  document.querySelectorAll(".drag-over").forEach(item => item.classList.remove("drag-over"));
  column.classList.add("drag-over");
});

document.addEventListener("drop", event => {
  const column = event.target.closest("[data-drop-status]");
  if (!column) return;
  event.preventDefault();
  const story = workspace.stories.find(item => item.id === event.dataTransfer.getData("text/plain"));
  if (story && story.boardStatus !== column.dataset.dropStatus) {
    story.boardStatus = column.dataset.dropStatus;
    commit(`${story.key} moved on the board.`);
  }
});

window.addEventListener("hashchange", render);
render();
