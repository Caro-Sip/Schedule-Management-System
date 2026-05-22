const logList = document.getElementById("logList");
const emptyState = document.getElementById("emptyState");
const entryCount = document.getElementById("entryCount");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");

let currentQuery = "";

function formatAdminTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getScopeLabel(entry) {
  if (entry.scopeType === "class" && entry.scopeId) {
    return `Class ${entry.scopeId}`;
  }
  if (entry.scopeType === "room" && entry.scopeId) {
    return `Room ${entry.scopeId}`;
  }
  if (entry.scopeType === "teacher") {
    return "Teacher schedule";
  }
  if (entry.scopeType && entry.scopeType !== "general") {
    return entry.scopeType;
  }
  return "General";
}

function getAuditSource() {
  if (typeof auditLog === "undefined" || !Array.isArray(auditLog)) {
    return [];
  }
  return auditLog;
}

function filterAdminEntries(query) {
  const q = query.trim().toLowerCase();
  const source = getAuditSource();
  if (!q) {
    return source;
  }
  return source.filter((entry) => {
    const scopeLabel = getScopeLabel(entry);
    const haystack = [
      entry.subject,
      entry.action,
      entry.object,
      entry.bookingTime,
      entry.scopeType,
      entry.scopeId,
      scopeLabel,
    ]
      .filter(Boolean)
      .map((value) => value.toString().toLowerCase())
      .join(" ");
    return haystack.includes(q);
  });
}

function buildAdminItem(entry) {
  const item = document.createElement("div");
  item.className = "audit-item";

  const subject = document.createElement("div");
  subject.className = "audit-subject";
  subject.textContent = entry.subject || "System";

  const action = document.createElement("div");
  action.className = "audit-action";
  action.textContent = entry.action || "Updated";

  const object = document.createElement("div");
  object.className = "audit-object";
  object.textContent = entry.object || "";

  const time = document.createElement("div");
  time.className = "audit-time";
  time.textContent = entry.bookingTime || "";

  const subtitle = document.createElement("div");
  subtitle.className = "audit-subtitle";

  const scopeLine = document.createElement("div");
  scopeLine.className = "audit-subtime";
  scopeLine.textContent = `Scope: ${getScopeLabel(entry)}`;

  const performed = document.createElement("div");
  performed.className = "audit-subtime";
  performed.textContent = formatAdminTimestamp(entry.timestamp);

  subtitle.appendChild(scopeLine);
  subtitle.appendChild(performed);

  item.appendChild(subject);
  item.appendChild(action);
  item.appendChild(object);
  item.appendChild(time);
  item.appendChild(subtitle);

  return item;
}

function renderAdminAuditLog(query = currentQuery) {
  if (!logList || !emptyState || !entryCount) {
    return;
  }

  currentQuery = query;
  const data = filterAdminEntries(query);
  entryCount.textContent = `${data.length} ${data.length === 1 ? "entry" : "entries"}`;
  logList.innerHTML = "";

  if (data.length === 0) {
    const hasQuery = query.trim().length > 0;
    const title = hasQuery
      ? "No matching audit entries"
      : "No audit entries yet";
    const message = hasQuery
      ? "Try a different keyword or clear the search."
      : "Entries will appear here as users make changes.";

    const titleEl = emptyState.querySelector(".empty-title");
    const copyEl = emptyState.querySelector(".empty-copy");
    if (titleEl) {
      titleEl.textContent = title;
    }
    if (copyEl) {
      copyEl.textContent = message;
    }
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  data.forEach((entry) => {
    logList.appendChild(buildAdminItem(entry));
  });
}

function updateSearchState() {
  if (!searchInput || !clearSearch) {
    return;
  }
  const query = searchInput.value || "";
  clearSearch.style.display = query.trim().length > 0 ? "block" : "none";
  renderAdminAuditLog(query);
}

if (searchInput) {
  searchInput.addEventListener("input", updateSearchState);
}

if (clearSearch && searchInput) {
  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    updateSearchState();
    searchInput.focus();
  });
}

renderAdminAuditLog("");
window.renderAdminAuditLog = renderAdminAuditLog;
