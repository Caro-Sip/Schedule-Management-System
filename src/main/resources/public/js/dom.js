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
  if (userEmailInput) {
    userEmailInput.value = user?.email || "";
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
    userRoleInput.value = resolveSelectValue(
      userRoleInput,
      user?.role,
      "admin"
    );
  }

  const departmentField = document.getElementById("department-field");
  const isProfessor = userRoleInput && userRoleInput.value === "professor";
  if (departmentField) {
    departmentField.toggleAttribute("hidden", !isProfessor);
  }
  if (userDepartmentInput) {
    if (isProfessor) {
      userDepartmentInput.setAttribute("required", "");
      userDepartmentInput.value = resolveSelectValue(
        userDepartmentInput,
        user?.department,
        teacherDepartmentDirectory && teacherDepartmentDirectory.length > 0
          ? teacherDepartmentDirectory[0]
          : "Registrar"
      );
    } else {
      userDepartmentInput.removeAttribute("required");
      userDepartmentInput.value = "";
    }
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

function getClassCourses(classId) {
  const targetClassId = Number(classId);
  if (!Number.isFinite(targetClassId)) {
    return [];
  }

  const seenCourseIds = new Set();
  const courseIds = [];

  (eventsByView.class || []).forEach((eventItem) => {
    const eventClassIds = Array.isArray(eventItem.classIds) && eventItem.classIds.length > 0
      ? eventItem.classIds.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : Number.isFinite(Number(eventItem.classId))
        ? [Number(eventItem.classId)]
        : [];

    if (!eventClassIds.includes(targetClassId)) {
      return;
    }

    const courseId = Number(eventItem.courseId);
    if (!Number.isFinite(courseId) || seenCourseIds.has(courseId)) {
      return;
    }

    seenCourseIds.add(courseId);
    courseIds.push(courseId);
  });

  return courseIds
    .map((courseId) => (courseDirectory || []).find((course) => Number(course.id) === courseId))
    .filter(Boolean)
    .sort((a, b) => {
      const nameCompare = (a.name || a.code || String(a.id)).localeCompare(
        b.name || b.code || String(b.id)
      );
      if (nameCompare !== 0) {
        return nameCompare;
      }
      return String(a.id).localeCompare(String(b.id));
    });
}

function clearCourseForm() {
  editingCourseId = null;
  if (courseNameInput) {
    courseNameInput.value = "";
  }
  if (courseCodeInput) {
    courseCodeInput.value = "";
  }
  if (courseHoursInput) {
    courseHoursInput.value = "45";
  }
  if (courseDeleteBtn) {
    courseDeleteBtn.toggleAttribute("hidden", true);
  }
}

function selectCourseForEdit(course) {
  if (!course) {
    return;
  }

  editingCourseId = course.id;
  if (courseNameInput) {
    courseNameInput.value = course.name || "";
  }
  if (courseCodeInput) {
    courseCodeInput.value = course.code || "";
  }
  if (courseHoursInput) {
    courseHoursInput.value = course.totalHours || 45;
  }
  if (courseDeleteBtn) {
    courseDeleteBtn.toggleAttribute("hidden", false);
  }

  renderCourseModalList();
  if (courseNameInput) {
    courseNameInput.focus();
  }
}

function renderCourseModalList() {
  if (!courseList) {
    return;
  }

  courseList.innerHTML = "";

  const classItem = (classDirectory || []).find(
    (item) => String(item.id) === String(courseModalClassId)
  );

  if (courseModalClassLabel) {
    courseModalClassLabel.textContent = classItem
      ? `${classItem.name || `Class ${classItem.id}`} · ID ${classItem.id}`
      : "";
  }

  const linkedCourseIds = new Set(
    getClassCourses(courseModalClassId).map((course) => Number(course.id))
  );
  const courses = (courseDirectory || [])
    .slice()
    .sort((a, b) => {
      const aLinked = linkedCourseIds.has(Number(a.id));
      const bLinked = linkedCourseIds.has(Number(b.id));
      if (aLinked !== bLinked) {
        return aLinked ? -1 : 1;
      }
      const nameCompare = (a.name || a.code || String(a.id)).localeCompare(
        b.name || b.code || String(b.id)
      );
      if (nameCompare !== 0) {
        return nameCompare;
      }
      return String(a.id).localeCompare(String(b.id));
    });

  if (courses.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No courses are available yet.";
    courseList.appendChild(empty);
    return;
  }

  courses.forEach((course) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "course-modal-item";
    item.dataset.courseId = String(course.id);
    if (String(editingCourseId) === String(course.id)) {
      item.classList.add("selected");
    }

    const title = document.createElement("strong");
    title.textContent = getCourseDisplayLabel(course);

    const meta = document.createElement("span");
    meta.textContent = linkedCourseIds.has(Number(course.id))
      ? `ID ${course.id} · ${course.totalHours || 0} hours · In this class`
      : `ID ${course.id} · ${course.totalHours || 0} hours · Catalog only`;

    item.appendChild(title);
    item.appendChild(meta);
    item.addEventListener("click", () => {
      selectCourseForEdit(course);
    });

    courseList.appendChild(item);
  });
}

function openCourseModal(classItem) {
  if (!courseModal || !courseForm) {
    return;
  }

  courseModalClassId = classItem?.id ?? state.selectedClassId ?? null;
  if (courseModalTitle) {
    courseModalTitle.textContent = "Class courses";
  }

  clearCourseForm();
  renderCourseModalList();
  courseModal.removeAttribute("hidden");

  if (courseNameInput) {
    courseNameInput.focus();
  }
}

function closeCourseModal() {
  if (!courseModal) {
    return;
  }

  courseModal.setAttribute("hidden", "");
  courseModalClassId = null;
  clearCourseForm();
}

function refreshCourseModal() {
  if (courseModal && !courseModal.hasAttribute("hidden")) {
    renderCourseModalList();
  }
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
    roomIdInput.readOnly = true;
    roomIdInput.placeholder = "Auto-generated";
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

function getSelectedClassId() {
  if (Number.isFinite(state.selectedClassId)) {
    return state.selectedClassId;
  }

  const selectedRow = document.querySelector("#class-list .class-row.selected");
  const classId = selectedRow?.dataset.classId;
  if (classId !== undefined && classId !== null && classId !== "") {
    const numericId = Number(classId);
    return Number.isNaN(numericId) ? classId : numericId;
  }

  return null;
}

function selectRoom(roomId) {
  const numericRoomId = Number(roomId);
  state.selectedRoomId = Number.isNaN(numericRoomId) ? roomId : numericRoomId;
  updateViewVisibility();
  renderRoomList();
  renderEvents();
}

function selectTeacher(teacherId) {
  const numericTeacherId = Number(teacherId);
  state.selectedTeacherId = Number.isNaN(numericTeacherId) ? teacherId : numericTeacherId;
  updateViewVisibility();
  renderEvents();
}

function resolveClassIdForUser(user) {
  if (!user) {
    return null;
  }
  if (Number.isFinite(Number(user.classId))) {
    return Number(user.classId);
  }
  const byId = classDirectory.find((item) => String(item.id) === String(user.id));
  return byId ? Number(byId.id) : null;
}

function resolveTeacherIdForUser(user) {
  if (!user) {
    return null;
  }
  const teacher = (teacherDirectory || []).find(
    (item) => String(item.userId) === String(user.id)
  );
  return teacher ? teacher.id : null;
}

async function showUserSchedule(user) {
  if (!user) {
    return;
  }

  if (user.role === "class-monitor") {
    if (classDirectory.length === 0) {
      await loadClasses();
    }
    const classId = resolveClassIdForUser(user);
    if (!classId) {
      alert("No class is linked to this class monitor.");
      return;
    }
    state.selectedTeacherId = null;
    setView("class");
    state.userScheduleOrigin = "user";
    selectClass(classId);
    return;
  }

  if (isTeacherRole(user.role)) {
    state.selectedClassId = null;
    state.selectedRoomId = null;
    setView("teacher");
    state.userScheduleOrigin = "user";
    const teacherId = resolveTeacherIdForUser(user);
    if (!teacherId) {
      alert("No teacher profile is linked to this user.");
      return;
    }
    selectTeacher(teacherId);
    return;
  }

  alert("Schedule view is available for class monitors and professors only.");
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
        String(user.id).toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term);
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
    row.dataset.userId = user.id;

    const main = document.createElement("div");
    main.className = "user-main";

    const name = document.createElement("div");
    name.className = "user-name";
    name.textContent = user.name;

    const id = document.createElement("div");
    id.className = "user-id";
    id.textContent = `ID: ${user.id}${user.email ? ` · ${user.email}` : ""}`;

    main.appendChild(name);
    main.appendChild(id);

    const tags = document.createElement("div");
    tags.className = "user-tags";

    const roleTag = document.createElement("span");
    roleTag.className = `tag role ${user.role}`;
    roleTag.textContent = getRoleLabel(user.role);

    const departmentTag = document.createElement("span");
    departmentTag.className = "tag department";
    departmentTag.textContent = user.department || "No department";

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

    const content = document.createElement("div");
    content.className = "class-content";

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
    tags.className = "user-tags class-meta";

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
    modified.className = "user-modified class-meta";

    const label = document.createElement("span");
    label.className = "user-label";
    label.textContent = "Last modified";

    const value = document.createElement("span");
    value.className = "user-date";
    value.textContent = formatTimestamp(classItem.lastModified);

    modified.appendChild(label);
    modified.appendChild(value);

    content.appendChild(main);
    content.appendChild(tags);
    content.appendChild(modified);

    const actions = document.createElement("div");
    actions.className = "entity-actions";

    const courseButton = document.createElement("button");
    courseButton.type = "button";
    courseButton.className = "btn btn-ghost class-course";
    courseButton.textContent = "Course";
    courseButton.dataset.classId = classItem.id;
    courseButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openCourseModal(classItem);
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-btn class-edit";
    editButton.setAttribute("aria-label", "Edit class");
    editButton.dataset.classId = classItem.id;
    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openClassModal("edit", classItem);
    });
    editButton.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.06-9.06.92.92-9.06 9.06zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />' +
      "</svg>";

    actions.appendChild(courseButton);
    actions.appendChild(editButton);

    row.appendChild(content);
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
  const rooms = typeof getBookingClassrooms === "function" ? getBookingClassrooms() : roomDirectory;
  return rooms.some(
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
  const rooms = typeof getBookingClassrooms === "function" ? getBookingClassrooms() : roomDirectory;
  if (editingRoomId) {
    const target = rooms.find((item) => String(item.id) === String(editingRoomId));
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
    rooms.push({
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
    const target = userDirectory.find((user) => String(user.id) === String(editingUserId));
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
