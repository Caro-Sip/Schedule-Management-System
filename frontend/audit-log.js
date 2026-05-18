
const AUDIT_DATA = [
  {
    id: "U-1088",
    name: "Miguel Santos",
    currentTags: ["Student", "Engineering"],
    lastModified: "May 16, 2026, 8:40 AM",
    lastModifiedRaw: new Date("2026-05-16T08:40:00"),
    history: [
      {
        action: "edit",
        timestamp: "May 16, 2026, 8:40 AM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Department", from: "Mathematics", to: "Engineering" },
          { field: "Role",       from: "Student",     to: "Student" }
        ]
      },
      {
        action: "edit",
        timestamp: "May 10, 2026, 11:00 AM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Full name", from: "Miguel S.", to: "Miguel Santos" }
        ]
      },
      {
        action: "create",
        timestamp: "April 28, 2026, 9:00 AM",
        editor: "Admin (Leo Martinez)",
        changes: []
      }
    ]
  },
  {
    id: "U-1080",
    name: "Omar Khalid",
    currentTags: ["Register"],
    lastModified: "May 15, 2026, 9:40 PM",
    lastModifiedRaw: new Date("2026-05-15T21:40:00"),
    history: [
      {
        action: "edit",
        timestamp: "May 15, 2026, 9:40 PM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Role", from: "—", to: "Register" }
        ]
      },
      {
        action: "create",
        timestamp: "May 1, 2026, 2:00 PM",
        editor: "Self-registration",
        changes: []
      }
    ]
  },
  {
    id: "U-1188",
    name: "Ariana Patel",
    currentTags: ["Student", "Engineering"],
    lastModified: "May 14, 2026, 2:50 AM",
    lastModifiedRaw: new Date("2026-05-14T02:50:00"),
    history: [
      {
        action: "edit",
        timestamp: "May 14, 2026, 2:50 AM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Department", from: "Science", to: "Engineering" }
        ]
      },
      {
        action: "edit",
        timestamp: "May 5, 2026, 10:15 AM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Role", from: "Class monitor", to: "Student" }
        ]
      },
      {
        action: "create",
        timestamp: "March 12, 2026, 8:30 AM",
        editor: "Admin (Leo Martinez)",
        changes: []
      }
    ]
  },
  {
    id: "U-1288",
    name: "Hana Lee",
    currentTags: ["Student", "Science"],
    lastModified: "May 12, 2026, 4:40 PM",
    lastModifiedRaw: new Date("2026-05-12T16:40:00"),
    history: [
      {
        action: "edit",
        timestamp: "May 12, 2026, 4:40 PM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Department",  from: "Engineering", to: "Science" },
          { field: "Role",        from: "Class monitor", to: "Student" }
        ]
      },
      {
        action: "edit",
        timestamp: "April 30, 2026, 3:00 PM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Role", from: "Student", to: "Class monitor" },
          { field: "Department", from: "Science", to: "Engineering" }
        ]
      },
      {
        action: "create",
        timestamp: "March 1, 2026, 9:00 AM",
        editor: "Admin (Leo Martinez)",
        changes: []
      }
    ]
  },
  {
    id: "U-1388",
    name: "Zeo Chen",
    currentTags: ["Professor", "Mathematics"],
    lastModified: "May 11, 2026, 11:15 AM",
    lastModifiedRaw: new Date("2026-05-11T11:15:00"),
    history: [
      {
        action: "edit",
        timestamp: "May 11, 2026, 11:15 AM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Full name", from: "Zeo C.", to: "Zeo Chen" }
        ]
      },
      {
        action: "edit",
        timestamp: "April 20, 2026, 9:45 AM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "Role", from: "Student", to: "Professor" }
        ]
      },
      {
        action: "create",
        timestamp: "January 15, 2026, 8:00 AM",
        editor: "Admin (Leo Martinez)",
        changes: []
      }
    ]
  },
  {
    id: "U-1488",
    name: "Leo Martinez",
    currentTags: ["Admin"],
    lastModified: "May 10, 2026, 5:40 PM",
    lastModifiedRaw: new Date("2026-05-10T17:40:00"),
    history: [
      {
        action: "edit",
        timestamp: "May 10, 2026, 5:40 PM",
        editor: "System",
        changes: [
          { field: "Role", from: "Professor", to: "Admin" }
        ]
      },
      {
        action: "create",
        timestamp: "January 1, 2026, 7:00 AM",
        editor: "System",
        changes: []
      }
    ]
  },
  {
    id: "U-1588",
    name: "Sofia Ibrahim",
    currentTags: ["Student", "Engineering"],
    lastModified: "May 9, 2026, 1:20 PM",
    lastModifiedRaw: new Date("2026-05-09T13:20:00"),
    history: [
      {
        action: "edit",
        timestamp: "May 9, 2026, 1:20 PM",
        editor: "Admin (Leo Martinez)",
        changes: [
          { field: "User ID",    from: "U-1590", to: "U-1588" },
          { field: "Department", from: "Science", to: "Engineering" }
        ]
      },
      {
        action: "create",
        timestamp: "February 20, 2026, 10:00 AM",
        editor: "Admin (Leo Martinez)",
        changes: []
      }
    ]
  }
];

/* ── Tag → CSS class mapping ── */
const TAG_CLASS = {
  student:       "tag-student",
  professor:     "tag-professor",
  admin:         "tag-admin",
  register:      "tag-register",
  "class monitor": "tag-monitor"
};

function tagClass(label) {
  const key = label.toLowerCase();
  return TAG_CLASS[key] || "tag-dept";
}

/* ── Build a single timeline entry ── */
function buildTimelineEntry(entry, isLast) {
  const actionLabel = entry.action.charAt(0).toUpperCase() + entry.action.slice(1);
  const actionCls   = `action-${entry.action}`;
  const dotCls      = entry.action === "create" ? "dot-create"
                    : entry.action === "delete" ? "dot-delete"
                    : "";

  // changes table
  let changesHTML = "";
  if (entry.action === "create") {
    changesHTML = `<p class="no-changes">User account created.</p>`;
  } else if (entry.action === "delete") {
    changesHTML = `<p class="no-changes">User account deleted.</p>`;
  } else if (entry.changes.length === 0) {
    changesHTML = `<p class="no-changes">No field changes recorded.</p>`;
  } else {
    const rows = entry.changes.map(c => `
      <tr>
        <td class="field-name">${c.field}</td>
        <td><span class="val-old">${c.from}</span></td>
        <td><span class="val-new">${c.to}</span></td>
      </tr>
    `).join("");

    changesHTML = `
      <table class="change-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Previous value</th>
            <th>New value</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  return `
    <div class="timeline-entry">
      <div class="tl-indicator">
        <div class="tl-dot ${dotCls}"></div>
        ${isLast ? "" : '<div class="tl-line"></div>'}
      </div>
      <div class="tl-content">
        <div class="tl-meta">
          <span class="tl-action ${actionCls}">${actionLabel}</span>
          <span class="tl-timestamp">${entry.timestamp}</span>
          <span class="tl-editor">by <strong>${entry.editor}</strong></span>
        </div>
        ${changesHTML}
      </div>
    </div>
  `;
}

/* ── Build one log card ── */
function buildCard(user) {
  const tagsHTML = user.currentTags
    .map(t => `<span class="tag ${tagClass(t)}">${t}</span>`)
    .join("");

  const timelineHTML = user.history
    .map((entry, i) => buildTimelineEntry(entry, i === user.history.length - 1))
    .join("");

  return `
    <div class="log-card" data-id="${user.id}" data-name="${user.name.toLowerCase()}">
      <div class="log-card-header" role="button" aria-expanded="false">
        <div class="log-user-info">
          <span class="log-user-name">${user.name}</span>
          <span class="log-user-id">ID: ${user.id}</span>
        </div>
        <div class="tag-group">${tagsHTML}</div>
        <div class="log-last-modified">
          <div class="lm-label">Last Modified</div>
          <div class="lm-date">${user.lastModified}</div>
        </div>
        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="log-history">
        <div class="history-inner">
          <div class="history-title">Edit history</div>
          <div class="timeline">${timelineHTML}</div>
        </div>
      </div>
    </div>
  `;
}

/* ── Render ── */
function render(data, query = "") {
  const list      = document.getElementById("logList");
  const empty     = document.getElementById("emptyState");
  const countBadge = document.getElementById("entryCount");

  if (!list || !empty || !countBadge) {
    return;
  }

  list.innerHTML = "";

  if (data.length === 0) {
    const hasQuery = query.trim().length > 0;
    const title = hasQuery
      ? "No matching audit log entries"
      : "No audit log entries available";
    const message = hasQuery
      ? "Try a different name or ID, or clear the search to show all records."
      : "There are currently no audit log entries to display.";

    empty.querySelector(".empty-title").textContent = title;
    empty.querySelector(".empty-copy").textContent = message;
    empty.style.display = "block";
    countBadge.textContent = "0 entries";
    return;
  }

  empty.style.display = "none";
  countBadge.textContent = `${data.length} ${data.length === 1 ? "entry" : "entries"}`;

  data.forEach(user => {
    list.insertAdjacentHTML("beforeend", buildCard(user));
  });

  // Attach toggle listeners
  list.querySelectorAll(".log-card-header").forEach(header => {
    header.addEventListener("click", () => {
      const card = header.closest(".log-card");
      const isOpen = card.classList.toggle("open");
      header.setAttribute("aria-expanded", isOpen);
    });
  });
}

/* ── Search / filter ── */
function filterData(query) {
  const q = query.trim().toLowerCase();
  if (!q) return AUDIT_DATA;
  return AUDIT_DATA.filter(user =>
    user.name.toLowerCase().includes(q) ||
    user.id.toLowerCase().includes(q)
  );
}

/* ── Init ── */
(function init() {
  // Sort by lastModified descending (already sorted in sample data, but be safe)
  AUDIT_DATA.sort((a, b) => b.lastModifiedRaw - a.lastModifiedRaw);

  render(AUDIT_DATA, "");

  const input     = document.getElementById("searchInput");
  const clearBtn  = document.getElementById("clearSearch");

  input.addEventListener("input", () => {
    const q = input.value;
    clearBtn.style.display = q.length > 0 ? "block" : "none";
    render(filterData(q), q);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.style.display = "none";
    input.focus();
    render(AUDIT_DATA, "");
  });
})();