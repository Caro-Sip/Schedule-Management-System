function updateFilterGroup() {
  if (!filterGroupClass || !filterGroupRoom) {
    return;
  }

  const isRoom = state.view === "room";
  filterGroupClass.toggleAttribute("hidden", isRoom);
  filterGroupRoom.toggleAttribute("hidden", !isRoom);
}

function updateActiveScopeLabel() {
  let label = "";
  if (state.view === "class" && state.selectedClassId) {
    const classItem = (classDirectory || []).find(
      (item) => String(item.id) === String(state.selectedClassId)
    );
    label = classItem?.name || `Class ${state.selectedClassId}`;
  } else if (state.view === "room" && state.selectedRoomId) {
    const roomItem = (getBookingClassrooms() || []).find(
      (item) => String(item.id) === String(state.selectedRoomId)
    );
    label = roomItem?.name || getRoomShortLabel(roomItem) || `Room ${state.selectedRoomId}`;
  } else if (state.view === "teacher" && state.selectedTeacherId) {
    const teacherItem = (teacherDirectory || []).find(
      (teacher) => String(teacher.id) === String(state.selectedTeacherId)
    );
    label = teacherItem?.name || `Teacher ${state.selectedTeacherId}`;
  }

  if (activeScopeLabel) {
    activeScopeLabel.textContent = label;
    activeScopeLabel.toggleAttribute("hidden", !label);
  }
}

function updateSmartToggleState() {
  if (!smartToggle) {
    return;
  }

  const canUseSmart =
    (isTeacherRole(state.role) || isAdminRole(state.role)) &&
    state.view === "teacher" &&
    Boolean(state.currentTeacherId || state.selectedTeacherId);

  if (!canUseSmart) {
    state.smartOverlayEnabled = false;
  }

  smartToggle.toggleAttribute("hidden", !canUseSmart);
  smartToggle.setAttribute(
    "aria-pressed",
    state.smartOverlayEnabled ? "true" : "false"
  );
  smartToggle.classList.toggle("btn-primary", state.smartOverlayEnabled);
  smartToggle.classList.toggle("btn-ghost", !state.smartOverlayEnabled);
}

function getEffectiveTeacherId() {
  return state.selectedTeacherId || state.currentTeacherId || null;
}

function normalizeSmartOverlayClassIds() {
  if (!Array.isArray(state.smartOverlayClassIds)) {
    state.smartOverlayClassIds = [];
    return [];
  }

  const normalizedIds = [];
  const seenIds = new Set();

  state.smartOverlayClassIds.forEach((classId) => {
    const numericClassId = Number(classId);
    const normalizedClassId = Number.isFinite(numericClassId) ? numericClassId : classId;
    const key = String(normalizedClassId);
    if (!key || seenIds.has(key)) {
      return;
    }
    seenIds.add(key);
    normalizedIds.push(normalizedClassId);
  });

  state.smartOverlayClassIds = normalizedIds;
  return normalizedIds;
}

function renderSmartOverlayClassOptions() {
  if (!smartClassList) {
    return;
  }

  smartClassList.innerHTML = "";
  const selectedIds = new Set(normalizeSmartOverlayClassIds().map((classId) => String(classId)));
  const classes = (classDirectory || [])
    .slice()
    .sort((a, b) => {
      const nameCompare = (a.name || String(a.id)).localeCompare(b.name || String(b.id));
      if (nameCompare !== 0) {
        return nameCompare;
      }
      return String(a.id).localeCompare(String(b.id));
    });

  if (classes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No classes are available yet.";
    smartClassList.appendChild(empty);
    return;
  }

  classes.forEach((classItem) => {
    const option = document.createElement("label");
    option.className = "smart-class-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(classItem.id);
    checkbox.checked = selectedIds.has(String(classItem.id));

    const content = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = classItem.name || `Class ${classItem.id}`;

    const meta = document.createElement("div");
    meta.className = "smart-class-meta";
    meta.textContent = `ID ${classItem.id} · Year ${classItem.year || "-"} · Semester ${classItem.semester || "-"}`;

    content.appendChild(title);
    content.appendChild(meta);
    option.appendChild(checkbox);
    option.appendChild(content);

    checkbox.addEventListener("change", () => {
      const nextIds = new Set(normalizeSmartOverlayClassIds().map((classId) => String(classId)));
      if (checkbox.checked) {
        nextIds.add(String(classItem.id));
      } else {
        nextIds.delete(String(classItem.id));
      }
      state.smartOverlayClassIds = Array.from(nextIds).map((classId) => {
        const numericClassId = Number(classId);
        return Number.isFinite(numericClassId) ? numericClassId : classId;
      });
      normalizeSmartOverlayClassIds();
    });

    smartClassList.appendChild(option);
  });
}

function openSmartOverlayModal() {
  if (!smartModal) {
    return;
  }

  const teacherId = state.currentTeacherId || state.selectedTeacherId || null;
  state.smartOverlayTeacherId = teacherId;
  if (!Array.isArray(state.smartOverlayClassIds) || state.smartOverlayClassIds.length === 0) {
    if (state.selectedClassId) {
      state.smartOverlayClassIds = [state.selectedClassId];
    }
  }

  if (smartModalTitle) {
    smartModalTitle.textContent = "Smart overlay";
  }
  if (smartTeacherInput) {
    const teacherItem = (teacherDirectory || []).find(
      (teacher) => String(teacher.id) === String(teacherId)
    );
    smartTeacherInput.value = teacherItem?.name || `Teacher ${teacherId || ""}`;
  }

  renderSmartOverlayClassOptions();
  smartModal.removeAttribute("hidden");
}

function closeSmartOverlayModal() {
  if (!smartModal) {
    return;
  }

  smartModal.setAttribute("hidden", "");
}

async function applySmartOverlaySelection() {
  const teacherId = state.smartOverlayTeacherId || state.currentTeacherId || state.selectedTeacherId || null;
  const selectedClassIds = normalizeSmartOverlayClassIds();

  if (!teacherId) {
    alert("No teacher profile is available for this account.");
    return;
  }
  if (selectedClassIds.length === 0) {
    alert("Select at least one class.");
    return;
  }

  try {
    const promises = selectedClassIds.map((classId) => loadSchedulesForClass(classId));
    const results = await Promise.all(promises);
    eventsByView.class = results.flat();
  } catch (error) {
    console.error("Failed to load overlay class schedules", error);
  }

  state.smartOverlayTeacherId = teacherId;
  state.selectedTeacherId = teacherId;
  state.smartOverlayEnabled = true;
  updateSmartToggleState();
  updateActiveScopeLabel();
  renderEvents();
  closeSmartOverlayModal();
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

function syncPendingBookingClassSelection() {
  if (!pendingBooking) {
    return [];
  }

  const uniqueClassIds = [];
  const seenClassIds = new Set();

  (Array.isArray(pendingBooking.classIds) ? pendingBooking.classIds : []).forEach((classId) => {
    const normalizedClassId = String(classId);
    if (!normalizedClassId || seenClassIds.has(normalizedClassId)) {
      return;
    }
    seenClassIds.add(normalizedClassId);
    uniqueClassIds.push(classId);
  });

  pendingBooking.classIds = uniqueClassIds;
  pendingBooking.classId = uniqueClassIds.length > 0 ? uniqueClassIds[0] : null;

  return uniqueClassIds;
}

function renderBookingClassSelection() {
  if (!bookingClassSelection || !bookingClassInput || !pendingBooking || (state.view !== "room" && state.view !== "teacher")) {
    return;
  }

  const classIds = syncPendingBookingClassSelection();
  const classCatalog = getBookingClasses();

  bookingClassSelection.innerHTML = "";
  bookingClassInput.required = classIds.length === 0;
  if (classIds.length > 0) {
    bookingClassInput.dataset.classId = String(classIds[0]);
  } else {
    bookingClassInput.dataset.classId = "";
  }

  if (classIds.length === 0) {
    bookingClassSelection.setAttribute("hidden", "");
    return;
  }

  classIds.forEach((classId) => {
    const classItem = classCatalog.find((item) => String(item.id) === String(classId)) || null;
    const classLabel = getClassDisplayLabel(classItem);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "booking-class-chip";
    chip.setAttribute("aria-label", `Remove ${classLabel}`);

    const label = document.createElement("span");
    label.textContent = classLabel;

    const remove = document.createElement("span");
    remove.className = "booking-class-chip-remove";
    remove.setAttribute("aria-hidden", "true");
    remove.textContent = "×";

    chip.appendChild(label);
    chip.appendChild(remove);
    chip.addEventListener("click", () => {
      if (!pendingBooking) {
        return;
      }

      pendingBooking.classIds = (Array.isArray(pendingBooking.classIds) ? pendingBooking.classIds : []).filter(
        (selectedClassId) => String(selectedClassId) !== String(classId)
      );
      syncPendingBookingClassSelection();
      if (bookingClassInput && bookingClassInput.value === classLabel) {
        bookingClassInput.value = "";
      }
      renderBookingClassSelection();
      renderBookingClassOptions();
    });

    bookingClassSelection.appendChild(chip);
  });

  bookingClassSelection.removeAttribute("hidden");
}

function applySmartBookingMode(enabled) {
  if (!enabled) {
    return;
  }

  if (bookingClassGroup) {
    bookingClassGroup.toggleAttribute("hidden", true);
  }
  if (bookingClassInput) {
    bookingClassInput.required = false;
    bookingClassInput.value = "";
    bookingClassInput.dataset.classId = "";
  }
  if (bookingClassResults) {
    bookingClassResults.setAttribute("hidden", "");
    bookingClassResults.innerHTML = "";
  }
  if (bookingClassSelection) {
    bookingClassSelection.setAttribute("hidden", "");
    bookingClassSelection.innerHTML = "";
  }
  if (pendingBooking) {
    pendingBooking.classIds = normalizeSmartOverlayClassIds();
    pendingBooking.classId = pendingBooking.classIds.length > 0 ? pendingBooking.classIds[0] : null;
    pendingBooking.teacherId = state.smartOverlayTeacherId || state.currentTeacherId || pendingBooking.teacherId;
  }

  if (bookingProfessor) {
    const teacherCatalog = getBookingTeachers();
    const teacherItem = teacherCatalog.find(
      (teacher) => String(teacher.id) === String(state.smartOverlayTeacherId || state.currentTeacherId)
    );
    bookingProfessor.value = teacherItem ? teacherItem.name : "";
    bookingProfessor.dataset.teacherId = teacherItem ? String(teacherItem.id) : "";
  }
  if (bookingProfessorResults) {
    bookingProfessorResults.setAttribute("hidden", "");
    bookingProfessorResults.innerHTML = "";
  }
}

function openBookingModal(dayIndex, startMinutes, eventData = null, options = {}) {
  if (!bookingModal || !bookingForm) {
    return;
  }

  const isEdit = Boolean(eventData);
  const smartMode =
    Boolean(options.smartMode) &&
    !isEdit &&
    state.view === "teacher" &&
    (isTeacherRole(state.role) || isAdminRole(state.role));
  const bookingDay = isEdit ? eventData.day : dayIndex;
  const activeClassId = state.view === "class" ? getSelectedClassId() : null;
  const attachedClassIds = isEdit
    ? Array.isArray(eventData.classIds) && eventData.classIds.length > 0
      ? eventData.classIds.slice()
      : eventData.classId
        ? [eventData.classId]
        : []
    : smartMode
      ? normalizeSmartOverlayClassIds().slice()
      : activeClassId
        ? [activeClassId]
        : [];
  const resolvedClassId = isEdit
    ? eventData.classId || attachedClassIds[0] || activeClassId || null
    : smartMode
      ? normalizeSmartOverlayClassIds()[0] || activeClassId || null
      : activeClassId || null;
  const defaultTeacherId =
    !isEdit
      ? state.view === "teacher" && state.selectedTeacherId
        ? state.selectedTeacherId
        : isTeacherRole(state.role)
          ? state.currentTeacherId || null
          : null
      : null;
  const defaultCourseId =
    !isEdit && isTeacherRole(state.role) ? state.defaultCourseId || null : null;

  pendingBooking = {
    day: bookingDay,
    view: state.view,
    eventId: isEdit ? eventData.id : null,
    classId: resolvedClassId,
    classIds: attachedClassIds,
    roomId: isEdit ? eventData.roomId || null : state.selectedRoomId || null,
    classroomId: isEdit ? eventData.roomId || null : state.selectedRoomId || null,
    teacherId: isEdit ? eventData.teacherId || null : defaultTeacherId,
    courseId: isEdit ? eventData.courseId || null : defaultCourseId,
    createdBy: isEdit ? eventData.createdBy || null : state.currentUser?.id || null,
    status: isEdit ? eventData.status || "BOOKED" : "BOOKED",
    visibility: isEdit ? eventData.visibility || "VISIBLE" : "VISIBLE",
    priority: isEdit ? eventData.priority || 0 : 0,
    linkedScheduleId: isEdit ? eventData.linkedScheduleId || null : null,
    date: isEdit ? eventData.date || null : null,
    startMinutes: isEdit ? parseTimeInput(eventData.start) : startMinutes,
    endMinutes: isEdit
      ? parseTimeInput(eventData.end)
      : (() => {
        const slot = getUsualSlotForMinutes(startMinutes);
        return slot ? Math.min(slot[1], END_HOUR * 60) : Math.min(startMinutes + 60, END_HOUR * 60);
      })(),
    smartMode,
  };

  if (bookingTitle) {
    if (smartMode) {
      bookingTitle.textContent = "Smart booking";
    } else {
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
  }

  if (bookingStart) {
    bookingStart.value = isEdit ? eventData.start : minutesToTime(startMinutes);
  }
  if (bookingEnd) {
    if (isEdit) {
      bookingEnd.value = eventData.end;
    } else {
      // Default to the usual 2-hour slot that contains startMinutes (if available)
      bookingEnd.value = minutesToTime(pendingBooking.endMinutes);
    }
  }
  if (bookingRoomGroup && bookingRoomInput) {
    const showRoomPicker = state.view === "class" || state.view === "teacher";
    bookingRoomGroup.toggleAttribute("hidden", !showRoomPicker);
    bookingRoomInput.required = showRoomPicker;
    if (showRoomPicker) {
      const roomCatalog = getBookingClassrooms();
      const roomItem = roomCatalog.find((item) => item.id === pendingBooking.roomId) || null;
      bookingRoomInput.value = roomItem ? getRoomDisplayLabel(roomItem) : "";
      bookingRoomInput.dataset.roomId = roomItem ? roomItem.id : "";
      if (bookingRoomResults) {
        bookingRoomResults.setAttribute("hidden", "");
        bookingRoomResults.innerHTML = "";
      }
    } else {
      bookingRoomInput.value = "";
      bookingRoomInput.dataset.roomId = "";
      if (bookingRoomResults) {
        bookingRoomResults.setAttribute("hidden", "");
        bookingRoomResults.innerHTML = "";
      }
    }
  }
  if (bookingClassGroup && bookingClassInput) {
    const showClassPicker = state.view === "room" || (state.view === "teacher" && !smartMode);
    bookingClassGroup.toggleAttribute("hidden", !showClassPicker);
    if (showClassPicker) {
      const classCatalog = getBookingClasses();
      const classItem = classCatalog.find((item) => String(item.id) === String(resolvedClassId)) || null;
      bookingClassInput.value = classItem ? getClassDisplayLabel(classItem) : "";
      bookingClassInput.dataset.classId = classItem ? String(classItem.id) : "";
      if (bookingClassResults) {
        bookingClassResults.setAttribute("hidden", "");
        bookingClassResults.innerHTML = "";
      }
      renderBookingClassSelection();
    } else {
      bookingClassInput.required = false;
      bookingClassInput.value = "";
      bookingClassInput.dataset.classId = "";
      if (bookingClassResults) {
        bookingClassResults.setAttribute("hidden", "");
        bookingClassResults.innerHTML = "";
      }
      if (bookingClassSelection) {
        bookingClassSelection.setAttribute("hidden", "");
        bookingClassSelection.innerHTML = "";
      }
      if (smartMode) {
        const smartClassIds = normalizeSmartOverlayClassIds();
        bookingClassInput.value = smartClassIds.length > 0 ? `${smartClassIds.length} selected` : "";
        bookingClassInput.dataset.classId = smartClassIds.length > 0 ? String(smartClassIds[0]) : "";
      }
    }
  }
  if (bookingProfessor) {
    const showProfessorPicker = state.view !== "teacher";
    if (bookingProfessorGroup) {
      bookingProfessorGroup.toggleAttribute("hidden", !showProfessorPicker);
    }
    bookingProfessor.required = showProfessorPicker;

    const teacherCatalog = getBookingTeachers();
    const teacherItem = teacherCatalog.find(
      (teacher) => String(teacher.id) === String(pendingBooking.teacherId)
    );
    bookingProfessor.value = teacherItem
      ? getTeacherDisplayLabel(teacherItem)
      : isEdit
        ? String(eventData.professor || "")
        : "";
    bookingProfessor.dataset.teacherId = teacherItem ? String(teacherItem.id) : "";
    if (bookingProfessorResults) {
      bookingProfessorResults.setAttribute("hidden", "");
      bookingProfessorResults.innerHTML = "";
    }
  }
  if (bookingSubject) {
    const courseCatalog = courseDirectory || [];
    const courseItem = courseCatalog.find(
      (course) => String(course.id) === String(pendingBooking.courseId)
    );
    bookingSubject.value = courseItem
      ? courseItem.name || courseItem.code || ""
      : isEdit
        ? String(eventData.title || "")
        : "";
    bookingSubject.dataset.courseId = courseItem ? String(courseItem.id) : "";
    if (bookingSubjectResults) {
      bookingSubjectResults.setAttribute("hidden", "");
      bookingSubjectResults.innerHTML = "";
    }
    renderBookingSubjectOptions();
  }
  if (bookingType) {
    bookingType.value = resolveSelectValue(
      bookingType,
      isEdit ? eventData.type : "LECTURE",
      "LECTURE"
    );
  }

  if (bookingRecurringGroup && bookingRecurring) {
    const showRecurring = state.view === "class" && isAdminRole(state.role) && !isEdit;
    bookingRecurringGroup.toggleAttribute("hidden", !showRecurring);
    bookingRecurring.checked = false;
  }

  applySmartBookingMode(smartMode);

  if (bookingDelete) {
    bookingDelete.toggleAttribute("hidden", !isEdit);
  }
  if (bookingSubmit) {
    bookingSubmit.textContent = isEdit ? "Save" : "Book";
  }

  // Handle Details vs Edit Form visibility
  if (isEdit) {
    if (bookingForm) {
      bookingForm.setAttribute("hidden", "");
      bookingForm.classList.add("hidden");
    }
    if (bookingDetails) {
      bookingDetails.removeAttribute("hidden");
      bookingDetails.classList.remove("hidden");
    }
    if (bookingTitle) {
      bookingTitle.textContent = "Schedule Details";
    }

    // Populate details view fields
    if (detailSubject) {
      detailSubject.textContent = eventData.title || "Untitled Class";
    }
    if (detailType) {
      detailType.textContent = formatEventType(eventData.type) || "Default";
    }
    if (detailTime) {
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const dayName = dayNames[eventData.day] || "";
      const timeStr = eventData.date
        ? `${dayName}, ${formatDate(eventData.date)} · ${formatClockTime(eventData.start)} - ${formatClockTime(eventData.end)}`
        : `${dayName} · ${formatClockTime(eventData.start)} - ${formatClockTime(eventData.end)}`;
      detailTime.textContent = timeStr;
    }
    if (detailClass) {
      const eventClassIds = getEventClassIds(eventData);
      const classLabels = eventClassIds.map(classId => {
        const classItem = (classDirectory || []).find(c => String(c.id) === String(classId));
        return classItem ? (classItem.name || `Class ${classId}`) : `Class ${classId}`;
      });
      detailClass.textContent = classLabels.join(", ") || "None";
    }
    if (detailRoom) {
      const rooms = typeof getBookingClassrooms === "function" ? getBookingClassrooms() : [];
      const roomItem = (rooms || []).find((item) => String(item.id) === String(eventData.roomId));
      const roomLabel = roomItem ? (getRoomDisplayLabel(roomItem) || roomItem.name) : (eventData.roomId || "TBD");
      detailRoom.textContent = roomLabel;
    }
    if (detailProfessor) {
      detailProfessor.textContent = resolveEventTeacherLabel(eventData) || "TBD";
    }

    const canEdit = isAdminRole(state.role) || isTeacherRole(state.role);
    if (bookingEditBtn) {
      bookingEditBtn.toggleAttribute("hidden", !canEdit);
      bookingEditBtn.classList.toggle("hidden", !canEdit);
    }
  } else {
    if (bookingDetails) {
      bookingDetails.setAttribute("hidden", "");
      bookingDetails.classList.add("hidden");
    }
    if (bookingForm) {
      bookingForm.removeAttribute("hidden");
      bookingForm.classList.remove("hidden");
    }
  }

  bookingModal.removeAttribute("hidden");
  if (bookingStart && !isEdit) {
    bookingStart.focus();
  }
}

function closeBookingModal() {
  if (!bookingModal) {
    return;
  }
  bookingModal.setAttribute("hidden", "");
  if (bookingDetails) {
    bookingDetails.setAttribute("hidden", "");
    bookingDetails.classList.add("hidden");
  }
  if (bookingForm) {
    bookingForm.setAttribute("hidden", "");
    bookingForm.classList.add("hidden");
  }
  if (bookingClassInput) {
    bookingClassInput.value = "";
    bookingClassInput.dataset.classId = "";
  }
  if (bookingClassResults) {
    bookingClassResults.setAttribute("hidden", "");
    bookingClassResults.innerHTML = "";
  }
  if (bookingClassSelection) {
    bookingClassSelection.setAttribute("hidden", "");
    bookingClassSelection.innerHTML = "";
  }
  if (bookingRoomInput) {
    bookingRoomInput.value = "";
    bookingRoomInput.dataset.roomId = "";
  }
  if (bookingRoomResults) {
    bookingRoomResults.setAttribute("hidden", "");
    bookingRoomResults.innerHTML = "";
  }
  if (bookingProfessor) {
    bookingProfessor.value = "";
    bookingProfessor.dataset.teacherId = "";
  }
  if (bookingProfessorResults) {
    bookingProfessorResults.setAttribute("hidden", "");
    bookingProfessorResults.innerHTML = "";
  }
  if (bookingSubject) {
    bookingSubject.value = "";
    bookingSubject.dataset.courseId = "";
  }
  if (bookingSubjectResults) {
    bookingSubjectResults.setAttribute("hidden", "");
    bookingSubjectResults.innerHTML = "";
  }
  if (bookingRecurringGroup && bookingRecurring) {
    bookingRecurringGroup.setAttribute("hidden", "");
    bookingRecurring.checked = false;
  }
  pendingBooking = null;
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getVisibleWeekStart() {
  const today = new Date();
  const base = startOfWeek(today);
  base.setDate(base.getDate() + state.weekOffset * 7);
  return base;
}

function updateWeek() {
  const today = new Date();
  const base = getVisibleWeekStart();

  renderHeader(base, today);
  renderTimes();
  renderEvents();
  updateActiveScopeLabel();

  const label = base.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  weekSub.textContent = label;
}

function renderHeader(startDate, today) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  scheduleHeader.innerHTML = '<div class="corner">Time</div>';

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

function renderEvents() {
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
  eventsEl.style.setProperty("--grid-height", `${gridHeight}px`);
  eventsEl.style.setProperty("--hour-height", `${HOUR_HEIGHT}px`);
  eventsEl.innerHTML = "";

  const weekStart = getVisibleWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  for (let i = 0; i < 7; i += 1) {
    const column = document.createElement("div");
    column.className = "day-column";
    column.dataset.day = i.toString();
    eventsEl.appendChild(column);
  }

  const isInWeek = (eventItem) => {
    if (!eventItem.date) {
      return true;
    }

    const eventDate = new Date(eventItem.date);
    if (Number.isNaN(eventDate.getTime())) {
      return true;
    }

    return eventDate >= weekStart && eventDate < weekEnd;
  };

  ensureEventIds(state.view);
  const items = eventsByView[state.view] || [];
  let filteredItems = items.filter(isInWeek);

  if (state.view === "class") {
    const selectedClassId = getSelectedClassId();
    if (!selectedClassId) {
      return;
    }

    filteredItems = filteredItems.filter((item) => {
      const eventClassIds = getEventClassIds(item);
      return eventClassIds.some(
        (eventClassId) => String(eventClassId) === String(selectedClassId)
      );
    });
  }

  if (state.view === "room" && (isAdminRole(state.role) || isTeacherRole(state.role))) {
    if (!state.selectedRoomId) {
      return;
    }
    filteredItems = filteredItems.filter(
      (item) => String(item.roomId) === String(state.selectedRoomId)
    );
  }

  if (state.view === "teacher") {
    const effectiveTeacherId = getEffectiveTeacherId();
    if (!effectiveTeacherId) {
      filteredItems = [];
    } else {
      filteredItems = filteredItems.filter(
        (item) =>
          String(item.teacherId) === String(effectiveTeacherId) ||
          String(item.professor) === String(effectiveTeacherId)
      );
    }
  }

  let overlayItems = [];
  if (
    state.view === "teacher" &&
    (isTeacherRole(state.role) || isAdminRole(state.role)) &&
    state.smartOverlayEnabled &&
    normalizeSmartOverlayClassIds().length > 0
  ) {
    ensureEventIds("class");
    const selectedClassIds = new Set(
      normalizeSmartOverlayClassIds().map((classId) => String(classId))
    );
    const classItems = (eventsByView.class || [])
      .filter(isInWeek)
      .filter((item) => {
        const eventClassIds = getEventClassIds(item);
        return eventClassIds.some((classId) => selectedClassIds.has(String(classId)));
      });
    const baseIds = new Set(filteredItems.map((item) => item.id));
    overlayItems = classItems.filter((item) => !baseIds.has(item.id));
  }

  const renderEventItem = (eventItem, viewClass, extraClass = "") => {
    const eventDate = eventItem.date ? new Date(eventItem.date) : null;
    const dayOffset = eventDate && !Number.isNaN(eventDate.getTime())
      ? Math.floor((new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000))
      : eventItem.day;
    const column = eventsEl.querySelector(`.day-column[data-day="${dayOffset}"]`);
    if (!column) {
      return;
    }

    const eventEl = document.createElement("div");
    eventEl.className = `event ${viewClass}${extraClass ? ` ${extraClass}` : ""}`;
    if (eventItem.id) {
      eventEl.dataset.eventId = eventItem.id;
    }

    const top = minutesFromStart(eventItem.start) * (HOUR_HEIGHT / 60);
    const height =
      (minutesFromStart(eventItem.end) - minutesFromStart(eventItem.start)) *
      (HOUR_HEIGHT / 60);

    eventEl.style.top = `${top}px`;
    eventEl.style.height = `${height}px`;

    const typeLabel = formatEventType(eventItem.type);

    const header = document.createElement("div");
    header.className = "event-header";

    const title = document.createElement("strong");
    title.className = "event-title";
    title.textContent = eventItem.title || "Untitled";

    header.appendChild(title);

    if (typeLabel) {
      const typeBadge = document.createElement("span");
      typeBadge.className = "event-type";
      typeBadge.textContent = typeLabel;
      header.appendChild(typeBadge);
    }

    const roomLabel = resolveEventRoomLabel(eventItem.roomId);
    const teacherLabel = resolveEventTeacherLabel(eventItem);
    const timeRange = eventItem.start && eventItem.end ? `${eventItem.start} - ${eventItem.end}` : "";

    const details = document.createElement("div");
    details.className = "event-details";

    [
      normalizeEventValue(roomLabel),
      normalizeEventValue(timeRange),
      normalizeEventValue(teacherLabel),
    ].forEach((item) => {
      const row = document.createElement("div");
      row.className = "event-detail";

      const value = document.createElement("span");
      value.className = "event-detail-value";
      value.textContent = item;

      row.appendChild(value);
      details.appendChild(row);
    });

    eventEl.appendChild(header);
    eventEl.appendChild(details);

    column.appendChild(eventEl);
  };

  filteredItems.forEach((eventItem) => {
    renderEventItem(eventItem, state.view);
  });

  overlayItems.forEach((eventItem) => {
    renderEventItem(eventItem, "teacher", "overlay");
  });
}

function normalizeEventValue(value) {
  if (value === 0) {
    return "0";
  }
  const text = (value || "").toString().trim();
  return text || "TBD";
}

function resolveEventRoomLabel(roomId) {
  if (!roomId) {
    return "";
  }
  const rooms = typeof getBookingClassrooms === "function" ? getBookingClassrooms() : [];
  const roomItem = (rooms || []).find((item) => String(item.id) === String(roomId));
  if (roomItem) {
    return getRoomShortLabel(roomItem) || roomItem.name || String(roomId);
  }
  return String(roomId);
}

function resolveEventTeacherLabel(eventItem) {
  const teacherValue = eventItem.professor || eventItem.teacherId || "";
  if (!teacherValue) {
    return "";
  }
  const teacher = (teacherDirectory || []).find(
    (item) => String(item.id) === String(teacherValue)
  );
  if (!teacher) {
    return String(teacherValue);
  }

  if (teacher.name) {
    return teacher.name;
  }

  const teacherUser = (userDirectory || []).find(
    (user) => String(user.id) === String(teacher.userId)
  );
  return teacherUser?.name || `Teacher ${teacher.id}`;
}

function formatEventType(value) {
  const text = (value || "").toString().trim();
  if (!text) {
    return "";
  }
  return text
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function ensureEventIds(view) {
  const items = eventsByView[view] || [];
  items.forEach((eventItem) => {
    if (!eventItem.id) {
      eventItem.id = createEventId();
    }
  });
}

function normalizeBookingDateKey(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).trim();
  }

  return date.toISOString().slice(0, 10);
}

function getBookingConflict(view, day, bookingDate, startMinutes, endMinutes, ignoreId, classId, roomId, teacherId) {
  const items = eventsByView[view] || [];
  return (
    items.find((eventItem) => {
      if (ignoreId && eventItem.id === ignoreId) {
        return false;
      }
      if (eventItem.day !== day) {
        return false;
      }
      if (bookingDate && normalizeBookingDateKey(eventItem.date) !== normalizeBookingDateKey(bookingDate)) {
        return false;
      }
      if (view === "class" && classId && eventItem.classId !== classId) {
        return false;
      }
      if (view === "room" && roomId && eventItem.roomId !== roomId) {
        return false;
      }
      if (view === "teacher" && teacherId && String(eventItem.teacherId) !== String(teacherId)) {
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
  // schedule.js
}

function getTeacherBookingConflict(day, startMinutes, endMinutes, ignoreId, teacherId) {
  if (!teacherId) {
    return null;
  }
  const items = eventsByView.teacher || [];
  return (
    items.find((eventItem) => {
      if (ignoreId && eventItem.id === ignoreId) {
        return false;
      }
      if (eventItem.day !== day) {
        return false;
      }
      const eventTeacherId = eventItem.teacherId || eventItem.professor || null;
      if (String(eventTeacherId) !== String(teacherId)) {
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

function getRoomBookingConflict(day, bookingDate, startMinutes, endMinutes, ignoreId, roomId) {
  const items = [...(eventsByView.class || []), ...(eventsByView.room || [])];
  return (
    items.find((eventItem) => {
      if (!roomId || eventItem.roomId !== roomId) {
        return false;
      }
      if (ignoreId && eventItem.id === ignoreId) {
        return false;
      }
      if (eventItem.day !== day) {
        return false;
      }
      if (bookingDate && normalizeBookingDateKey(eventItem.date) !== normalizeBookingDateKey(bookingDate)) {
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

function getAvailableRoomsForBooking(day, bookingDate, startMinutes, endMinutes, ignoreId) {
  const roomCatalog = getBookingClassrooms();
  return roomCatalog.filter(
    (roomItem) => !getRoomBookingConflict(day, bookingDate, startMinutes, endMinutes, ignoreId, roomItem.id)
  );
}

function getEventClassIds(eventItem) {
  if (Array.isArray(eventItem?.classIds) && eventItem.classIds.length > 0) {
    return eventItem.classIds;
  }

  return eventItem?.classId != null ? [eventItem.classId] : [];
}

function getClassBookingConflict(day, bookingDate, startMinutes, endMinutes, ignoreId, classId) {
  const items = eventsByView.class || [];
  return (
    items.find((eventItem) => {
      if (!classId) {
        return false;
      }
      if (ignoreId && eventItem.id === ignoreId) {
        return false;
      }
      if (eventItem.day !== day) {
        return false;
      }
      if (bookingDate && normalizeBookingDateKey(eventItem.date) !== normalizeBookingDateKey(bookingDate)) {
        return false;
      }
      const eventClassIds = getEventClassIds(eventItem);
      if (!eventClassIds.some((eventClassId) => String(eventClassId) === String(classId))) {
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

function getAvailableClassesForBooking(day, bookingDate, startMinutes, endMinutes, ignoreId) {
  const classCatalog = getBookingClasses();
  return classCatalog.filter(
    (classItem) => !getClassBookingConflict(day, bookingDate, startMinutes, endMinutes, ignoreId, classItem.id)
  );
}

function renderBookingClassOptions() {
  if (
    !bookingClassGroup ||
    !bookingClassInput ||
    !bookingClassResults ||
    !pendingBooking ||
    (state.view !== "room" && state.view !== "teacher")
  ) {
    return;
  }

  const query = normalizeClassText(bookingClassInput.value);
  const startMinutes = parseTimeInput(bookingStart?.value || "");
  const endMinutes = parseTimeInput(bookingEnd?.value || "");
  const hasValidTimes =
    startMinutes !== null && endMinutes !== null && endMinutes > startMinutes;
  const bookingDate = pendingBooking.date || (() => {
    const base = startOfWeek(new Date());
    base.setDate(base.getDate() + state.weekOffset * 7 + pendingBooking.day);
    return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
  })();
  const classCatalog = hasValidTimes
    ? getAvailableClassesForBooking(pendingBooking.day, bookingDate, startMinutes, endMinutes, pendingBooking.eventId)
    : getBookingClasses();
  const filteredClasses = classCatalog.filter((classItem) => {
    if (!query) {
      return true;
    }
    const searchText = normalizeClassText(
      [classItem.id, classItem.name, getClassDisplayLabel(classItem)].filter(Boolean).join(" ")
    );
    return searchText.includes(query);
  });

  bookingClassResults.innerHTML = "";

  if (filteredClasses.length === 0) {
    const empty = document.createElement("div");
    empty.className = "room-picker-empty";
    empty.textContent = query ? "No classes match." : hasValidTimes ? "No classes available at this time." : "No classes available.";
    bookingClassResults.appendChild(empty);
    bookingClassResults.removeAttribute("hidden");
    return;
  }

  filteredClasses.forEach((classItem) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "room-picker-option";
    option.dataset.classId = String(classItem.id);
    const isSelected = Array.isArray(pendingBooking.classIds)
      ? pendingBooking.classIds.some((selectedClassId) => String(selectedClassId) === String(classItem.id))
      : false;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-pressed", isSelected ? "true" : "false");

    const label = document.createElement("span");
    label.className = "room-picker-label";
    label.textContent = getClassDisplayLabel(classItem);

    const subtext = document.createElement("span");
    subtext.className = "room-picker-subtext";
    subtext.textContent = String(classItem.id);

    option.appendChild(label);
    option.appendChild(subtext);
    option.addEventListener("click", () => {
      const currentClassIds = Array.isArray(pendingBooking.classIds) ? pendingBooking.classIds.slice() : [];
      const selectedClassIndex = currentClassIds.findIndex(
        (selectedClassId) => String(selectedClassId) === String(classItem.id)
      );

      if (selectedClassIndex === -1) {
        currentClassIds.push(classItem.id);
      } else {
        currentClassIds.splice(selectedClassIndex, 1);
      }

      pendingBooking.classIds = currentClassIds;
      syncPendingBookingClassSelection();
      bookingClassInput.value = "";
      bookingClassInput.dataset.classId = pendingBooking.classId ? String(pendingBooking.classId) : "";
      renderBookingClassSelection();
      renderBookingSubjectOptions();
      bookingClassResults.setAttribute("hidden", "");
    });

    bookingClassResults.appendChild(option);
  });

  bookingClassResults.removeAttribute("hidden");
}

function getBookingTeachers() {
  return (teacherDirectory || []).map((teacher) => {
    const teacherUser = (userDirectory || []).find(
      (user) => String(user.id) === String(teacher.userId)
    );
    return {
      id: teacher.id,
      userId: teacher.userId,
      name: teacherUser?.name || teacher.name || `Teacher ${teacher.id}`,
      role: "professor",
      department: teacher.department || "",
    };
  });
}

function getTeacherDisplayLabel(teacher) {
  if (!teacher) {
    return "";
  }

  return `${teacher.name || "Professor"} · ID ${teacher.id}`;
}

function resolveTeacherFromInput(value, availableTeachers) {
  const normalizedInput = normalizeRoomText(value);
  if (!normalizedInput) {
    return null;
  }

  const teachers = availableTeachers || getBookingTeachers();
  return (
    teachers.find((teacher) => {
      const candidates = [teacher.id, teacher.name, getTeacherDisplayLabel(teacher)]
        .filter(Boolean)
        .map((candidate) => normalizeRoomText(candidate));

      return candidates.some(
        (candidate) =>
          candidate === normalizedInput ||
          candidate.includes(normalizedInput) ||
          normalizedInput.includes(candidate)
      );
    }) || null
  );
}

function getCourseDisplayLabel(course) {
  if (!course) {
    return "";
  }

  if (course.name && course.code) {
    return `${course.name} · ${course.code}`;
  }

  return course.name || course.code || `Course ${course.id}`;
}

function resolveCourseFromInput(value, availableCourses) {
  const normalizedInput = normalizeRoomText(value);
  if (!normalizedInput) {
    return null;
  }

  const courses = availableCourses || courseDirectory || [];
  return (
    courses.find((course) => {
      const candidates = [course.id, course.name, course.code, getCourseDisplayLabel(course)]
        .filter(Boolean)
        .map((candidate) => normalizeRoomText(candidate));

      return candidates.some(
        (candidate) =>
          candidate === normalizedInput ||
          candidate.includes(normalizedInput) ||
          normalizedInput.includes(candidate)
      );
    }) || null
  );
}

function getBookingActiveTargetClassId() {
  if (Array.isArray(pendingBooking?.classIds) && pendingBooking.classIds.length > 0) {
    return pendingBooking.classIds[0];
  }
  if (state.view === "class" && state.selectedClassId) {
    return state.selectedClassId;
  }
  return null;
}

function autoselectTeacherForCourse(courseId) {
  if (!bookingProfessor || !pendingBooking) {
    return;
  }

  const classId = getBookingActiveTargetClassId();
  let matchedMapping = null;

  if (classId) {
    matchedMapping = teacherCourseDirectory.find(
      (m) => Number(m.courseId) === Number(courseId) && Number(m.classId) === Number(classId)
    );
  }

  if (!matchedMapping) {
    matchedMapping = teacherCourseDirectory.find(
      (m) => Number(m.courseId) === Number(courseId)
    );
  }

  if (matchedMapping) {
    const teacher = getBookingTeachers().find((t) => Number(t.id) === Number(matchedMapping.teacherId));
    if (teacher) {
      bookingProfessor.value = getTeacherDisplayLabel(teacher);
      bookingProfessor.dataset.teacherId = String(teacher.id);
      pendingBooking.teacherId = teacher.id;
    }
  }
}

function renderBookingProfessorOptions() {
  if (!bookingProfessor || !bookingProfessorResults || !pendingBooking) {
    return;
  }

  const query = normalizeRoomText(bookingProfessor.value);
  const teachers = getBookingTeachers();
  const filteredTeachers = teachers.filter((teacher) => {
    if (!query) {
      return true;
    }
    const searchText = normalizeRoomText(
      [teacher.id, teacher.name, getTeacherDisplayLabel(teacher)]
        .filter(Boolean)
        .join(" ")
    );
    return searchText.includes(query);
  });

  bookingProfessorResults.innerHTML = "";

  if (filteredTeachers.length === 0) {
    const empty = document.createElement("div");
    empty.className = "room-picker-empty";
    empty.textContent = query ? "No professors match." : "No professors available.";
    bookingProfessorResults.appendChild(empty);
    bookingProfessorResults.removeAttribute("hidden");
    return;
  }

  filteredTeachers.forEach((teacher) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "room-picker-option";
    option.dataset.teacherId = String(teacher.id);

    const label = document.createElement("span");
    label.className = "room-picker-label";
    label.textContent = teacher.name || `Professor ${teacher.id}`;

    const subtext = document.createElement("span");
    subtext.className = "room-picker-subtext";
    subtext.textContent = `ID ${teacher.id}`;

    option.appendChild(label);
    option.appendChild(subtext);
    option.addEventListener("click", () => {
      bookingProfessor.value = getTeacherDisplayLabel(teacher);
      bookingProfessor.dataset.teacherId = String(teacher.id);
      pendingBooking.teacherId = teacher.id;
      bookingProfessorResults.setAttribute("hidden", "");
      renderBookingSubjectOptions();
    });

    bookingProfessorResults.appendChild(option);
  });

  bookingProfessorResults.removeAttribute("hidden");
}

function renderCourseTeacherOptions() {
  if (!courseTeacher || !courseTeacherResults) {
    return;
  }

  const query = normalizeRoomText(courseTeacher.value);
  const teachers = getBookingTeachers();
  const filteredTeachers = teachers.filter((teacher) => {
    if (!query) {
      return true;
    }
    const searchText = normalizeRoomText(
      [teacher.id, teacher.name, getTeacherDisplayLabel(teacher)]
        .filter(Boolean)
        .join(" ")
    );
    return searchText.includes(query);
  });

  courseTeacherResults.innerHTML = "";

  if (filteredTeachers.length === 0) {
    const empty = document.createElement("div");
    empty.className = "room-picker-empty";
    empty.textContent = query ? "No teachers match." : "No teachers available.";
    courseTeacherResults.appendChild(empty);
    courseTeacherResults.removeAttribute("hidden");
    return;
  }

  filteredTeachers.forEach((teacher) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "room-picker-option";
    option.dataset.teacherId = String(teacher.id);

    const label = document.createElement("span");
    label.className = "room-picker-label";
    label.textContent = teacher.name || `Teacher ${teacher.id}`;

    const subtext = document.createElement("span");
    subtext.className = "room-picker-subtext";
    subtext.textContent = `ID ${teacher.id}`;

    option.appendChild(label);
    option.appendChild(subtext);
    option.addEventListener("click", () => {
      courseTeacher.value = getTeacherDisplayLabel(teacher);
      courseTeacher.dataset.teacherId = String(teacher.id);
      courseTeacherResults.setAttribute("hidden", "");
    });

    courseTeacherResults.appendChild(option);
  });

  courseTeacherResults.removeAttribute("hidden");
}

function renderBookingSubjectOptions() {
  if (!bookingSubject || !bookingSubjectResults || !pendingBooking) {
    return;
  }

  const query = normalizeRoomText(bookingSubject.value);
  const pendingClassIds = Array.isArray(pendingBooking.classIds) && pendingBooking.classIds.length > 0
    ? pendingBooking.classIds
    : state.view === "class" && state.selectedClassId
      ? [state.selectedClassId]
      : [];
  const requiresClassSelection = state.view === "room" || state.view === "teacher";
  const allowedCourseIds = pendingClassIds.length > 0
    ? pendingClassIds.reduce((intersection, classId, index) => {
      const classCourses = new Set(
        getClassCourses(classId).map((course) => Number(course.id)).filter((value) => Number.isFinite(value))
      );
      if (index === 0) {
        return classCourses;
      }
      return new Set(Array.from(intersection).filter((courseId) => classCourses.has(courseId)));
    }, new Set())
    : requiresClassSelection
      ? new Set()
      : null;
  const coursesTaughtByTeacher = pendingBooking.teacherId
    ? new Set(
        (teacherCourseDirectory || [])
          .filter((m) => Number(m.teacherId) === Number(pendingBooking.teacherId))
          .map((m) => Number(m.courseId))
      )
    : null;

  const courses = (courseDirectory || []).filter((course) => {
    if (coursesTaughtByTeacher && !coursesTaughtByTeacher.has(Number(course.id))) {
      return false;
    }

    if (!allowedCourseIds) {
      return true;
    }

    if (allowedCourseIds.size === 0) {
      return false;
    }

    return allowedCourseIds.has(Number(course.id));
  });
  const filteredCourses = courses.filter((course) => {
    if (!query) {
      return true;
    }
    const searchText = normalizeRoomText(
      [course.id, course.name, course.code, getCourseDisplayLabel(course)]
        .filter(Boolean)
        .join(" ")
    );
    return searchText.includes(query);
  });

  bookingSubjectResults.innerHTML = "";

  if (filteredCourses.length === 0) {
    const empty = document.createElement("div");
    empty.className = "room-picker-empty";
    empty.textContent = query ? "No subjects match." : "No subjects available.";
    bookingSubjectResults.appendChild(empty);
    bookingSubjectResults.removeAttribute("hidden");
    return;
  }

  filteredCourses.forEach((course) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "room-picker-option";
    option.dataset.courseId = String(course.id);

    const label = document.createElement("span");
    label.className = "room-picker-label";
    label.textContent = getCourseDisplayLabel(course);

    const subtext = document.createElement("span");
    subtext.className = "room-picker-subtext";
    subtext.textContent = `ID ${course.id}`;

    option.appendChild(label);
    option.appendChild(subtext);
    option.addEventListener("click", () => {
      bookingSubject.value = course.name || course.code || getCourseDisplayLabel(course);
      bookingSubject.dataset.courseId = String(course.id);
      pendingBooking.courseId = course.id;
      bookingSubjectResults.setAttribute("hidden", "");
      autoselectTeacherForCourse(course.id);
    });

    bookingSubjectResults.appendChild(option);
  });

  bookingSubjectResults.removeAttribute("hidden");
}

function resolveRoomFromInput(roomInputValue, availableRooms) {
  const normalizedInput = normalizeRoomText(roomInputValue);
  if (!normalizedInput) {
    return null;
  }

  const rooms = availableRooms || roomDirectory;
  return (
    rooms.find((roomItem) => {
      const candidates = [
        roomItem.id,
        roomItem.name,
        roomItem.building,
        getRoomShortLabel(roomItem),
        getRoomDisplayLabel(roomItem),
      ]
        .filter(Boolean)
        .map((candidate) => normalizeRoomText(candidate));

      return candidates.some(
        (candidate) =>
          candidate === normalizedInput ||
          candidate.includes(normalizedInput) ||
          normalizedInput.includes(candidate)
      );
    }) || null
  );
}

function renderBookingRoomOptions() {
  if (
    !bookingRoomGroup ||
    !bookingRoomInput ||
    !bookingRoomResults ||
    !pendingBooking ||
    (state.view !== "class" && state.view !== "teacher")
  ) {
    return;
  }

  const startMinutes = parseTimeInput(bookingStart?.value || "");
  const endMinutes = parseTimeInput(bookingEnd?.value || "");
  const hasValidTimes =
    startMinutes !== null && endMinutes !== null && endMinutes > startMinutes;

  const query = normalizeRoomText(bookingRoomInput.value);
  const availableRooms = hasValidTimes
    ? getAvailableRoomsForBooking(
      pendingBooking.day,
      startMinutes,
      endMinutes,
      pendingBooking.eventId
    )
    : getBookingClassrooms();
  const filteredRooms = availableRooms.filter((roomItem) => {
    if (!query) {
      return true;
    }
    const searchText = normalizeRoomText(
      [roomItem.id, roomItem.name, roomItem.building, getRoomShortLabel(roomItem), getRoomDisplayLabel(roomItem)]
        .filter(Boolean)
        .join(" ")
    );
    return searchText.includes(query);
  });

  bookingRoomResults.innerHTML = "";

  if (filteredRooms.length === 0) {
    const empty = document.createElement("div");
    empty.className = "room-picker-empty";
    empty.textContent = query ? "No available rooms match." : "No available rooms at this time.";
    bookingRoomResults.appendChild(empty);
    bookingRoomResults.removeAttribute("hidden");
    return;
  }

  filteredRooms.forEach((roomItem) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "room-picker-option";
    option.dataset.roomId = roomItem.id;

    const label = document.createElement("span");
    label.className = "room-picker-label";
    label.textContent = getRoomDisplayLabel(roomItem);

    const subtext = document.createElement("span");
    subtext.className = "room-picker-subtext";
    subtext.textContent = roomItem.id;

    option.appendChild(label);
    option.appendChild(subtext);
    option.addEventListener("click", () => {
      bookingRoomInput.value = getRoomDisplayLabel(roomItem);
      bookingRoomInput.dataset.roomId = roomItem.id;
      pendingBooking.roomId = roomItem.id;
      bookingRoomResults.setAttribute("hidden", "");
    });

    bookingRoomResults.appendChild(option);
  });

  bookingRoomResults.removeAttribute("hidden");
}
