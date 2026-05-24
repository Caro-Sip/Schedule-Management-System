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

function openBookingModal(dayIndex, startMinutes, eventData = null) {
  if (!bookingModal || !bookingForm) {
    return;
  }

  const isEdit = Boolean(eventData);
  const bookingDay = isEdit ? eventData.day : dayIndex;
  const activeClassId = getSelectedClassId();
  const attachedClassIds = isEdit
    ? Array.isArray(eventData.classIds) && eventData.classIds.length > 0
      ? eventData.classIds.slice()
      : eventData.classId
        ? [eventData.classId]
        : []
    : activeClassId
      ? [activeClassId]
      : [];
  const resolvedClassId = isEdit
    ? eventData.classId || attachedClassIds[0] || activeClassId || null
    : activeClassId || null;

  pendingBooking = {
    day: bookingDay,
    view: state.view,
    eventId: isEdit ? eventData.id : null,
    classId: resolvedClassId,
    classIds: attachedClassIds,
    roomId: isEdit ? eventData.roomId || null : state.selectedRoomId || null,
    classroomId: isEdit ? eventData.roomId || null : state.selectedRoomId || null,
    teacherId: isEdit ? eventData.teacherId || null : null,
    courseId: isEdit ? eventData.courseId || null : null,
    createdBy: isEdit ? eventData.createdBy || null : null,
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
      // Default to the usual 2-hour slot that contains startMinutes (if available)
      bookingEnd.value = minutesToTime(pendingBooking.endMinutes);
    }
  }
  if (bookingRoomGroup && bookingRoomInput) {
    const showRoomPicker = state.view === "class";
    bookingRoomGroup.toggleAttribute("hidden", !showRoomPicker);
    bookingRoomInput.required = showRoomPicker;
    if (showRoomPicker) {
      const roomCatalog = getBookingClassrooms();
      const roomItem = roomCatalog.find((item) => item.id === pendingBooking.roomId) || null;
      bookingRoomInput.value = roomItem ? getRoomDisplayLabel(roomItem) : "";
      bookingRoomInput.dataset.roomId = roomItem ? roomItem.id : "";
      renderBookingRoomOptions();
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
    const showClassPicker = state.view === "room";
    bookingClassGroup.toggleAttribute("hidden", !showClassPicker);
    bookingClassInput.required = showClassPicker;
    if (showClassPicker) {
      const classCatalog = getBookingClasses();
      const classItem = classCatalog.find((item) => String(item.id) === String(resolvedClassId)) || null;
      bookingClassInput.value = classItem ? getClassDisplayLabel(classItem) : "";
      bookingClassInput.dataset.classId = classItem ? String(classItem.id) : "";
      renderBookingClassOptions();
    } else {
      bookingClassInput.value = "";
      bookingClassInput.dataset.classId = "";
      if (bookingClassResults) {
        bookingClassResults.setAttribute("hidden", "");
        bookingClassResults.innerHTML = "";
      }
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
  if (bookingClassInput) {
    bookingClassInput.value = "";
    bookingClassInput.dataset.classId = "";
  }
  if (bookingClassResults) {
    bookingClassResults.setAttribute("hidden", "");
    bookingClassResults.innerHTML = "";
  }
  if (bookingRoomInput) {
    bookingRoomInput.value = "";
    bookingRoomInput.dataset.roomId = "";
  }
  if (bookingRoomResults) {
    bookingRoomResults.setAttribute("hidden", "");
    bookingRoomResults.innerHTML = "";
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
    filteredItems = items.filter((item) => {
      if (Array.isArray(item.classIds) && item.classIds.length > 0) {
        return item.classIds.includes(state.selectedClassId);
      }
      return item.classId === state.selectedClassId;
    });
  }

  if (state.view === "room" && isAdminRole(state.role)) {
    if (!state.selectedRoomId) {
      return;
    }
    filteredItems = items.filter(
      (item) => String(item.roomId) === String(state.selectedRoomId)
    );
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

function getRoomBookingConflict(day, startMinutes, endMinutes, ignoreId, roomId) {
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
      const eventStart = parseTimeInput(eventItem.start);
      const eventEnd = parseTimeInput(eventItem.end);
      if (eventStart === null || eventEnd === null) {
        return false;
      }
      return startMinutes < eventEnd && endMinutes > eventStart;
    }) || null
  );
}

function getAvailableRoomsForBooking(day, startMinutes, endMinutes, ignoreId) {
  const roomCatalog = getBookingClassrooms();
  return roomCatalog.filter(
    (roomItem) => !getRoomBookingConflict(day, startMinutes, endMinutes, ignoreId, roomItem.id)
  );
}

function renderBookingClassOptions() {
  if (
    !bookingClassGroup ||
    !bookingClassInput ||
    !bookingClassResults ||
    !pendingBooking ||
    state.view !== "room"
  ) {
    return;
  }

  const query = normalizeClassText(bookingClassInput.value);
  const classCatalog = getBookingClasses();
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
    empty.textContent = query ? "No classes match." : "No classes available.";
    bookingClassResults.appendChild(empty);
    bookingClassResults.removeAttribute("hidden");
    return;
  }

  filteredClasses.forEach((classItem) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "room-picker-option";
    option.dataset.classId = String(classItem.id);

    const label = document.createElement("span");
    label.className = "room-picker-label";
    label.textContent = getClassDisplayLabel(classItem);

    const subtext = document.createElement("span");
    subtext.className = "room-picker-subtext";
    subtext.textContent = String(classItem.id);

    option.appendChild(label);
    option.appendChild(subtext);
    option.addEventListener("click", () => {
      bookingClassInput.value = getClassDisplayLabel(classItem);
      bookingClassInput.dataset.classId = String(classItem.id);
      pendingBooking.classId = classItem.id;
      pendingBooking.classIds = [classItem.id];
      bookingClassResults.setAttribute("hidden", "");
    });

    bookingClassResults.appendChild(option);
  });

  bookingClassResults.removeAttribute("hidden");
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
    state.view !== "class"
  ) {
    return;
  }

  const startMinutes = parseTimeInput(bookingStart?.value || "");
  const endMinutes = parseTimeInput(bookingEnd?.value || "");
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    bookingRoomResults.setAttribute("hidden", "");
    bookingRoomResults.innerHTML = "";
    return;
  }

  const query = normalizeRoomText(bookingRoomInput.value);
  const availableRooms = getAvailableRoomsForBooking(
    pendingBooking.day,
    startMinutes,
    endMinutes,
    pendingBooking.eventId
  );
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
