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
