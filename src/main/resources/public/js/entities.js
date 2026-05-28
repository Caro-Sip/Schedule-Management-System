const loginView = document.getElementById("login-view");
const scheduleView = document.getElementById("schedule-view");
const guestLoginBtn = document.getElementById("guest-login");
const loginForm = document.getElementById("login-form");
const backToLogin = document.getElementById("back-to-login");
const scheduleTabs = document.getElementById("schedule-tabs");
const teacherTab = document.getElementById("teacher-tab");
const userTab = document.getElementById("user-tab");
const auditTab = document.getElementById("audit-tab");
const guestNote = document.getElementById("guest-note");
const welcomeLine = document.getElementById("welcome-line");
const scheduleControls = document.getElementById("schedule-controls");
const backToListBtn = document.getElementById("back-to-list");
const scheduleCard = document.getElementById("schedule-card");
const userControls = document.getElementById("user-controls");
const userView = document.getElementById("user-view");
const auditView = document.getElementById("audit-view");
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
const userEmailInput = document.getElementById("user-email");
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
const classYearInput = document.getElementById("class-year");
const classSemesterInput = document.getElementById("class-semester");
const classStartDateInput = document.getElementById("class-start-date");
const classEndDateInput = document.getElementById("class-end-date");
const classDeleteBtn = document.getElementById("class-delete");
const classCancelBtn = document.getElementById("class-cancel");
const classCloseBtn = document.getElementById("class-close");
const courseModal = document.getElementById("course-modal");
const courseModalTitle = document.getElementById("course-modal-title");
const courseModalClassLabel = document.getElementById("course-modal-class-label");
const courseList = document.getElementById("course-list");
const courseForm = document.getElementById("course-form");
const courseNameInput = document.getElementById("course-name");
const courseCodeInput = document.getElementById("course-code");
const courseHoursInput = document.getElementById("course-hours");
const courseDeleteBtn = document.getElementById("course-delete");
const courseCancelBtn = document.getElementById("course-cancel");
const courseCloseBtn = document.getElementById("course-close");
const courseNewBtn = document.getElementById("course-new");
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
const scheduleSearch = document.getElementById("schedule-search");
const filterGroupClass = document.querySelector('[data-filter-group="class"]');
const filterGroupRoom = document.querySelector('[data-filter-group="room"]');
const bookingModal = document.getElementById("booking-modal");
const bookingTitle = document.getElementById("booking-title");
const bookingForm = document.getElementById("booking-form");
const bookingStart = document.getElementById("booking-start");
const bookingEnd = document.getElementById("booking-end");
const bookingClassGroup = document.getElementById("booking-class-group");
const bookingClassInput = document.getElementById("booking-class");
const bookingClassResults = document.getElementById("booking-class-results");
const bookingClassSelection = document.getElementById("booking-class-selection");
const bookingRoomGroup = document.getElementById("booking-room-group");
const bookingRoomInput = document.getElementById("booking-room");
const bookingRoomResults = document.getElementById("booking-room-results");
const bookingProfessorGroup = document.getElementById("booking-professor-group");
const bookingProfessor = document.getElementById("booking-professor");
const bookingProfessorResults = document.getElementById("booking-professor-results");
const bookingSubjectGroup = document.getElementById("booking-subject-group");
const bookingSubject = document.getElementById("booking-subject");
const bookingSubjectResults = document.getElementById("booking-subject-results");
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
const scheduleHeader = document.getElementById("schedule-header");
const timeColumn = document.getElementById("time-column");
const eventsEl = document.getElementById("events");
const weekSub = document.getElementById("week-sub");
const activeScopeLabel = document.getElementById("active-scope-label");
const prevWeekBtn = document.getElementById("prev-week");
const nextWeekBtn = document.getElementById("next-week");
const todayBtn = document.getElementById("today-btn");

const API_BASE = "/api";
const ADMIN_API_BASE = `${API_BASE}/admin`;

async function requestJson(path, options = {}) {
	const token = typeof getAuthToken === "function" ? getAuthToken() : null;
	const headers = {
		"Content-Type": "application/json",
		...(options.headers || {}),
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(path, {
		headers,
		...options,
	});

	if (response.status === 204) {
		return null;
	}

	const contentType = response.headers.get("content-type") || "";
	const isJson = contentType.includes("application/json");
	const payload = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		if (response.status === 401 && !String(path).includes("/auth/login")) {
			if (typeof showLogin === "function") {
				showLogin();
			}
		}
		if (response.status === 403) {
			throw new Error("Not authorized for this action");
		}
		const message =
			typeof payload === "object" && payload && payload.error
				? payload.error
				: response.statusText || "Request failed";
		throw new Error(message);
	}

	return payload;
}

async function loginApi(email, password) {
	return requestJson(`${API_BASE}/auth/login`, {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
}

async function getCurrentUserApi() {
	return requestJson(`${API_BASE}/auth/me`);
}

function normalizeClassPayload(payload) {
	const timestamp = new Date().toISOString();
	return {
		id: Number(payload.id),
		name: payload.name || "",
		year: Number(payload.year),
		semester: payload.semester ? Number(payload.semester) : null,
		startDate: payload.startDate || payload.start_date || null,
		endDate: payload.endDate || payload.end_date || null,
		createdBy: Number(payload.createdBy),
		lastModified: timestamp,
	};
}

function normalizeUserPayload(payload) {
	return {
		id: Number(payload.id),
		name: payload.name || "",
		email: payload.email || "",
		role: payload.role || "guest",
		department: payload.department || "",
		classId: payload.classId ?? payload.class_id ?? payload.classID ?? null,
		lastModified: payload.lastModified || payload.last_modified || new Date().toISOString(),
	};
}

async function loadClasses() {
	try {
		const classes = await requestJson(`${API_BASE}/classes`);
		classDirectory.length = 0;
		classes.forEach((item) => {
			classDirectory.push(normalizeClassPayload(item));
		});

		if (
			state.selectedClassId &&
			!classDirectory.some((item) => item.id === state.selectedClassId)
		) {
			state.selectedClassId = null;
			updateViewVisibility();
		}

		renderClassList();
		renderEvents();
	} catch (error) {
		console.error("Failed to load classes", error);
	}
}

async function createClassApi(payload) {
	return requestJson(`${API_BASE}/classes`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

async function loadUsers() {
	try {
		const users = await requestJson(`${ADMIN_API_BASE}/users`);
		userDirectory.length = 0;
		users.forEach((item) => {
			userDirectory.push(normalizeUserPayload(item));
		});
		if (state.view === "user") {
			renderUserList();
		}
	} catch (error) {
		console.error("Failed to load users", error);
	}
}

async function loadTeachers() {
	try {
		const teachers = await requestJson(`${API_BASE}/teachers`);
		teacherDirectory.length = 0;
		(teachers || []).forEach((teacher) => {
			teacherDirectory.push({
				id: Number(teacher.id),
				userId: Number(teacher.userId ?? teacher.user_id),
				department: teacher.department || "",
			});
		});
	} catch (error) {
		console.error("Failed to load teachers", error);
	}
}

function updateDepartmentSelectOptions(selectEl, departments, includeAllOption = false) {
	if (!selectEl) {
		return;
	}

	const previousValue = selectEl.value;
	selectEl.innerHTML = "";

	if (includeAllOption) {
		const option = document.createElement("option");
		option.value = "";
		option.textContent = "All departments";
		selectEl.appendChild(option);
	} else {
		const placeholder = document.createElement("option");
		placeholder.value = "";
		placeholder.textContent = "Select a department";
		placeholder.disabled = true;
		placeholder.selected = true;
		selectEl.appendChild(placeholder);
	}

	departments.forEach((department) => {
		const option = document.createElement("option");
		option.value = department;
		option.textContent = department;
		selectEl.appendChild(option);
	});

	const fallbackValue = "";
	selectEl.value = resolveSelectValue(selectEl, previousValue, fallbackValue);
}

function applyDepartmentOptions() {
	if (!teacherDepartmentDirectory || teacherDepartmentDirectory.length === 0) {
		return;
	}

	const uniqueDepartments = Array.from(
		new Set(
			teacherDepartmentDirectory
				.map((department) => (department || "").toString().trim())
				.filter(Boolean)
		)
	).sort((a, b) => a.localeCompare(b));

	if (uniqueDepartments.length === 0) {
		return;
	}

	updateDepartmentSelectOptions(userDepartmentInput, uniqueDepartments);
	updateDepartmentSelectOptions(userFilterDepartment, uniqueDepartments, true);
}

async function loadTeacherDepartments() {
	try {
		const departments = await requestJson(`${API_BASE}/teachers/departments`);
		if (!Array.isArray(departments)) {
			return;
		}
		teacherDepartmentDirectory.length = 0;
		departments.forEach((department) => {
			const trimmed = (department || "").toString().trim();
			if (trimmed) {
				teacherDepartmentDirectory.push(trimmed);
			}
		});
		applyDepartmentOptions();
	} catch (error) {
		console.error("Failed to load teacher departments", error);
	}
}

async function createUserApi(payload) {
	return requestJson(`${ADMIN_API_BASE}/users`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

async function updateUserApi(id, payload) {
	return requestJson(`${ADMIN_API_BASE}/users/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

async function deleteUserApi(id) {
	return requestJson(`${ADMIN_API_BASE}/users/${id}`, {
		method: "DELETE",
	});
}

function normalizeClassroomPayload(payload) {
	const existingRoom = roomDirectory.find(
		(item) => String(item.id) === String(payload.id)
	);
	const timestamp = new Date().toISOString();
	return {
		id: Number(payload.id),
		name: payload.name || "",
		building: payload.building || "",
		floor: payload.floor || existingRoom?.floor || getRoomFloorLabel(payload),
		lastModified:
			payload.lastModified || payload.last_modified || existingRoom?.lastModified || timestamp,
	};
}

function normalizeCoursePayload(payload) {
	return {
		id: Number(payload.id),
		name: payload.name || "",
		code: payload.code || "",
		totalHours: Number(payload.totalHours ?? payload.total_hours ?? 0),
	};
}

async function loadClassrooms() {
	try {
		const classrooms = await requestJson(`${API_BASE}/classrooms`);
		classroomDirectory.length = 0;
		classrooms.forEach((item) => {
			classroomDirectory.push(normalizeClassroomPayload(item));
		});
	} catch (error) {
		console.error("Failed to load classrooms", error);
	}
}

async function createClassroomApi(payload) {
	return requestJson(`${API_BASE}/classrooms`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

async function updateClassroomApi(id, payload) {
	return requestJson(`${API_BASE}/classrooms/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

async function deleteClassroomApi(id) {
	return requestJson(`${API_BASE}/classrooms/${id}`, {
		method: "DELETE",
	});
}

async function loadCourses() {
	try {
		const courses = await requestJson(`${API_BASE}/courses`);
		courseDirectory.length = 0;
		courses.forEach((item) => {
			courseDirectory.push(normalizeCoursePayload(item));
		});
		if (typeof refreshCourseModal === "function") {
			refreshCourseModal();
		}
	} catch (error) {
		console.error("Failed to load courses", error);
	}
}

async function createCourseApi(payload) {
	return requestJson(`${API_BASE}/courses`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

async function updateCourseApi(id, payload) {
	return requestJson(`${API_BASE}/courses/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

async function deleteCourseApi(id) {
	return requestJson(`${API_BASE}/courses/${id}`, {
		method: "DELETE",
	});
}

async function loadSchedules() {
	try {
		const schedules = await requestJson(`${API_BASE}/schedules`);
		// reset events
		eventsByView.class = [];
		eventsByView.room = [];
		eventsByView.teacher = [];

		schedules.forEach((s) => {
			const event = buildScheduleEvent(s);
			if (!event) return;
			eventsByView.class.push(event);
			eventsByView.room.push(Object.assign({}, event));
			eventsByView.teacher.push(Object.assign({}, event));
		});

		renderEvents();
	} catch (error) {
		console.error("Failed to load schedules", error);
	}
}

async function refreshSchedules() {
	await loadSchedules();
	renderCurrentView();
}

function buildScheduleEvent(schedule, overrides = {}) {
	const date = new Date(overrides.date || schedule.date);
	if (isNaN(date.getTime())) return null;
	const day = date.getDay();
	const dayIndex = day === 0 ? 6 : day - 1; // Monday=0
	const start = overrides.start || schedule.startTime || schedule.start_time || schedule.start;
	const end = overrides.end || schedule.endTime || schedule.end_time || schedule.end;
	const classIds = Array.isArray(overrides.classIds)
		? overrides.classIds
		: Array.isArray(schedule.classIds)
			? schedule.classIds.map((value) => Number(value)).filter((value) => !Number.isNaN(value))
			: [];
	const title = overrides.title || schedule.title || `Course ${schedule.courseId}`;
	const metaParts = [];
	const teacherId = overrides.teacherId !== undefined ? overrides.teacherId : schedule.teacherId;
	const classroomId = overrides.classroomId !== undefined ? overrides.classroomId : schedule.classroomId;
	if (teacherId) metaParts.push(`T:${teacherId}`);
	if (classroomId) metaParts.push(`R:${classroomId}`);
	const meta = overrides.meta || metaParts.join(" | ");

	return {
		id: String(schedule.id),
		day: dayIndex,
		date: schedule.date,
		start: start || "",
		end: end || "",
		title,
		meta,
		type: overrides.type || schedule.type || "",
		professor: teacherId || null,
		teacherId: teacherId || null,
		courseId: overrides.courseId !== undefined ? overrides.courseId : schedule.courseId || null,
		createdBy: overrides.createdBy !== undefined ? overrides.createdBy : schedule.createdBy || null,
		status: overrides.status || schedule.status || "",
		visibility: overrides.visibility || schedule.visibility || "",
		priority: overrides.priority !== undefined ? overrides.priority : schedule.priority || 0,
		linkedScheduleId:
			overrides.linkedScheduleId !== undefined ? overrides.linkedScheduleId : schedule.linkedScheduleId || null,
		classId: classIds.length === 1 ? classIds[0] : null,
		classIds,
		roomId: classroomId || null,
	};
}

function updateSavedSchedule(savedSchedule, overrides = {}) {
	const nextEvent = buildScheduleEvent(savedSchedule, overrides);
	if (!nextEvent) {
		return;
	}

	["class", "room", "teacher"].forEach((view) => {
		const items = eventsByView[view] || [];
		const index = items.findIndex((item) => item.id === nextEvent.id);
		if (index !== -1) {
			items[index] = Object.assign({}, items[index], nextEvent);
		}
	});
}

async function saveScheduleApi(id, payload) {
	return requestJson(`${API_BASE}/schedules`, {
		method: "POST",
		body: JSON.stringify(Object.assign({ id }, payload)),
	});
}

async function deleteScheduleApi(id) {
	return requestJson(`${API_BASE}/schedules/${id}`, {
		method: "DELETE",
	});
}

async function updateClassApi(id, payload) {
	return requestJson(`${API_BASE}/classes/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

async function deleteClassApi(id) {
	return requestJson(`${API_BASE}/classes/${id}`, {
		method: "DELETE",
	});
}

async function loadUsersIfNeeded() {
	if (userDirectory.length === 0) {
		await loadUsers();
	}
}
