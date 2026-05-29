const SESSION_STORAGE_KEY = "sms.session";

function getSessionStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    console.warn("Local storage unavailable, using session storage", error);
  }
  return sessionStorage;
}

function resetSessionState() {
  state.role = "guest";
  state.view = "class";
  state.weekOffset = 0;
  state.userName = "Guest";
  state.authToken = null;
  state.currentUser = null;
  state.currentTeacherId = null;
  state.defaultCourseId = null;
  state.selectedClassId = null;
  state.selectedRoomId = null;
  state.selectedTeacherId = null;
  state.userScheduleOrigin = null;
}

function saveSession(session) {
  try {
    if (!session || !session.token || !session.user) {
      clearSession();
      return;
    }
    getSessionStorage().setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session)
    );
  } catch (error) {
    console.warn("Failed to save session state", error);
  }
}

function restoreSession() {
  try {
    const rawSession = getSessionStorage().getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const session = JSON.parse(rawSession);
    if (!session || !session.token || !session.user) {
      return null;
    }

    return session;
  } catch (error) {
    console.warn("Failed to restore session state", error);
    clearSession();
    return null;
  }
}

function clearSession() {
  try {
    getSessionStorage().removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear session state", error);
  }
}

function getAuthToken() {
  return state.authToken;
}

function applyAuthenticatedSession(token, user, persist = true) {
  if (!token || !user) {
    throw new Error("Invalid authenticated session");
  }

  state.authToken = token;
  state.currentUser = user;
  state.role = user.role || "guest";
  state.userName = user.name || "User";
  state.currentTeacherId = null;
  state.defaultCourseId = null;

  if (persist) {
    saveSession({ token, user });
  }
}

function setView(view) {
  if (view === "user" && !isAdminRole(state.role)) {
    return;
  }

  if (view !== "user") {
    state.userScheduleOrigin = null;
  }

  if (view !== "class") {
    state.selectedClassId = null;
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
  const isTeacherView = state.view === "teacher";
  const isAuditView = state.view === "audit";

  const showClassList = isAdmin && isClassView && !state.selectedClassId;
  const showRoomList = isAdmin && isRoomView && !state.selectedRoomId;
  const showBackToList =
    isAdmin &&
    ((isClassView && state.selectedClassId) ||
      (isRoomView && state.selectedRoomId) ||
      (isTeacherView && state.selectedTeacherId && state.userScheduleOrigin === "user"));
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

  if (typeof renderAuditLog === "function") {
    renderAuditLog();
  }

  if (typeof updateActiveScopeLabel === "function") {
    updateActiveScopeLabel();
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

function showSchedule(role, label, persistSession = true) {
  state.role = role;
  state.userName = label || "User";
  if (!isAdminRole(role)) {
    state.selectedClassId = null;
    state.selectedRoomId = null;
    state.selectedTeacherId = null;
    state.userScheduleOrigin = null;
  }
  loginView.classList.add("hidden");
  scheduleView.classList.remove("hidden");
  welcomeLine.textContent = `Welcome, ${label}`;

  if (auditToggle) {
    auditToggle.classList.remove("hidden");
    auditToggle.removeAttribute("hidden");
  }
  if (auditPanel) {
    auditPanel.classList.remove("hidden");
    auditPanel.removeAttribute("hidden");
  }

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

  // Hide the Audit Log tab for class monitors and professors (teachers).
  // Keep the audit sidebar toggle available for all roles.
  if (auditTab) {
    if (role === "class-monitor" || isTeacherRole(role)) {
      auditTab.classList.add("hidden");
    } else {
      auditTab.classList.remove("hidden");
    }
  }

  if (scheduleTabs && teacherTab) {
    const classTab = scheduleTabs.querySelector('[data-view="class"]');
    const roomTab = scheduleTabs.querySelector('[data-view="room"]');
    if (classTab) {
      if (isTeacherRole(role)) {
        scheduleTabs.insertBefore(teacherTab, classTab);
      } else if (roomTab) {
        scheduleTabs.insertBefore(teacherTab, roomTab);
      }
    }
  }

  if (auditToggle) {
    auditToggle.removeAttribute("hidden");
  }

  if (persistSession && state.authToken && state.currentUser) {
    saveSession({ token: state.authToken, user: state.currentUser });
  }

  // Default view: teacher for professors, otherwise class
  if (isTeacherRole(role)) {
    setView("teacher");
  } else {
    setView("class");
  }
  updateWeek();
}

function showLogin() {
  clearSession();
  resetSessionState();
  scheduleView.classList.add("hidden");
  loginView.classList.remove("hidden");
  welcomeLine.textContent = "Welcome, Guest";
  if (typeof closeAuditPanel === "function") {
  closeAuditPanel();
  }
  // visually hide both elements after closing
  if (auditPanel) {
    auditPanel.classList.add("hidden");
    auditPanel.setAttribute("hidden", "");
  }
  if (auditToggle) {
    auditToggle.classList.add("hidden");
    auditToggle.setAttribute("hidden", "");
  }
  if (loginForm) {
    loginForm.reset();
  }
}
