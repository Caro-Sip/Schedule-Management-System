const START_HOUR = 6;
const END_HOUR = 18;
const HOUR_HEIGHT = 56;

const state = {
  role: "guest",
  view: "class",
  weekOffset: 0,
  userName: "Guest",
  selectedClassId: null,
  selectedRoomId: null,
};

const viewLabels = {
  class: "Class Schedule",
  teacher: "Teacher Schedule",
  room: "Room Schedule",
  user: "User Directory",
};

const eventsByView = {
  class: [],
  teacher: [],
  room: [],
};

const userDirectory = [
  {
    id: "U-1024",
    name: "Ariana Patel",
    role: "admin",
    department: "Registrar",
    password: "changeme",
    lastModified: "2026-05-15T10:22:00",
  },
  {
    id: "U-1088",
    name: "Miguel Santos",
    role: "professor",
    department: "Engineering",
    password: "changeme",
    lastModified: "2026-05-16T08:40:00",
  },
  {
    id: "U-1125",
    name: "Hana Lee",
    role: "class-monitor",
    department: "Engineering",
    password: "changeme",
    lastModified: "2026-05-14T14:05:00",
  },
  {
    id: "U-1203",
    name: "Priya Nair",
    role: "guest",
    department: "Science",
    password: "changeme",
    lastModified: "2026-05-12T09:30:00",
  },
  {
    id: "U-1266",
    name: "Omar Khalid",
    role: "professor",
    department: "Mathematics",
    password: "changeme",
    lastModified: "2026-05-11T16:50:00",
  },
  {
    id: "U-1310",
    name: "Zoe Chen",
    role: "admin",
    department: "Student Affairs",
    password: "changeme",
    lastModified: "2026-05-10T11:15:00",
  },
  {
    id: "U-1349",
    name: "Leo Martinez",
    role: "guest",
    department: "Arts",
    password: "changeme",
    lastModified: "2026-05-09T17:45:00",
  },
  {
    id: "U-1392",
    name: "Sofia Ibrahim",
    role: "class-monitor",
    department: "Science",
    password: "changeme",
    lastModified: "2026-05-08T13:20:00",
  },
];

const classDirectory = [
  {
    id: "C-101",
    name: "SE-1A",
    department: "Engineering",
    lastModified: "2026-05-15T09:10:00",
  },
  {
    id: "C-202",
    name: "CS-2B",
    department: "Science",
    lastModified: "2026-05-13T15:45:00",
  },
  {
    id: "C-305",
    name: "IT-3C",
    department: "Information Technology",
    lastModified: "2026-05-11T11:20:00",
  },
];

const roomDirectory = [
  {
    id: "R-101",
    name: "Room 101",
    building: "Building A",
    floor: "1",
    lastModified: "2026-05-14T13:05:00",
  },
  {
    id: "R-202",
    name: "Room 202",
    building: "Building B",
    floor: "2",
    lastModified: "2026-05-12T10:30:00",
  },
  {
    id: "R-303",
    name: "Room 303",
    building: "Building C",
    floor: "3",
    lastModified: "2026-05-10T16:15:00",
  },
];

const roleLabels = {
  admin: "Admin",
  professor: "Professor",
  "class-monitor": "Class monitor",
  guest: "Student",
};

const loginView = document.getElementById("login-view");
const scheduleView = document.getElementById("schedule-view");
const guestLoginBtn = document.getElementById("guest-login");
const loginForm = document.getElementById("login-form");
const backToLogin = document.getElementById("back-to-login");
const teacherTab = document.getElementById("teacher-tab");
const userTab = document.getElementById("user-tab");
const guestNote = document.getElementById("guest-note");
const welcomeLine = document.getElementById("welcome-line");
const scheduleControls = document.getElementById("schedule-controls");
const scheduleCard = document.getElementById("schedule-card");
const userControls = document.getElementById("user-controls");
const userView = document.getElementById("user-view");
const userSearch = document.getElementById("user-search");
const userFilterToggle = document.getElementById("user-filter-toggle");
const userFilterPanel = document.getElementById("user-filter-panel");
const userFilterApply = document.getElementById("user-filter-apply");
const userFilterClear = document.getElementById("user-filter-clear");
const userFilterRole = document.getElementById("filter-user-role");
const userFilterDepartment = document.getElementById("filter-user-department");
const userList = document.getElementById("user-list");
const userCount = document.getElementById("user-count");
const userAddBtn = document.getElementById("user-add");
const userModal = document.getElementById("user-modal");
const userModalTitle = document.getElementById("user-modal-title");
const userForm = document.getElementById("user-form");
const userNameInput = document.getElementById("user-name");
const userIdInput = document.getElementById("user-id");
const userPasswordInput = document.getElementById("user-password");
const userRoleInput = document.getElementById("user-role");
const userDepartmentInput = document.getElementById("user-department");
const userDeleteBtn = document.getElementById("user-delete");
const userCancelBtn = document.getElementById("user-cancel");
const userCloseBtn = document.getElementById("user-close");
const classControls = document.getElementById("class-controls");
const classView = document.getElementById("class-view");
const classList = document.getElementById("class-list");
const classCount = document.getElementById("class-count");
const classAddBtn = document.getElementById("class-add");
const classModal = document.getElementById("class-modal");
const classModalTitle = document.getElementById("class-modal-title");
const classForm = document.getElementById("class-form");
const classNameInput = document.getElementById("class-name");
const classIdInput = document.getElementById("class-id");
const classDepartmentInput = document.getElementById("class-department");
const classDeleteBtn = document.getElementById("class-delete");
const classCancelBtn = document.getElementById("class-cancel");
const classCloseBtn = document.getElementById("class-close");
const roomControls = document.getElementById("room-controls");
const roomView = document.getElementById("room-view");
const roomList = document.getElementById("room-list");
const roomCount = document.getElementById("room-count");
const roomAddBtn = document.getElementById("room-add");
const roomModal = document.getElementById("room-modal");
const roomModalTitle = document.getElementById("room-modal-title");
const roomForm = document.getElementById("room-form");
const roomNameInput = document.getElementById("room-name");
const roomIdInput = document.getElementById("room-id");
const roomBuildingInput = document.getElementById("room-building");
const roomFloorInput = document.getElementById("room-floor");
const roomDeleteBtn = document.getElementById("room-delete");
const roomCancelBtn = document.getElementById("room-cancel");
const roomCloseBtn = document.getElementById("room-close");
const filterToggle = document.getElementById("filter-toggle");
const filterPanel = document.getElementById("filter-panel");
const filterApply = document.getElementById("filter-apply");
const filterClear = document.getElementById("filter-clear");
const filterDepartment = document.getElementById("filter-department");
const filterMajor = document.getElementById("filter-major");
const filterYear = document.getElementById("filter-year");
const filterGroup = document.getElementById("filter-group");
const filterBuilding = document.getElementById("filter-building");
const filterFloor = document.getElementById("filter-floor");
const filterRoom = document.getElementById("filter-room");
const filterGroupClass = document.querySelector('[data-filter-group="class"]');
const filterGroupRoom = document.querySelector('[data-filter-group="room"]');
const bookingModal = document.getElementById("booking-modal");
const bookingTitle = document.getElementById("booking-title");
const bookingForm = document.getElementById("booking-form");
const bookingStart = document.getElementById("booking-start");
const bookingEnd = document.getElementById("booking-end");
const bookingProfessor = document.getElementById("booking-professor");
const bookingSubject = document.getElementById("booking-subject");
const bookingType = document.getElementById("booking-type");
const bookingCancel = document.getElementById("booking-cancel");
const bookingDelete = document.getElementById("booking-delete");
const bookingSubmit = document.getElementById("booking-submit");
const bookingClose = document.getElementById("booking-close");
const auditToggle = document.getElementById("audit-toggle");
const auditPanel = document.getElementById("audit-panel");
const auditList = document.getElementById("audit-list");
const auditCount = document.getElementById("audit-count");
const tabs = Array.from(document.querySelectorAll(".tab"));

let pendingBooking = null;
let editingUserId = null;
let editingClassId = null;
let editingRoomId = null;

const auditLog = [];

const scheduleHeader = document.getElementById("schedule-header");
const timeColumn = document.getElementById("time-column");
const eventsEl = document.getElementById("events");
const weekSub = document.getElementById("week-sub");

const prevWeekBtn = document.getElementById("prev-week");
const nextWeekBtn = document.getElementById("next-week");
const todayBtn = document.getElementById("today-btn");

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

function updateFilterGroup() {
  if (!filterGroupClass || !filterGroupRoom) {
    return;
  }

  const isRoom = state.view === "room";
  filterGroupClass.toggleAttribute("hidden", isRoom);
  filterGroupRoom.toggleAttribute("hidden", !isRoom);
}

function openFilterPanel() {
  if (!filterPanel || !filterToggle) {
    return;
  }
  filterPanel.removeAttribute("hidden");
  filterToggle.setAttribute("aria-expanded", "true");
}

function closeFilterPanel() {
  if (!filterPanel || !filterToggle) {
    return;
  }
  filterPanel.setAttribute("hidden", "");
  filterToggle.setAttribute("aria-expanded", "false");
}

function toggleFilterPanel() {
  if (!filterPanel) {
    return;
  }
  if (filterPanel.hasAttribute("hidden")) {
    openFilterPanel();
  } else {
    closeFilterPanel();
  }
}

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
    classIdInput.value = classItem?.id || "";
  }
  if (classDepartmentInput) {
    classDepartmentInput.value = classItem?.department || "";
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
  state.selectedClassId = classId;
  updateViewVisibility();
  renderClassList();
  renderEvents();
}

function selectRoom(roomId) {
  state.selectedRoomId = roomId;
  updateViewVisibility();
  renderRoomList();
  renderEvents();
}

function openBookingModal(dayIndex, startMinutes, eventData = null) {
  if (!bookingModal || !bookingForm) {
    return;
  }

  const isEdit = Boolean(eventData);
  const bookingDay = isEdit ? eventData.day : dayIndex;

  pendingBooking = {
    day: bookingDay,
    view: state.view,
    eventId: isEdit ? eventData.id : null,
    classId: isEdit ? eventData.classId || null : state.selectedClassId || null,
    roomId: isEdit ? eventData.roomId || null : state.selectedRoomId || null,
  };

  if (bookingTitle) {
    const titleMap = {
      class: "Book Class",
      room: "Book Room",
      teacher: "Book Teacher",
    };
    const editMap = {
      class: "Edit Class",
      room: "Edit Room",
      teacher: "Edit Teacher",
    };
    bookingTitle.textContent = isEdit
      ? editMap[state.view] || "Edit Class"
      : titleMap[state.view] || "Book Class";
  }

  if (bookingStart) {
    bookingStart.value = isEdit ? eventData.start : minutesToTime(startMinutes);
  }
  if (bookingEnd) {
    if (isEdit) {
      bookingEnd.value = eventData.end;
    } else {
      const endMinutes = Math.min(startMinutes + 60, END_HOUR * 60);
      bookingEnd.value = minutesToTime(endMinutes);
    }
  }
  if (bookingProfessor) {
    bookingProfessor.value = isEdit ? eventData.professor || "" : "";
  }
  if (bookingSubject) {
    bookingSubject.value = isEdit ? eventData.title || "" : "";
  }
  if (bookingType) {
    bookingType.value = isEdit ? eventData.type || "lecture" : "lecture";
  }

  if (bookingDelete) {
    bookingDelete.toggleAttribute("hidden", !isEdit);
  }
  if (bookingSubmit) {
    bookingSubmit.textContent = isEdit ? "Save" : "Book";
  }

  bookingModal.removeAttribute("hidden");
  if (bookingStart) {
    bookingStart.focus();
  }
}

function closeBookingModal() {
  if (!bookingModal) {
    return;
  }
  bookingModal.setAttribute("hidden", "");
  pendingBooking = null;
}

function isTeacherRole(role) {
  return role === "professor";
}

function isAdminRole(role) {
  return role === "admin";
}

function updateViewVisibility() {
  const isAdmin = isAdminRole(state.role);
  const isUserView = state.view === "user";
  const isClassView = state.view === "class";
  const isRoomView = state.view === "room";

  const showClassList = isAdmin && isClassView;
  const showRoomList = isAdmin && isRoomView;
  const showSchedule =
    !isUserView &&
    (!isAdmin ||
      state.view === "teacher" ||
      (isClassView && state.selectedClassId) ||
      (isRoomView && state.selectedRoomId));

  if (scheduleControls) {
    scheduleControls.classList.toggle("hidden", !showSchedule);
    scheduleControls.toggleAttribute("hidden", !showSchedule);
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

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function updateWeek() {
  const today = new Date();
  const base = startOfWeek(today);
  base.setDate(base.getDate() + state.weekOffset * 7);

  renderHeader(base, today);
  renderTimes();
  renderEvents();

  const label = base.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  weekSub.textContent = label;
}

function renderHeader(startDate, today) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  scheduleHeader.innerHTML = '<div class="corner"></div>';

  for (let i = 0; i < 7; i += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);

    const day = document.createElement("div");
    day.className = "day";

    const name = document.createElement("div");
    name.textContent = dayNames[i];

    const dateNumber = document.createElement("div");
    dateNumber.className = "date-number";
    dateNumber.textContent = current.getDate();

    day.appendChild(name);
    day.appendChild(dateNumber);

    if (
      current.getFullYear() === today.getFullYear() &&
      current.getMonth() === today.getMonth() &&
      current.getDate() === today.getDate()
    ) {
      const pill = document.createElement("div");
      pill.className = "today-pill";
      pill.textContent = "Today";
      day.appendChild(pill);
    }

    scheduleHeader.appendChild(day);
  }
}

function renderTimes() {
  timeColumn.innerHTML = "";
  for (let hour = START_HOUR; hour <= END_HOUR; hour += 1) {
    const label = document.createElement("div");
    label.className = "time-row";
    label.textContent = formatHour(hour);
    timeColumn.appendChild(label);
  }
}

function formatHour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${period}`;
}

function renderEvents() {
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
  eventsEl.style.setProperty("--grid-height", `${gridHeight}px`);
  eventsEl.style.setProperty("--hour-height", `${HOUR_HEIGHT}px`);
  eventsEl.innerHTML = "";

  for (let i = 0; i < 7; i += 1) {
    const column = document.createElement("div");
    column.className = "day-column";
    column.dataset.day = i.toString();
    eventsEl.appendChild(column);
  }

  ensureEventIds(state.view);
  const items = eventsByView[state.view] || [];
  let filteredItems = items;

  if (state.view === "class" && isAdminRole(state.role)) {
    if (!state.selectedClassId) {
      return;
    }
    filteredItems = items.filter((item) => item.classId === state.selectedClassId);
  }

  if (state.view === "room" && isAdminRole(state.role)) {
    if (!state.selectedRoomId) {
      return;
    }
    filteredItems = items.filter((item) => item.roomId === state.selectedRoomId);
  }

  filteredItems.forEach((eventItem) => {
    const column = eventsEl.querySelector(`.day-column[data-day="${eventItem.day}"]`);
    if (!column) {
      return;
    }

    const eventEl = document.createElement("div");
    eventEl.className = `event ${state.view}`;
    if (eventItem.id) {
      eventEl.dataset.eventId = eventItem.id;
    }

    const top = minutesFromStart(eventItem.start) * (HOUR_HEIGHT / 60);
    const height =
      (minutesFromStart(eventItem.end) - minutesFromStart(eventItem.start)) *
      (HOUR_HEIGHT / 60);

    eventEl.style.top = `${top}px`;
    eventEl.style.height = `${height}px`;

    const title = document.createElement("strong");
    title.textContent = eventItem.title;

    const time = document.createElement("span");
    time.textContent = `${eventItem.start} - ${eventItem.end}`;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = eventItem.meta || "";

    eventEl.appendChild(title);
    eventEl.appendChild(time);
    if (eventItem.meta) {
      eventEl.appendChild(meta);
    }

    column.appendChild(eventEl);
  });
}

function getRoleLabel(role) {
  return roleLabels[role] || role;
}

function createEventId() {
  return `event-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

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

function formatClockTime(timeValue) {
  const total = parseTimeInput(timeValue);
  if (total === null) {
    return timeValue;
  }
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatBookingTimeRange(start, end) {
  return `${formatClockTime(start)} - ${formatClockTime(end)}`;
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

function ensureEventIds(view) {
  const items = eventsByView[view] || [];
  items.forEach((eventItem) => {
    if (!eventItem.id) {
      eventItem.id = createEventId();
    }
  });
}

function getBookingConflict(view, day, startMinutes, endMinutes, ignoreId, classId, roomId) {
  const items = eventsByView[view] || [];
  return (
    items.find((eventItem) => {
      if (ignoreId && eventItem.id === ignoreId) {
        return false;
      }
      if (eventItem.day !== day) {
        return false;
      }
      if (view === "class" && classId && eventItem.classId !== classId) {
        return false;
      }
      if (view === "room" && roomId && eventItem.roomId !== roomId) {
        return false;
      }
      const eventStart = parseTimeInput(eventItem.start);
      const eventEnd = parseTimeInput(eventItem.end);
      if (eventStart === null || eventEnd === null) {
        return false;
      }
      return startMinutes < eventEnd && endMinutes > eventStart;
    }) || null
  );
}

function formatTimestamp(value) {
  const date = new Date(value);
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

    const value = document.createElement("span");  v   
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
    .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
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

    const departmentTag = document.createElement("span");
    departmentTag.className = "tag department";
    departmentTag.textContent = classItem.department;

    tags.appendChild(departmentTag);

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
  return roomDirectory
    .slice()
    .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
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
    if (state.selectedRoomId === roomItem.id) {
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
    floorTag.textContent = `Floor ${roomItem.floor}`;

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
  const normalized = nextId.toLowerCase();
  return classDirectory.some(
    (item) => item.id.toLowerCase() === normalized && item.id !== editingClassId
  );
}

function isDuplicateRoomId(nextId) {
  const normalized = nextId.toLowerCase();
  return roomDirectory.some(
    (item) => item.id.toLowerCase() === normalized && item.id !== editingRoomId
  );
}

function upsertClass({ id, name, department }) {
  const timestamp = new Date().toISOString();
  const actor = state.userName || "User";
  if (editingClassId) {
    const target = classDirectory.find((item) => item.id === editingClassId);
    if (!target) {
      return;
    }
    target.id = id;
    target.name = name;
    target.department = department;
    target.lastModified = timestamp;
    addAuditEntry("Edited class", actor, name, "");
  } else {
    classDirectory.push({
      id,
      name,
      department,
      lastModified: timestamp,
    });
    addAuditEntry("Added class", actor, name, "");
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
    addAuditEntry("Edited room", actor, name, "");
  } else {
    roomDirectory.push({
      id,
      name,
      building,
      floor,
      lastModified: timestamp,
    });
    addAuditEntry("Added room", actor, name, "");
  }
}

function isDuplicateUserId(nextId) {
  const normalized = nextId.toLowerCase();
  return userDirectory.some(
    (user) => user.id.toLowerCase() === normalized && user.id !== editingUserId
  );
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

function minutesFromStart(time) {
  const [hour, minutes] = time.split(":").map(Number);
  return (hour - START_HOUR) * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function parseTimeInput(value) {
  if (!value) {
    return null;
  }
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function handleTabClick(event) {
  const view = event.currentTarget.dataset.view;
  if (!view) {
    return;
  }

  if (view === "teacher" && !isTeacherRole(state.role)) {
    return;
  }

  if (view === "user" && !isAdminRole(state.role)) {
    return;
  }

  setView(view);
}

function bindEvents() {
  guestLoginBtn.addEventListener("click", () => showSchedule("guest", "Guest"));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const role = formData.get("role") || "class-monitor";
    const name = (formData.get("username") || "User").toString();
    showSchedule(role.toString(), name);
  });

  backToLogin.addEventListener("click", showLogin);

  tabs.forEach((tab) => tab.addEventListener("click", handleTabClick));

  prevWeekBtn.addEventListener("click", () => {
    state.weekOffset -= 1;
    updateWeek();
  });

  nextWeekBtn.addEventListener("click", () => {
    state.weekOffset += 1;
    updateWeek();
  });

  todayBtn.addEventListener("click", () => {
    state.weekOffset = 0;
    updateWeek();
  });

  if (filterToggle && filterPanel) {
    filterToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFilterPanel();
    });
  }

  if (filterApply && filterPanel) {
    filterApply.addEventListener("click", () => {
      closeFilterPanel();
    });
  }

  if (filterClear) {
    filterClear.addEventListener("click", () => {
      if (filterDepartment) {
        filterDepartment.value = "";
      }
      if (filterMajor) {
        filterMajor.value = "";
      }
      if (filterYear) {
        filterYear.value = "";
      }
      if (filterGroup) {
        filterGroup.value = "";
      }
      if (filterBuilding) {
        filterBuilding.value = "";
      }
      if (filterFloor) {
        filterFloor.value = "";
      }
      if (filterRoom) {
        filterRoom.value = "";
      }
      closeFilterPanel();
    });
  }

  if (userFilterToggle && userFilterPanel) {
    userFilterToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleUserFilterPanel();
    });
  }

  if (userFilterApply && userFilterPanel) {
    userFilterApply.addEventListener("click", () => {
      closeUserFilterPanel();
      renderUserList();
    });
  }

  if (userFilterClear) {
    userFilterClear.addEventListener("click", () => {
      if (userFilterRole) {
        userFilterRole.value = "";
      }
      if (userFilterDepartment) {
        userFilterDepartment.value = "";
      }
      closeUserFilterPanel();
      renderUserList();
    });
  }

  if (userSearch) {
    userSearch.addEventListener("input", () => {
      renderUserList();
    });
  }

  if (userAddBtn) {
    userAddBtn.addEventListener("click", () => {
      openUserModal("add");
    });
  }

  if (userList) {
    userList.addEventListener("click", (event) => {
      const editButton = event.target.closest(".user-edit");
      if (!editButton) {
        return;
      }
      const userId = editButton.dataset.userId;
      const user = userDirectory.find((item) => item.id === userId);
      if (!user) {
        return;
      }
      openUserModal("edit", user);
    });
  }

  if (userForm) {
    userForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (
        !userNameInput ||
        !userIdInput ||
        !userPasswordInput ||
        !userRoleInput ||
        !userDepartmentInput
      ) {
        return;
      }

      const name = userNameInput.value.trim();
      const id = userIdInput.value.trim();
      const password = userPasswordInput.value.trim();
      const role = userRoleInput.value;
      const department = userDepartmentInput.value;

      if (!name || !id) {
        alert("Name and ID are required.");
        return;
      }

      if (!editingUserId && !password) {
        alert("Password is required for new users.");
        return;
      }

      if (isDuplicateUserId(id)) {
        alert("User ID already exists.");
        return;
      }

      upsertUser({ id, name, role, department, password: password || null });
      closeUserModal();
      renderUserList();
    });
  }

  if (userDeleteBtn) {
    userDeleteBtn.addEventListener("click", () => {
      if (!editingUserId) {
        return;
      }
      const confirmed = confirm("Delete this user?");
      if (!confirmed) {
        return;
      }
      const index = userDirectory.findIndex((user) => user.id === editingUserId);
      if (index === -1) {
        return;
      }
      userDirectory.splice(index, 1);
      closeUserModal();
      renderUserList();
    });
  }

  if (userCancelBtn) {
    userCancelBtn.addEventListener("click", closeUserModal);
  }

  if (userCloseBtn) {
    userCloseBtn.addEventListener("click", closeUserModal);
  }

  if (userModal) {
    userModal.addEventListener("click", (event) => {
      if (event.target === userModal) {
        closeUserModal();
      }
    });
  }

  if (classAddBtn) {
    classAddBtn.addEventListener("click", () => {
      openClassModal("add");
    });
  }

  if (classList) {
    classList.addEventListener("click", (event) => {
      const editButton = event.target.closest(".class-edit");
      if (editButton) {
        const classId = editButton.dataset.classId;
        const classItem = classDirectory.find((item) => item.id === classId);
        if (classItem) {
          openClassModal("edit", classItem);
        }
        return;
      }

      const row = event.target.closest(".class-row");
      if (!row) {
        return;
      }
      const classId = row.dataset.classId;
      if (classId) {
        selectClass(classId);
      }
    });
  }

  if (classForm) {
    classForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!classNameInput || !classIdInput || !classDepartmentInput) {
        return;
      }

      const name = classNameInput.value.trim();
      const id = classIdInput.value.trim();
      const department = classDepartmentInput.value.trim();

      if (!name || !id || !department) {
        alert("Class name, ID, and department are required.");
        return;
      }

      if (isDuplicateClassId(id)) {
        alert("Class ID already exists.");
        return;
      }

      const wasEditing = Boolean(editingClassId);
      const previousId = editingClassId;
      upsertClass({ id, name, department });
      closeClassModal();
      renderClassList();

      if (!wasEditing) {
        selectClass(id);
      } else if (previousId && previousId !== id && state.selectedClassId === previousId) {
        selectClass(id);
      }
    });
  }

  if (classDeleteBtn) {
    classDeleteBtn.addEventListener("click", () => {
      if (!editingClassId) {
        return;
      }
      const confirmed = confirm("Delete this class?");
      if (!confirmed) {
        return;
      }
      const index = classDirectory.findIndex((item) => item.id === editingClassId);
      if (index === -1) {
        return;
      }
      const actor = state.userName || "User";
      const removed = classDirectory[index];
      classDirectory.splice(index, 1);
      addAuditEntry("Deleted class", actor, removed.name, "");
      closeClassModal();
      if (state.selectedClassId === removed.id) {
        state.selectedClassId = null;
        updateViewVisibility();
      }
      renderClassList();
      renderEvents();
    });
  }

  if (classCancelBtn) {
    classCancelBtn.addEventListener("click", closeClassModal);
  }

  if (classCloseBtn) {
    classCloseBtn.addEventListener("click", closeClassModal);
  }

  if (classModal) {
    classModal.addEventListener("click", (event) => {
      if (event.target === classModal) {
        closeClassModal();
      }
    });
  }

  if (roomAddBtn) {
    roomAddBtn.addEventListener("click", () => {
      openRoomModal("add");
    });
  }

  if (roomList) {
    roomList.addEventListener("click", (event) => {
      const editButton = event.target.closest(".room-edit");
      if (editButton) {
        const roomId = editButton.dataset.roomId;
        const roomItem = roomDirectory.find((item) => item.id === roomId);
        if (roomItem) {
          openRoomModal("edit", roomItem);
        }
        return;
      }

      const row = event.target.closest(".room-row");
      if (!row) {
        return;
      }
      const roomId = row.dataset.roomId;
      if (roomId) {
        selectRoom(roomId);
      }
    });
  }

  if (roomForm) {
    roomForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!roomNameInput || !roomIdInput || !roomBuildingInput || !roomFloorInput) {
        return;
      }

      const name = roomNameInput.value.trim();
      const id = roomIdInput.value.trim();
      const building = roomBuildingInput.value.trim();
      const floor = roomFloorInput.value.trim();

      if (!name || !id || !building || !floor) {
        alert("Room name, ID, building, and floor are required.");
        return;
      }

      if (isDuplicateRoomId(id)) {
        alert("Room ID already exists.");
        return;
      }

      const wasEditing = Boolean(editingRoomId);
      const previousId = editingRoomId;
      upsertRoom({ id, name, building, floor });
      closeRoomModal();
      renderRoomList();

      if (!wasEditing) {
        selectRoom(id);
      } else if (previousId && previousId !== id && state.selectedRoomId === previousId) {
        selectRoom(id);
      }
    });
  }

  if (roomDeleteBtn) {
    roomDeleteBtn.addEventListener("click", () => {
      if (!editingRoomId) {
        return;
      }
      const confirmed = confirm("Delete this room?");
      if (!confirmed) {
        return;
      }
      const index = roomDirectory.findIndex((item) => item.id === editingRoomId);
      if (index === -1) {
        return;
      }
      const actor = state.userName || "User";
      const removed = roomDirectory[index];
      roomDirectory.splice(index, 1);
      addAuditEntry("Deleted room", actor, removed.name, "");
      closeRoomModal();
      if (state.selectedRoomId === removed.id) {
        state.selectedRoomId = null;
        updateViewVisibility();
      }
      renderRoomList();
      renderEvents();
    });
  }

  if (roomCancelBtn) {
    roomCancelBtn.addEventListener("click", closeRoomModal);
  }

  if (roomCloseBtn) {
    roomCloseBtn.addEventListener("click", closeRoomModal);
  }

  if (roomModal) {
    roomModal.addEventListener("click", (event) => {
      if (event.target === roomModal) {
        closeRoomModal();
      }
    });
  }

  if (auditToggle) {
    auditToggle.addEventListener("click", toggleAuditPanel);
  }

  if (eventsEl) {
    eventsEl.addEventListener("click", (event) => {
      const eventCard = event.target.closest(".event");
      if (eventCard) {
        const eventId = eventCard.dataset.eventId;
        const items = eventsByView[state.view] || [];
        const eventItem = items.find((item) => item.id === eventId);
        if (eventItem) {
          openBookingModal(eventItem.day, null, eventItem);
        }
        return;
      }
      const column = event.target.closest(".day-column");
      if (!column) {
        return;
      }
      if (state.view === "class" && isAdminRole(state.role) && !state.selectedClassId) {
        alert("Select a class first.");
        return;
      }
      if (state.view === "room" && isAdminRole(state.role) && !state.selectedRoomId) {
        alert("Select a room first.");
        return;
      }
      const rect = column.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      const totalMinutes = (END_HOUR - START_HOUR) * 60;
      const rawMinutes = Math.max(0, Math.min(totalMinutes, (offsetY / HOUR_HEIGHT) * 60));
      const snapped = Math.round(rawMinutes / 30) * 30;
      const clamped = Math.min(snapped, totalMinutes - 30);
      const startMinutes = START_HOUR * 60 + clamped;
      const dayIndex = Number(column.dataset.day || 0);
      openBookingModal(dayIndex, startMinutes);
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!pendingBooking) {
        return;
      }

      const startValue = bookingStart ? bookingStart.value : "";
      const endValue = bookingEnd ? bookingEnd.value : "";
      const startMinutes = parseTimeInput(startValue);
      const endMinutes = parseTimeInput(endValue);

      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
        alert("End time must be after the start time.");
        return;
      }

      const targetView = pendingBooking.view || "class";
      const bookingDay = pendingBooking.day;
      const ignoreId = pendingBooking.eventId || null;
      const classId = targetView === "class" ? pendingBooking.classId : null;
      const roomId = targetView === "room" ? pendingBooking.roomId : null;

      if (targetView === "class" && isAdminRole(state.role) && !classId) {
        alert("Select a class first.");
        return;
      }
      if (targetView === "room" && isAdminRole(state.role) && !roomId) {
        alert("Select a room first.");
        return;
      }
      const conflict = getBookingConflict(
        targetView,
        bookingDay,
        startMinutes,
        endMinutes,
        ignoreId,
        classId,
        roomId
      );

      if (conflict) {
        const conflictTitle = conflict.title || "Existing booking";
        alert(
          `That time slot is already occupied (${conflictTitle}, ${conflict.start} - ${conflict.end}).`
        );
        return;
      }

      const subject = bookingSubject ? bookingSubject.value.trim() : "";
      const professor = bookingProfessor ? bookingProfessor.value.trim() : "";
      const typeValue = bookingType ? bookingType.value : "";
      const typeLabel = bookingType
        ? bookingType.options[bookingType.selectedIndex]?.text || typeValue
        : "";

      const metaParts = [];
      if (professor) {
        metaParts.push(professor);
      }
      if (typeLabel) {
        metaParts.push(typeLabel);
      }

      if (!eventsByView[targetView]) {
        eventsByView[targetView] = [];
      }

      const subjectLabel = subject || "Untitled class";
      const objectLabel = subjectLabel;
      const bookingTime = formatBookingTimeRange(startValue, endValue);
      const actor = state.userName || "User";

      if (pendingBooking.eventId) {
        const existing = eventsByView[targetView].find(
          (item) => item.id === pendingBooking.eventId
        );
        if (!existing) {
          alert("Booking not found.");
          return;
        }
        existing.day = bookingDay;
        existing.start = startValue;
        existing.end = endValue;
        existing.title = subject || "Untitled class";
        existing.meta = metaParts.join(" | ");
        existing.type = typeValue;
        existing.professor = professor;
        if (targetView === "class") {
          existing.classId = classId;
        }
        if (targetView === "room") {
          existing.roomId = roomId;
        }
        addAuditEntry("Edited", actor, objectLabel, bookingTime);
      } else {
        eventsByView[targetView].push({
          id: createEventId(),
          day: bookingDay,
          start: startValue,
          end: endValue,
          title: subject || "Untitled class",
          meta: metaParts.join(" | "),
          type: typeValue,
          professor,
          classId: targetView === "class" ? classId : null,
          roomId: targetView === "room" ? roomId : null,
        });
        addAuditEntry("Booked", actor, objectLabel, bookingTime);
      }

      closeBookingModal();
      renderEvents();
    });
  }

  if (bookingCancel) {
    bookingCancel.addEventListener("click", closeBookingModal);
  }

  if (bookingDelete) {
    bookingDelete.addEventListener("click", () => {
      if (!pendingBooking || !pendingBooking.eventId) {
        return;
      }
      const confirmed = confirm("Delete this booking?");
      if (!confirmed) {
        return;
      }
      const targetView = pendingBooking.view || "class";
      const items = eventsByView[targetView] || [];
      const index = items.findIndex((item) => item.id === pendingBooking.eventId);
      if (index === -1) {
        return;
      }
      const removed = items[index];
      const subjectLabel = removed.title || "Untitled class";
      const objectLabel = subjectLabel;
      const bookingTime = formatBookingTimeRange(removed.start, removed.end);
      const actor = state.userName || "User";
      items.splice(index, 1);
      addAuditEntry("Deleted", actor, objectLabel, bookingTime);
      closeBookingModal();
      renderEvents();
    });
  }

  if (bookingClose) {
    bookingClose.addEventListener("click", closeBookingModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener("click", (event) => {
      if (event.target === bookingModal) {
        closeBookingModal();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (filterPanel && filterToggle && !filterPanel.hasAttribute("hidden")) {
      if (!filterPanel.contains(event.target) && !filterToggle.contains(event.target)) {
        closeFilterPanel();
      }
    }

    if (userFilterPanel && userFilterToggle && !userFilterPanel.hasAttribute("hidden")) {
      if (
        !userFilterPanel.contains(event.target) &&
        !userFilterToggle.contains(event.target)
      ) {
        closeUserFilterPanel();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    closeFilterPanel();
    closeUserFilterPanel();
    closeUserModal();
    closeClassModal();
    closeRoomModal();
    closeAuditPanel();
    closeBookingModal();
  });
}

bindEvents();
updateFilterGroup();
updateWeek();
renderAuditLog();
