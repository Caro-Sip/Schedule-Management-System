function openUserFilterPanel() {
  if (!userFilterPanel || !userFilterToggle) {
    return;
  }
  userFilterPanel.removeAttribute("hidden");
  userFilterToggle.setAttribute("aria-expanded", "true");
}

function closeUserFilterPanel() {
  if (!userFilterPanel || !userFilterToggle) {
    return;
  }
  userFilterPanel.setAttribute("hidden", "");
  userFilterToggle.setAttribute("aria-expanded", "false");
}

function toggleUserFilterPanel() {
  if (!userFilterPanel) {
    return;
  }
  if (userFilterPanel.hasAttribute("hidden")) {
    openUserFilterPanel();
  } else {
    closeUserFilterPanel();
  }
}

function openUserModal(mode, user) {
  if (!userModal || !userForm) {
    return;
  }

  editingUserId = mode === "edit" && user ? user.id : null;

  if (userModalTitle) {
    userModalTitle.textContent = mode === "edit" ? "Edit user" : "Add user";
  }

  if (userNameInput) {
    userNameInput.value = user?.name || "";
  }
  if (userIdInput) {
    userIdInput.value = user?.id || "";
  }
  if (userPasswordInput) {
    userPasswordInput.value = "";
    if (mode === "edit") {
      userPasswordInput.required = false;
      userPasswordInput.placeholder = "Leave blank to keep current";
    } else {
      userPasswordInput.required = true;
      userPasswordInput.placeholder = "Set a password";
    }
  }
  if (userRoleInput) {
    userRoleInput.value = user?.role || "admin";
  }
  if (userDepartmentInput) {
    userDepartmentInput.value = user?.department || "Registrar";
  }

  if (userDeleteBtn) {
    userDeleteBtn.toggleAttribute("hidden", mode !== "edit");
  }

  userModal.removeAttribute("hidden");
  if (userNameInput) {
    userNameInput.focus();
  }
}

function closeUserModal() {
  if (!userModal) {
    return;
  }
  userModal.setAttribute("hidden", "");
  editingUserId = null;
}

function openClassModal(mode, classItem) {
  if (!classModal || !classForm) {
    return;
  }

  editingClassId = mode === "edit" && classItem ? classItem.id : null;

  if (classModalTitle) {
    classModalTitle.textContent = mode === "edit" ? "Edit class" : "Add class";
  }

  if (classNameInput) {
    classNameInput.value = classItem?.name || "";
  }
  if (classIdInput) {
    classIdInput.value = classItem?.id ?? "";
  }
  if (classYearInput) {
    classYearInput.value = classItem?.year ?? "";
  }
  if (typeof classSemesterInput !== "undefined" && classSemesterInput) {
    classSemesterInput.value = classItem?.semester ?? "1";
  }
  if (typeof classStartDateInput !== "undefined" && classStartDateInput) {
    classStartDateInput.value = classItem?.startDate ?? "";
  }
  if (typeof classEndDateInput !== "undefined" && classEndDateInput) {
    classEndDateInput.value = classItem?.endDate ?? "";
  }

  if (classDeleteBtn) {
    classDeleteBtn.toggleAttribute("hidden", mode !== "edit");
  }

  classModal.removeAttribute("hidden");
  if (classNameInput) {
    classNameInput.focus();
  }
}

function closeClassModal() {
  if (!classModal) {
    return;
  }
  classModal.setAttribute("hidden", "");
  editingClassId = null;
}

function openRoomModal(mode, roomItem) {
  if (!roomModal || !roomForm) {
    return;
  }

  editingRoomId = mode === "edit" && roomItem ? roomItem.id : null;

  if (roomModalTitle) {
    roomModalTitle.textContent = mode === "edit" ? "Edit room" : "Add room";
  }

  if (roomNameInput) {
    roomNameInput.value = roomItem?.name || "";
  }
  if (roomIdInput) {
    roomIdInput.value = roomItem?.id || "";
  }
  if (roomBuildingInput) {
    roomBuildingInput.value = roomItem?.building || "";
  }
  if (roomFloorInput) {
    roomFloorInput.value = roomItem?.floor || "";
  }

  if (roomDeleteBtn) {
    roomDeleteBtn.toggleAttribute("hidden", mode !== "edit");
  }

  roomModal.removeAttribute("hidden");
  if (roomNameInput) {
    roomNameInput.focus();
  }
}

function closeRoomModal() {
  if (!roomModal) {
    return;
  }
  roomModal.setAttribute("hidden", "");
  editingRoomId = null;
}

function selectClass(classId) {
  const numericId = Number(classId);
  if (Number.isNaN(numericId)) {
    return;
  }
  state.selectedClassId = numericId;
  updateViewVisibility();
  renderClassList();
  renderEvents();
}

function selectRoom(roomId) {
  const numericRoomId = Number(roomId);
  state.selectedRoomId = Number.isNaN(numericRoomId) ? roomId : numericRoomId;
  updateViewVisibility();
  renderRoomList();
  renderEvents();
}

function getFilteredUsers() {
  const term = userSearch ? userSearch.value.trim().toLowerCase() : "";
  const roleFilter = userFilterRole ? userFilterRole.value : "";
  const departmentFilter = userFilterDepartment ? userFilterDepartment.value : "";

  return userDirectory
    .filter((user) => {
      const matchesTerm =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term);
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesDepartment =
        !departmentFilter || user.department === departmentFilter;
      return matchesTerm && matchesRole && matchesDepartment;
    })
    .slice()
    .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
}

function renderUserList() {
  if (!userList || !userCount) {
    return;
  }

  const users = getFilteredUsers();
  userCount.textContent = `${users.length} user${users.length === 1 ? "" : "s"}`;
  userList.innerHTML = "";

  if (users.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No users match the current filters.";
    userList.appendChild(empty);
    return;
  }

  users.forEach((user) => {
    const row = document.createElement("div");
    row.className = "user-row";

    const main = document.createElement("div");
    main.className = "user-main";

    const name = document.createElement("div");
    name.className = "user-name";
    name.textContent = user.name;

    const id = document.createElement("div");
    id.className = "user-id";
    id.textContent = `ID: ${user.id}`;

    main.appendChild(name);
    main.appendChild(id);

    const tags = document.createElement("div");
    tags.className = "user-tags";

    const roleTag = document.createElement("span");
    roleTag.className = `tag role ${user.role}`;
    roleTag.textContent = getRoleLabel(user.role);

    const departmentTag = document.createElement("span");
    departmentTag.className = "tag department";
    departmentTag.textContent = user.department;

    tags.appendChild(roleTag);
    tags.appendChild(departmentTag);

    const modified = document.createElement("div");
    modified.className = "user-modified";

    const label = document.createElement("span");
    label.className = "user-label";
    label.textContent = "Last modified";

    const value = document.createElement("span");
    value.className = "user-date";
    value.textContent = formatTimestamp(user.lastModified);

    modified.appendChild(label);
    modified.appendChild(value);

    const actions = document.createElement("div");
    actions.className = "user-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-btn user-edit";
    editButton.setAttribute("aria-label", "Edit user");
    editButton.dataset.userId = user.id;
    editButton.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92-9.06 9.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />' +
      "</svg>";

    actions.appendChild(editButton);

    row.appendChild(main);
    row.appendChild(tags);
    row.appendChild(modified);
    row.appendChild(actions);

    userList.appendChild(row);
  });
}

function getSortedClasses() {
  return classDirectory
    .slice()
    .sort(
      (a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0)
    );
}

function renderClassList() {
  if (!classList || !classCount) {
    return;
  }

  const classes = getSortedClasses();
  classCount.textContent = `${classes.length} class${classes.length === 1 ? "" : "es"}`;
  classList.innerHTML = "";

  if (classes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No classes yet.";
    classList.appendChild(empty);
    return;
  }

  classes.forEach((classItem) => {
    const row = document.createElement("div");
    row.className = "class-row";
    row.dataset.classId = classItem.id;
    if (state.selectedClassId === classItem.id) {
      row.classList.add("selected");
    }

    const main = document.createElement("div");
    main.className = "user-main";

    const name = document.createElement("div");
    name.className = "user-name";
    name.textContent = classItem.name;

    const id = document.createElement("div");
    id.className = "user-id";
    id.textContent = `ID: ${classItem.id}`;

    main.appendChild(name);
    main.appendChild(id);

    const tags = document.createElement("div");
    tags.className = "user-tags";

    const yearTag = document.createElement("span");
    yearTag.className = "tag department";
    yearTag.textContent = Number.isFinite(classItem.year)
      ? `Year ${classItem.year}`
      : "Year —";
    tags.appendChild(yearTag);

    const semesterTag = document.createElement("span");
    semesterTag.className = "tag semester";
    semesterTag.textContent = Number.isFinite(classItem.semester)
      ? `Sem ${classItem.semester}`
      : "Sem —";
    tags.appendChild(semesterTag);

    const dateRangeTag = document.createElement("span");
    dateRangeTag.className = "tag date-range";
    const start = classItem.startDate || classItem.start_date || null;
    const end = classItem.endDate || classItem.end_date || null;
    dateRangeTag.textContent = start && end ? `${formatDate(start)} — ${formatDate(end)}` : "";
    tags.appendChild(dateRangeTag);

    const modified = document.createElement("div");
    modified.className = "user-modified";

    const label = document.createElement("span");
    label.className = "user-label";
    label.textContent = "Last modified";

    const value = document.createElement("span");
    value.className = "user-date";
    value.textContent = formatTimestamp(classItem.lastModified);

    modified.appendChild(label);
    modified.appendChild(value);

    const actions = document.createElement("div");
    actions.className = "entity-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-btn class-edit";
    editButton.setAttribute("aria-label", "Edit class");
    editButton.dataset.classId = classItem.id;
    editButton.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92-9.06 9.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />' +
      "</svg>";

    actions.appendChild(editButton);

    row.appendChild(main);
    row.appendChild(tags);
    row.appendChild(modified);
    row.appendChild(actions);

    classList.appendChild(row);
  });
}

function getSortedRooms() {
  return getBookingClassrooms()
    .slice()
    .sort((a, b) => {
      const nameCompare = (a.name || String(a.id || "")).localeCompare(
        b.name || String(b.id || "")
      );
      if (nameCompare !== 0) {
        return nameCompare;
      }
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
}

function renderRoomList() {
  if (!roomList || !roomCount) {
    return;
  }

  const rooms = getSortedRooms();
  roomCount.textContent = `${rooms.length} room${rooms.length === 1 ? "" : "s"}`;
  roomList.innerHTML = "";

  if (rooms.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No rooms yet.";
    roomList.appendChild(empty);
    return;
  }

  rooms.forEach((roomItem) => {
    const row = document.createElement("div");
    row.className = "room-row";
    row.dataset.roomId = roomItem.id;
    if (String(state.selectedRoomId) === String(roomItem.id)) {
      row.classList.add("selected");
    }

    const main = document.createElement("div");
    main.className = "user-main";

    const name = document.createElement("div");
    name.className = "user-name";
    name.textContent = roomItem.name;

    const id = document.createElement("div");
    id.className = "user-id";
    id.textContent = `ID: ${roomItem.id}`;

    main.appendChild(name);
    main.appendChild(id);

    const tags = document.createElement("div");
    tags.className = "user-tags";

    const buildingTag = document.createElement("span");
    buildingTag.className = "tag building";
    buildingTag.textContent = roomItem.building;

    const floorTag = document.createElement("span");
    floorTag.className = "tag floor";
    floorTag.textContent = getRoomFloorLabel(roomItem);

    tags.appendChild(buildingTag);
    tags.appendChild(floorTag);

    const modified = document.createElement("div");
    modified.className = "user-modified";

    const label = document.createElement("span");
    label.className = "user-label";
    label.textContent = "Last modified";

    const value = document.createElement("span");
    value.className = "user-date";
    value.textContent = formatTimestamp(roomItem.lastModified);

    modified.appendChild(label);
    modified.appendChild(value);

    const actions = document.createElement("div");
    actions.className = "entity-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-btn room-edit";
    editButton.setAttribute("aria-label", "Edit room");
    editButton.dataset.roomId = roomItem.id;
    editButton.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92-9.06 9.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />' +
      "</svg>";

    actions.appendChild(editButton);

    row.appendChild(main);
    row.appendChild(tags);
    row.appendChild(modified);
    row.appendChild(actions);

    roomList.appendChild(row);
  });
}

function isDuplicateClassId(nextId) {
  const numericId = Number(nextId);
  if (!Number.isFinite(numericId)) {
    return false;
  }
  return classDirectory.some(
    (item) => item.id === numericId && item.id !== Number(editingClassId)
  );
}

function isDuplicateRoomId(nextId) {
  const normalized = nextId.toLowerCase();
  return roomDirectory.some(
    (item) => item.id.toLowerCase() === normalized && item.id !== editingRoomId
  );
}

function isDuplicateUserId(nextId) {
  const normalized = nextId.toLowerCase();
  return userDirectory.some(
    (user) => user.id.toLowerCase() === normalized && user.id !== editingUserId
  );
}

function upsertClass({ id, name, year, createdBy }) {
  const timestamp = new Date().toISOString();
  const actor = state.userName || "User";
  if (editingClassId) {
    const target = classDirectory.find((item) => item.id === editingClassId);
    if (!target) {
      return;
    }
    target.id = Number(id);
    target.name = name;
    target.year = Number(year);
    if (createdBy) {
      target.createdBy = Number(createdBy);
    }
    target.lastModified = timestamp;
    addAuditEntry("Edited class", actor, name, "", {
      scopeType: "class",
      scopeId: Number(id),
    });
  } else {
    classDirectory.push({
      id: Number(id),
      name,
      year: Number(year),
      createdBy: Number(createdBy),
      lastModified: timestamp,
    });
    addAuditEntry("Added class", actor, name, "", {
      scopeType: "class",
      scopeId: Number(id),
    });
  }
}

function upsertRoom({ id, name, building, floor }) {
  const timestamp = new Date().toISOString();
  const actor = state.userName || "User";
  if (editingRoomId) {
    const target = roomDirectory.find((item) => item.id === editingRoomId);
    if (!target) {
      return;
    }
    target.id = id;
    target.name = name;
    target.building = building;
    target.floor = floor;
    target.lastModified = timestamp;
    addAuditEntry("Edited room", actor, name, "", {
      scopeType: "room",
      scopeId: id,
    });
  } else {
    roomDirectory.push({
      id,
      name,
      building,
      floor,
      lastModified: timestamp,
    });
    addAuditEntry("Added room", actor, name, "", {
      scopeType: "room",
      scopeId: id,
    });
  }
}

function upsertUser({ id, name, role, department, password }) {
  const timestamp = new Date().toISOString();
  if (editingUserId) {
    const target = userDirectory.find((user) => user.id === editingUserId);
    if (!target) {
      return;
    }
    target.id = id;
    target.name = name;
    target.role = role;
    target.department = department;
    if (password) {
      target.password = password;
    }
    target.lastModified = timestamp;
  } else {
    userDirectory.push({
      id,
      name,
      role,
      department,
      password: password || "",
      lastModified: timestamp,
    });
  }
}
