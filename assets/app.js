const courseDays = [
  {
    id: "day-01",
    number: "01",
    title: "Semantic HTML",
    description: "Structure, forms, and accessibility",
    href: "day-01.html",
  },
  {
    id: "day-02",
    number: "02",
    title: "CSS Foundations",
    description: "Cascade, box model, and flow",
    href: "day-02.html",
  },
  {
    id: "day-03",
    number: "03",
    title: "Flexbox Layout",
    description: "Axes, alignment, sizing, and wrapping",
    href: "day-03.html",
  },
  {
    id: "day-04",
    number: "04",
    title: "CSS Grid",
    description: "Tracks, placement, and dashboards",
    href: "day-04.html",
  },
  {
    id: "day-05",
    number: "05",
    title: "Responsive Design",
    description: "Media and container queries",
    href: "day-05.html",
  },
];

const storageKey = "frontend-study-progress-v1";

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
}

function saveProgress(progress) {
  localStorage.setItem(storageKey, JSON.stringify([...progress]));
}

function assetPrefix() {
  return document.body.dataset.pathPrefix || "";
}

function renderSidebar() {
  const sidebar = document.querySelector("#study-sidebar");
  if (!sidebar) return;

  const currentDay = document.body.dataset.day;
  const progress = readProgress();
  const prefix = assetPrefix();
  const completed = courseDays.filter((day) => progress.has(day.id)).length;

  const dayLinks = courseDays
    .map((day) => {
      const isCurrent = currentDay === day.id;
      const isComplete = progress.has(day.id);
      return `
        <li>
          <a class="day-link${isCurrent ? " is-current" : ""}"
             href="${prefix}${day.href}"
             ${isCurrent ? 'aria-current="page"' : ""}>
            <span class="day-link-number">${isComplete ? "✓" : day.number}</span>
            <span>
              <strong>${day.title}</strong>
              <small>${day.description}</small>
            </span>
          </a>
        </li>`;
    })
    .join("");

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <a class="brand-mark" href="${prefix}index.html" aria-label="Frontend Rewind home">
        <span aria-hidden="true">FR</span>
        <span><strong>Frontend Rewind</strong><small>Sanket's study hub</small></span>
      </a>
      <button class="sidebar-close icon-button" type="button" data-sidebar-close aria-label="Close navigation">×</button>
    </div>
    <div class="sidebar-progress">
      <div><span>Progress</span><strong>${completed}/${courseDays.length}</strong></div>
      <div class="mini-progress" aria-hidden="true"><span style="width:${(completed / courseDays.length) * 100}%"></span></div>
    </div>
    <nav aria-label="Study days">
      <p class="nav-label">Lessons</p>
      <ol class="day-list">${dayLinks}</ol>
    </nav>
    <div class="sidebar-note">
      <strong>One-hour rule</strong>
      <span>Read, inspect, review, and stop.</span>
    </div>`;
}

function updateProgressUI() {
  const progress = readProgress();
  const completed = courseDays.filter((day) => progress.has(day.id)).length;
  const percentage = (completed / courseDays.length) * 100;

  document.querySelectorAll("[data-completed-count]").forEach((element) => {
    element.textContent = String(completed);
  });

  document.querySelectorAll("[data-progress-fill]").forEach((element) => {
    element.style.width = `${percentage}%`;
  });

  document.querySelectorAll("[data-progress-track]").forEach((element) => {
    element.setAttribute("aria-valuenow", String(completed));
  });

  document.querySelectorAll("[data-day-card]").forEach((card) => {
    const complete = progress.has(card.dataset.dayCard);
    card.classList.toggle("is-complete", complete);
    const status = card.querySelector("[data-day-status]");
    if (status) status.textContent = complete ? "Completed" : "Ready";
  });

  const completionButton = document.querySelector("[data-complete-day]");
  const currentDay = document.body.dataset.day;
  if (completionButton && currentDay) {
    const complete = progress.has(currentDay);
    completionButton.classList.toggle("is-complete", complete);
    completionButton.setAttribute("aria-pressed", String(complete));
    completionButton.innerHTML = complete
      ? '<span aria-hidden="true">✓</span> Day completed'
      : '<span aria-hidden="true">○</span> Mark day complete';
  }
}

function setupCompletion() {
  const button = document.querySelector("[data-complete-day]");
  const currentDay = document.body.dataset.day;
  if (!button || !currentDay) return;

  button.addEventListener("click", () => {
    const progress = readProgress();
    if (progress.has(currentDay)) progress.delete(currentDay);
    else progress.add(currentDay);
    saveProgress(progress);
    renderSidebar();
    updateProgressUI();
  });
}

function setSidebarOpen(open) {
  document.body.classList.toggle("sidebar-open", open);
  const toggle = document.querySelector("[data-sidebar-toggle]");
  if (toggle) toggle.setAttribute("aria-expanded", String(open));
}

function setupSidebar() {
  document.querySelector("[data-sidebar-toggle]")?.addEventListener("click", () => setSidebarOpen(true));
  document.querySelectorAll("[data-sidebar-close]").forEach((button) => {
    button.addEventListener("click", () => setSidebarOpen(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setSidebarOpen(false);
  });
}

function setupCopyButtons() {
  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.querySelector(`#${button.dataset.copyTarget}`);
      if (!target) return;
      await navigator.clipboard.writeText(target.textContent || "");
      const original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => (button.textContent = original), 1400);
    });
  });
}

renderSidebar();
setupSidebar();
setupCompletion();
setupCopyButtons();
updateProgressUI();

