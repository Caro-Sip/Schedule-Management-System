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

  if (backToListBtn) {
    backToListBtn.addEventListener("click", () => {
      if (state.view === "class") {
        state.selectedClassId = null;
      }
      if (state.view === "room") {
        state.selectedRoomId = null;
      }
      updateViewVisibility();
      renderCurrentView();
    });
  }

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
        const classId = Number(editButton.dataset.classId);
        if (Number.isNaN(classId)) {
          return;
        }
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
    classForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!classNameInput || !classYearInput) {
        return;
      }

      const name = classNameInput.value.trim();
      const yearValue = classYearInput.value;
      const year = Number(yearValue);

      if (!name || !Number.isFinite(year) || year <= 0) {
        alert("Class name and a valid year are required.");
        return;
      }

      const existing = editingClassId
        ? classDirectory.find((item) => item.id === editingClassId)
        : null;
      const createdBy = Number.isFinite(existing?.createdBy) && existing.createdBy > 0
        ? existing.createdBy
        : 1;

      const semesterValue = classSemesterInput ? Number(classSemesterInput.value) : null;
      const startDate = classStartDateInput ? classStartDateInput.value : null;
      const endDate = classEndDateInput ? classEndDateInput.value : null;

      if (!semesterValue || (semesterValue !== 1 && semesterValue !== 2)) {
        alert("Semester must be 1 or 2.");
        return;
      }

      if (!startDate || !endDate) {
        alert("Semester start and end dates are required.");
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after end date.");
        return;
      }

      const wasEditing = Boolean(editingClassId);
      const previousId = editingClassId;

      try {
        let targetId = previousId ? Number(previousId) : null;

        if (wasEditing && editingClassId) {
          await updateClassApi(editingClassId, { name, year, semester: semesterValue, startDate, endDate, createdBy });
          addAuditEntry("Edited class", state.userName || "User", name, "", {
            scopeType: "class",
            scopeId: editingClassId,
          });
        } else {
          const created = await createClassApi({ name, year, semester: semesterValue, startDate, endDate, createdBy });
          targetId = created?.id ? Number(created.id) : null;
          addAuditEntry("Added class", state.userName || "User", name, "", {
            scopeType: "class",
            scopeId: targetId,
          });
        }

        await loadClasses();
        closeClassModal();

        if (targetId && (!wasEditing || state.selectedClassId === targetId)) {
          selectClass(targetId);
        }
      } catch (error) {
        alert(error?.message || "Failed to save class.");
      }
    });
  }

  if (classDeleteBtn) {
    classDeleteBtn.addEventListener("click", async () => {
      if (!editingClassId) {
        return;
      }
      const confirmed = confirm("Delete this class?");
      if (!confirmed) {
        return;
      }
      const removed = classDirectory.find((item) => item.id === editingClassId) || null;

      try {
        await deleteClassApi(editingClassId);
        if (removed) {
          const actor = state.userName || "User";
          addAuditEntry("Deleted class", actor, removed.name, "", {
            scopeType: "class",
            scopeId: removed.id,
          });
        }
        closeClassModal();
        await loadClasses();
      } catch (error) {
        alert(error?.message || "Failed to delete class.");
      }
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
      addAuditEntry("Deleted room", actor, removed.name, "", {
        scopeType: "room",
        scopeId: removed.id,
      });
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
      const absoluteClicked = START_HOUR * 60 + rawMinutes;
      // Map the clicked time to the usual two-hour slot (7-9,9-11,11-1,1-3,3-5)
      const slot = getUsualSlotForMinutes(absoluteClicked);
      const startMinutes = slot ? slot[0] : START_HOUR * 60 + Math.min(rawMinutes, totalMinutes - 30);
      const dayIndex = Number(column.dataset.day || 0);
      openBookingModal(dayIndex, startMinutes);
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
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
      const activeClassId = getSelectedClassId();
      const roomSelectedClassId = bookingClassInput?.dataset.classId || pendingBooking.classId || "";
      const classId =
        targetView === "class"
          ? pendingBooking.classId || pendingBooking.classIds?.[0] || activeClassId || null
          : targetView === "room"
            ? roomSelectedClassId || pendingBooking.classId || pendingBooking.classIds?.[0] || null
            : null;
      let classroomId = targetView === "room" ? pendingBooking.roomId : null;
      let roomLabel = "";

      const roomCatalog = getBookingClassrooms();

      if (targetView === "class") {
        const availableRooms = getAvailableRoomsForBooking(
          bookingDay,
          startMinutes,
          endMinutes,
          ignoreId
        );
        const roomInputValue = bookingRoomInput ? bookingRoomInput.value.trim() : "";
        const selectedRoomId = bookingRoomInput?.dataset.roomId || pendingBooking.roomId || "";
        const selectedRoom =
          availableRooms.find((roomItem) => String(roomItem.id) === String(selectedRoomId)) ||
          resolveClassroomFromInput(roomInputValue, availableRooms);
        classroomId = selectedRoom ? selectedRoom.id : null;
        roomLabel = selectedRoom ? getRoomDisplayLabel(selectedRoom) : "";
      } else if (targetView === "room") {
        const selectedRoom =
          roomCatalog.find((roomItem) => String(roomItem.id) === String(pendingBooking.roomId)) ||
          resolveClassroomFromInput(
            roomDirectory.find((item) => item.id === pendingBooking.roomId)
              ? getRoomDisplayLabel(roomDirectory.find((item) => item.id === pendingBooking.roomId))
              : pendingBooking.roomId,
            roomCatalog
          );
        classroomId = selectedRoom ? selectedRoom.id : classroomId;
        roomLabel = selectedRoom ? getRoomDisplayLabel(selectedRoom) : roomLabel;
      }

      if (targetView === "class" && isAdminRole(state.role) && !classId) {
        alert("Select a class first.");
        return;
      }
      if (targetView === "class" && !classroomId) {
        alert("Select a room first.");
        return;
      }
      if (targetView === "room" && isAdminRole(state.role) && !classId) {
        alert("Select a class first.");
        return;
      }
      if (targetView === "room" && isAdminRole(state.role) && !classroomId) {
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
        classroomId
      );

      const roomConflict =
        targetView === "class" && classroomId
          ? getRoomBookingConflict(bookingDay, startMinutes, endMinutes, ignoreId, classroomId)
          : null;

      if (conflict) {
        const conflictTitle = conflict.title || "Existing booking";
        alert(
          `That time slot is already occupied (${conflictTitle}, ${conflict.start} - ${conflict.end}).`
        );
        return;
      }

      if (roomConflict) {
        alert(`That room is already booked at this time (${roomLabel || roomConflict.roomId}).`);
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
      if (targetView === "class" && roomLabel) {
        metaParts.push(roomLabel);
      }

      if (!eventsByView[targetView]) {
        eventsByView[targetView] = [];
      }

      const subjectLabel = subject || "Untitled class";
      const objectLabel = subjectLabel;
      const bookingTime = formatBookingTimeRange(startValue, endValue);
      const actor = state.userName || "User";
      const auditScope =
        targetView === "class"
          ? { scopeType: "class", scopeId: classId }
          : targetView === "room"
            ? { scopeType: "room", scopeId: classroomId }
            : { scopeType: "general", scopeId: null };

      const courseId = await resolveCourseIdFromSubject(subjectLabel);
      if (!courseId) {
        alert("Select or enter a course name first.");
        return;
      }

      if (pendingBooking.eventId) {
        const payload = {
          classroomId,
          teacherId: pendingBooking.teacherId || null,
          courseId,
          date: pendingBooking.date,
          startTime: startValue,
          endTime: endValue,
          status: pendingBooking.status || "BOOKED",
          visibility: pendingBooking.visibility || "VISIBLE",
          type: typeValue || pendingBooking.type || "DEFAULT",
          priority: pendingBooking.priority ?? 0,
          createdBy: pendingBooking.createdBy || 1,
          classIds: pendingBooking.classIds && pendingBooking.classIds.length > 0
            ? pendingBooking.classIds
            : classId
              ? [classId]
              : [],
          linkedScheduleId: pendingBooking.linkedScheduleId || null,
        };

        saveScheduleApi(pendingBooking.eventId, payload)
          .then((savedSchedule) => {
            updateSavedSchedule(savedSchedule, {
              title: subject || "Untitled class",
              meta: metaParts.join(" | "),
              professor,
              type: typeValue,
              classroomId,
              teacherId: pendingBooking.teacherId || null,
              courseId,
              createdBy: pendingBooking.createdBy || 1,
              status: pendingBooking.status || "BOOKED",
              visibility: pendingBooking.visibility || "VISIBLE",
              priority: pendingBooking.priority ?? 0,
              linkedScheduleId: pendingBooking.linkedScheduleId || null,
              date: pendingBooking.date,
              classIds: payload.classIds,
            });
            addAuditEntry("Edited", actor, objectLabel, bookingTime, auditScope);
            closeBookingModal();
            renderEvents();
          })
          .catch((saveError) => {
            console.error("Failed to save schedule", saveError);
            alert(`Failed to save schedule: ${saveError.message}`);
          });
        return;
      } else {
        try {
          const base = startOfWeek(new Date());
          base.setDate(base.getDate() + state.weekOffset * 7 + bookingDay);
          const dateStr = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;

          const payload = {
            classroomId,
            teacherId: pendingBooking.teacherId || null,
            courseId,
            date: pendingBooking.date || dateStr,
            startTime: startValue,
            endTime: endValue,
            status: pendingBooking.status || "BOOKED",
            visibility: pendingBooking.visibility || "VISIBLE",
            type: typeValue || pendingBooking.type || "DEFAULT",
            priority: pendingBooking.priority ?? 0,
            createdBy: pendingBooking.createdBy || 1,
            classIds:
              pendingBooking.classIds && pendingBooking.classIds.length > 0
                ? pendingBooking.classIds
                : classId
                ? [classId]
                : [],
            linkedScheduleId: pendingBooking.linkedScheduleId || null,
          };

          const saved = await saveScheduleApi(null, payload);
          const event = buildScheduleEvent(saved);
          if (event) {
            eventsByView[targetView].push(event);
          } else {
            // Fallback to a minimal client-side event if server didn't return usable data
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
              roomId: targetView === "class" || targetView === "room" ? classroomId : null,
            });
          }

          addAuditEntry("Booked", actor, objectLabel, bookingTime, auditScope);
          closeBookingModal();
          renderEvents();
        } catch (saveError) {
          console.error("Failed to create schedule", saveError);
          alert(`Failed to create booking: ${saveError.message}`);
        }
      }
    });
  }

  if (bookingRoomInput) {
    bookingRoomInput.addEventListener("input", () => {
      if (pendingBooking) {
        pendingBooking.roomId = null;
      }
      bookingRoomInput.dataset.roomId = "";
      renderBookingRoomOptions();
    });
    bookingRoomInput.addEventListener("focus", renderBookingRoomOptions);
  }

  if (bookingClassInput) {
    bookingClassInput.addEventListener("input", () => {
      if (pendingBooking) {
        pendingBooking.classId = null;
        pendingBooking.classIds = [];
      }
      bookingClassInput.dataset.classId = "";
      renderBookingClassOptions();
    });
    bookingClassInput.addEventListener("focus", renderBookingClassOptions);
  }

  if (bookingStart) {
    bookingStart.addEventListener("input", () => {
      if (pendingBooking) {
        pendingBooking.startMinutes = parseTimeInput(bookingStart.value);
      }
      renderBookingRoomOptions();
    });
  }

  if (bookingEnd) {
    bookingEnd.addEventListener("input", () => {
      if (pendingBooking) {
        pendingBooking.endMinutes = parseTimeInput(bookingEnd.value);
      }
      renderBookingRoomOptions();
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
      const auditScope =
        targetView === "class"
          ? { scopeType: "class", scopeId: removed.classId }
          : targetView === "room"
            ? { scopeType: "room", scopeId: removed.roomId }
            : { scopeType: "general", scopeId: null };
      addAuditEntry("Deleted", actor, objectLabel, bookingTime, auditScope);
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
loadClassrooms();
loadCourses();
loadClasses();
loadSchedules();
