function formatAuditTime(date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAuditPerformedTime(date) {
  const day = date.toLocaleString("en-GB", { day: "2-digit" });
  const month = date.toLocaleString("en-GB", { month: "short" });
  const time = date
    .toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
    .replace(":", ".");
  return `${day}/${month} at ${time}`;
}

function addAuditEntry(action, subject, object, bookingTime) {
  const entry = {
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    action,
    subject,
    object,
    bookingTime,
    timestamp: new Date(),
  };
  auditLog.unshift(entry);
  renderAuditLog();
}

function renderAuditLog() {
  if (!auditList || !auditCount) {
    return;
  }

  auditCount.textContent = `${auditLog.length}`;
  auditList.innerHTML = "";

  if (auditLog.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No activity yet.";
    auditList.appendChild(empty);
    return;
  }

  auditLog.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "audit-item";

    const subject = document.createElement("div");
    subject.className = "audit-subject";
    subject.textContent = entry.subject || "Untitled";

    const action = document.createElement("div");
    action.className = "audit-action";
    action.textContent = entry.action;

    const object = document.createElement("div");
    object.className = "audit-object";
    object.textContent = entry.object || "";

    const time = document.createElement("div");
    time.className = "audit-time";
    time.textContent = entry.bookingTime || "";

    const subtitle = document.createElement("div");
    subtitle.className = "audit-subtitle";

    const performed = document.createElement("div");
    performed.className = "audit-subtime";
    performed.textContent = formatAuditPerformedTime(entry.timestamp);

    subtitle.appendChild(performed);

    item.appendChild(subject);
    item.appendChild(action);
    item.appendChild(object);
    item.appendChild(time);
    item.appendChild(subtitle);
    auditList.appendChild(item);
  });
}

function openAuditPanel() {
  if (!auditPanel || !auditToggle) {
    return;
  }
  auditPanel.classList.add("open");
  auditPanel.setAttribute("aria-hidden", "false");
  auditToggle.setAttribute("aria-expanded", "true");
}

function closeAuditPanel() {
  if (!auditPanel || !auditToggle) {
    return;
  }
  auditPanel.classList.remove("open");
  auditPanel.setAttribute("aria-hidden", "true");
  auditToggle.setAttribute("aria-expanded", "false");
}

function toggleAuditPanel() {
  if (!auditPanel) {
    return;
  }
  if (auditPanel.classList.contains("open")) {
    closeAuditPanel();
  } else {
    openAuditPanel();
  }
}
