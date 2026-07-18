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
  state.smartOverlayTeacherId = null;
  state.smartOverlayClassIds = [];
  state.selectedClassId = null;
  state.selectedRoomId = null;
  state.selectedTeacherId = null;
  state.userScheduleOrigin = null;
  state.smartOverlayEnabled = false;
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
  state.smartOverlayTeacherId = null;
  state.smartOverlayClassIds = [];
  state.smartOverlayEnabled = false;

  if (persist) {
    saveSession({ token, user });
  }
}

async function setView(view) {
  if (view === "user" && !isAdminRole(state.role)) {
    return;
  }

  const isClassScopedUser =
    state.currentUser &&
    (state.currentUser.role === "class-monitor" || state.currentUser.role === "student");

  if (view !== "user") {
    state.userScheduleOrigin = null;
  }
  if (view !== "teacher") {
    state.smartOverlayEnabled = false;
  }

  if (view !== "class") {
    if (!isClassScopedUser) {
      state.selectedClassId = null;
    }
  } else if (isClassScopedUser && !state.selectedClassId) {
    const classId = Number(state.currentUser.classId);
    if (Number.isFinite(classId)) {
      state.selectedClassId = classId;
    }
  }

  state.view = view;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view || (view === "teacher-profile" && tab.dataset.view === "user")));
  updateFilterGroup();
  closeFilterPanel();
  closeUserFilterPanel();
  closeUserModal();
  closeClassModal();
  closeRoomModal();

  // Lazy-load data needed for the new view
  await ensureDataForView(view);

  updateViewVisibility();
  renderCurrentView();
}

async function ensureDataForView(view) {
  // Load teachers directory if going to teacher view and not yet loaded
  if (view === "teacher" && teacherDirectory.length === 0) {
    await loadTeachers();
    syncCurrentTeacherContext();
  }

  // Load users if going to user view (admin only)
  if (view === "user" && isAdminRole(state.role)) {
    await loadUsersIfNeeded();
  }

  // Load teacher departments for user management filters
  if (view === "user" && teacherDepartmentDirectory.length === 0) {
    await loadTeacherDepartments();
  }
}

function updateViewVisibility() {
  const isAdmin = isAdminRole(state.role);
  const isTeacher = isTeacherRole(state.role);
  const canRoomScope = canUseRoomScopedView(state.role);
  const isUserView = state.view === "user";
  const isProfileView = state.view === "teacher-profile";
  const isClassView = state.view === "class";
  const isRoomView = state.view === "room";
  const isTeacherView = state.view === "teacher";
  const isAuditView = state.view === "audit";

  const effectiveTeacherId = state.selectedTeacherId || state.currentTeacherId || null;
  const showClassList =
    (isAdmin || isTeacher || state.role === "guest") &&
    (isClassView && !state.selectedClassId);
  const showRoomList = (isAdmin || isTeacher || canRoomScope) && isRoomView && !state.selectedRoomId;
  const showBackToList =
    (isAdmin &&
      ((isClassView && state.selectedClassId) ||
        (isRoomView && state.selectedRoomId) ||
        (isTeacherView && state.selectedTeacherId && state.userScheduleOrigin === "user"))) ||
    (isTeacher && isClassView && state.selectedClassId) ||
    ((isTeacher || canRoomScope) && isRoomView && state.selectedRoomId) ||
    (state.role === "guest" && isClassView && state.selectedClassId);
  let showSchedule = !isUserView && !isAuditView && !isProfileView;
  if (isAdmin) {
    showSchedule =
      showSchedule &&
      (state.view === "teacher" ||
        (isClassView && state.selectedClassId) ||
        (isRoomView && state.selectedRoomId));
  } else if (canRoomScope && isRoomView) {
    showSchedule = showSchedule && Boolean(state.selectedRoomId);
  } else if (isTeacher && isClassView) {
    showSchedule = showSchedule && Boolean(state.selectedClassId);
  } else if (isTeacher && isRoomView) {
    showSchedule = showSchedule && Boolean(state.selectedRoomId);
  } else if (state.role === "guest" && isClassView) {
    showSchedule = showSchedule && Boolean(state.selectedClassId);
  }

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
  if (classAddBtn) {
    classAddBtn.classList.toggle("hidden", !isAdmin);
    classAddBtn.toggleAttribute("hidden", !isAdmin);
  }
  if (classView) {
    classView.classList.toggle("hidden", !showClassList);
    classView.toggleAttribute("hidden", !showClassList);
  }
  if (roomControls) {
    roomControls.classList.toggle("hidden", !showRoomList);
    roomControls.toggleAttribute("hidden", !showRoomList);
  }
  if (roomAddBtn) {
    roomAddBtn.classList.toggle("hidden", !isAdmin);
    roomAddBtn.toggleAttribute("hidden", !isAdmin);
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
  if (teacherProfileView) {
    teacherProfileView.classList.toggle("hidden", !isProfileView);
    teacherProfileView.toggleAttribute("hidden", !isProfileView);
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
  if (typeof updateSmartToggleState === "function") {
    updateSmartToggleState();
  }
}

function renderCurrentView() {
  if (state.view === "user") {
    renderUserList();
    return;
  }

  if (state.view === "class" && (isAdminRole(state.role) || isTeacherRole(state.role) || state.role === "guest")) {
    renderClassList();
    if (state.selectedClassId) {
      renderEvents();
    }
    return;
  }

  if (state.view === "teacher" && getEffectiveTeacherId()) {
    renderEvents();
    return;
  }

  if (state.view === "room" && (isAdminRole(state.role) || isTeacherRole(state.role) || canUseRoomScopedView(state.role))) {
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

  // Hide the Audit Log tab for class monitors and professors (teachers) and guests.
  // Keep the audit sidebar toggle available for all roles.
  if (auditTab) {
    if (role === "class-monitor" || isTeacherRole(role) || role === "guest") {
      auditTab.classList.add("hidden");
    } else {
      auditTab.classList.remove("hidden");
    }
  }

  if (scheduleTabs && teacherTab) {
    const classTab = scheduleTabs.querySelector('[data-view="class"]');
    const roomTab = scheduleTabs.querySelector('[data-view="room"]');
    
    if (roomTab) {
      if (role === "guest") {
        roomTab.classList.add("hidden");
      } else {
        roomTab.classList.remove("hidden");
      }
    }
    
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
