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
const classYearInput = document.getElementById("class-year");
const classSemesterInput = document.getElementById("class-semester");
const classStartDateInput = document.getElementById("class-start-date");
const classEndDateInput = document.getElementById("class-end-date");
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
const bookingRoomGroup = document.getElementById("booking-room-group");
const bookingRoomInput = document.getElementById("booking-room");
const bookingRoomResults = document.getElementById("booking-room-results");
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
const scheduleHeader = document.getElementById("schedule-header");
const timeColumn = document.getElementById("time-column");
const eventsEl = document.getElementById("events");
const weekSub = document.getElementById("week-sub");
const prevWeekBtn = document.getElementById("prev-week");
const nextWeekBtn = document.getElementById("next-week");
const todayBtn = document.getElementById("today-btn");

const API_BASE = "/api";

async function requestJson(path, options = {}) {
	const response = await fetch(path, {
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
		...options,
	});

	if (response.status === 204) {
		return null;
	}

	const contentType = response.headers.get("content-type") || "";
	const isJson = contentType.includes("application/json");
	const payload = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		const message =
			typeof payload === "object" && payload && payload.error
				? payload.error
				: response.statusText || "Request failed";
		throw new Error(message);
	}

	return payload;
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

async function loadSchedules() {
	try {
		const schedules = await requestJson(`${API_BASE}/schedules`);
		// reset events
		eventsByView.class = [];
		eventsByView.room = [];
		eventsByView.teacher = [];

		schedules.forEach((s) => {
			const date = new Date(s.date);
			if (isNaN(date.getTime())) return;
			const day = date.getDay();
			const dayIndex = day === 0 ? 6 : day - 1; // Monday=0
			const start = s.startTime || s.start_time || s.start;
			const end = s.endTime || s.end_time || s.end;
			const title = s.title || `Course ${s.courseId}`;
			const classIds = Array.isArray(s.classIds)
				? s.classIds.map((value) => Number(value)).filter((value) => !Number.isNaN(value))
				: [];
			const metaParts = [];
			if (s.teacherId) metaParts.push(`T:${s.teacherId}`);
			if (s.classroomId) metaParts.push(`R:${s.classroomId}`);
			const meta = metaParts.join(" | ");

			const event = {
				id: String(s.id),
				day: dayIndex,
				start: start || "",
				end: end || "",
				title,
				meta,
				type: s.type || "",
				professor: s.teacherId || null,
				classId: classIds.length === 1 ? classIds[0] : null,
				classIds,
				roomId: s.classroomId || null,
			};

			eventsByView.class.push(event);
			eventsByView.room.push(Object.assign({}, event));
			eventsByView.teacher.push(Object.assign({}, event));
		});

		renderEvents();
	} catch (error) {
		console.error("Failed to load schedules", error);
	}
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
