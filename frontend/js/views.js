function setView(view) {
  if (view === "user" && !isAdminRole(state.role)) {
    return;
  }

  state.view = view;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  updateFilterGroup();
  closeFilterPanel();
  closeUserFilterPanel();
  closeUserModal();
  closeClassModal();
  closeRoomModal();
  updateViewVisibility();
  renderCurrentView();
}

function updateViewVisibility() {
  const isAdmin = isAdminRole(state.role);
  const isUserView = state.view === "user";
  const isClassView = state.view === "class";
  const isRoomView = state.view === "room";
  const isAuditView = state.view === "audit";

  const showClassList = isAdmin && isClassView && !state.selectedClassId;
  const showRoomList = isAdmin && isRoomView && !state.selectedRoomId;
  const showBackToList =
    isAdmin &&
    ((isClassView && state.selectedClassId) || (isRoomView && state.selectedRoomId));
  const showSchedule =
    !isUserView &&
    !isAuditView &&
    (!isAdmin ||
      state.view === "teacher" ||
      (isClassView && state.selectedClassId) ||
      (isRoomView && state.selectedRoomId));

  if (scheduleControls) {
    scheduleControls.classList.toggle("hidden", !showSchedule);
    scheduleControls.toggleAttribute("hidden", !showSchedule);
  }
  if (backToListBtn) {
    backToListBtn.classList.toggle("hidden", !showBackToList);
    backToListBtn.toggleAttribute("hidden", !showBackToList);
  }
  if (scheduleCard) {
    scheduleCard.classList.toggle("hidden", !showSchedule);
    scheduleCard.toggleAttribute("hidden", !showSchedule);
  }
  if (classControls) {
    classControls.classList.toggle("hidden", !showClassList);
    classControls.toggleAttribute("hidden", !showClassList);
  }
  if (classView) {
    classView.classList.toggle("hidden", !showClassList);
    classView.toggleAttribute("hidden", !showClassList);
  }
  if (roomControls) {
    roomControls.classList.toggle("hidden", !showRoomList);
    roomControls.toggleAttribute("hidden", !showRoomList);
  }
  if (roomView) {
    roomView.classList.toggle("hidden", !showRoomList);
    roomView.toggleAttribute("hidden", !showRoomList);
  }
  if (userControls) {
    userControls.classList.toggle("hidden", !isUserView);
    userControls.toggleAttribute("hidden", !isUserView);
  }
  if (userView) {
    userView.classList.toggle("hidden", !isUserView);
    userView.toggleAttribute("hidden", !isUserView);
  }
  if (auditView) {
    auditView.classList.toggle("hidden", !isAuditView);
    auditView.toggleAttribute("hidden", !isAuditView);
  }
}

function renderCurrentView() {
  if (state.view === "user") {
    renderUserList();
    return;
  }

  if (state.view === "class" && isAdminRole(state.role)) {
    renderClassList();
    if (state.selectedClassId) {
      renderEvents();
    }
    return;
  }

  if (state.view === "room" && isAdminRole(state.role)) {
    renderRoomList();
    if (state.selectedRoomId) {
      renderEvents();
    }
    return;
  }

  if (state.view === "audit") {
    return;
  }

  renderEvents();
}

function showSchedule(role, label) {
  state.role = role;
  state.userName = label || "User";
  if (!isAdminRole(role)) {
    state.selectedClassId = null;
    state.selectedRoomId = null;
  }
  loginView.classList.add("hidden");
  scheduleView.classList.remove("hidden");
  welcomeLine.textContent = `Welcome, ${label}`;

  if (userTab) {
    userTab.classList.toggle("hidden", !isAdminRole(role));
  }

  if (!isTeacherRole(role)) {
    teacherTab.classList.add("hidden");
    guestNote.classList.remove("hidden");
    if (state.view === "teacher") {
      setView("class");
    }
  } else {
    teacherTab.classList.remove("hidden");
    guestNote.classList.add("hidden");
  }

  setView("class");
  updateWeek();
}

function showLogin() {
  scheduleView.classList.add("hidden");
  loginView.classList.remove("hidden");
}
