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

function closePickerResults(resultsEl) {
  if (!resultsEl) {
    return;
  }
  resultsEl.setAttribute("hidden", "");
}

function bindPickerAutoClose(groupEl, resultsEl) {
  if (!groupEl || !resultsEl) {
    return;
  }

  groupEl.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!groupEl.contains(document.activeElement)) {
        closePickerResults(resultsEl);
      }
    }, 0);
  });
}

function syncCurrentTeacherContext() {
    state.currentTeacherId = null;
    state.defaultCourseId = null;

    if (!isTeacherRole(state.role) || !state.currentUser) {
        return;
    }

    const matchedTeacher = (teacherDirectory || []).find(
        (teacher) => Number(teacher.userId) === Number(state.currentUser.id)
    );
    if (!matchedTeacher) {
        return;
    }

    state.currentTeacherId = matchedTeacher.id;
    const teacherEvent = (eventsByView.teacher || []).find(
        (eventItem) =>
            String(eventItem.teacherId) === String(state.currentTeacherId) &&
            eventItem.courseId
    );
    state.defaultCourseId = teacherEvent ? Number(teacherEvent.courseId) : null;

    if (typeof updateSmartToggleState === "function") {
        updateSmartToggleState();
    }
}

function syncCurrentUserDirectoryEntry() {
    if (!state.currentUser || !state.currentUser.id) {
        return;
    }

    const normalizedUser = normalizeUserPayload(state.currentUser);
    const existingIndex = userDirectory.findIndex(
        (user) => String(user.id) === String(normalizedUser.id)
    );

    if (existingIndex === -1) {
        userDirectory.push(normalizedUser);
        return;
    }

    userDirectory[existingIndex] = Object.assign(
        {},
        userDirectory[existingIndex],
        normalizedUser
    );
}


function bindEvents() {
    guestLoginBtn.addEventListener("click", () => showSchedule("guest", "Guest", false));

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const formData = new FormData(loginForm);

        const email =
            formData.get("email");

        const password =
            formData.get("password");

        try {
            if (!email || !password) {
                throw new Error("Email and password are required");
            }

            const data = await loginApi(
                email.toString().trim(),
                password.toString().trim()
            );
            const loggedInUser = normalizeUserPayload(data.user);
            applyAuthenticatedSession(data.token, loggedInUser);

            showSchedule(
                loggedInUser.role,
                loggedInUser.name
            );
            await initializeAuthenticatedApp();

        } catch (error) {

            alert(
                error.message || "Login failed"
            );
        }
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

    if (smartToggle) {
        smartToggle.addEventListener("click", () => {
            if (!isTeacherRole(state.role)) {
                return;
            }
            if (state.view !== "class" || !state.selectedClassId || !state.currentTeacherId) {
                return;
            }
            state.smartOverlayEnabled = !state.smartOverlayEnabled;
            if (typeof updateSmartToggleState === "function") {
                updateSmartToggleState();
            }
            renderEvents();
        });
    }

  if (backToListBtn) {
    backToListBtn.addEventListener("click", () => {
      if (state.userScheduleOrigin === "user") {
        state.selectedClassId = null;
        state.selectedRoomId = null;
        state.selectedTeacherId = null;
        state.userScheduleOrigin = null;
        setView("user");
        return;
      }
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
    userList.addEventListener("click", async (event) => {
      const editButton = event.target.closest(".user-edit");
      if (editButton) {
        const userId = editButton.dataset.userId;
        const user = userDirectory.find((item) => String(item.id) === String(userId));
        if (!user) {
          return;
        }
        openUserModal("edit", user);
        return;
      }

      const row = event.target.closest(".user-row");
      if (!row) {
        return;
      }
      const userId = row.dataset.userId;
      const user = userDirectory.find((item) => String(item.id) === String(userId));
      if (!user) {
        return;
      }
      if (!isAdminRole(state.role)) {
        return;
      }
      if (typeof showUserSchedule === "function") {
        await showUserSchedule(user);
      }
    });
  }

    // Toggle department field visibility when role changes
    if (userRoleInput) {
        userRoleInput.addEventListener("change", () => {
            const departmentField = document.getElementById("department-field");
            const isProfessor = userRoleInput.value === "professor";
            if (departmentField) {
                departmentField.toggleAttribute("hidden", !isProfessor);
            }
            if (userDepartmentInput) {
                if (isProfessor) {
                    userDepartmentInput.setAttribute("required", "");
                } else {
                    userDepartmentInput.removeAttribute("required");
                    userDepartmentInput.value = "";
                }
            }
        });
    }

    if (userForm) {
        userForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (
                !userNameInput ||
                !userEmailInput ||
                !userPasswordInput ||
                !userRoleInput
            ) {
                return;
            }

            const name = userNameInput.value.trim();
            const email = userEmailInput.value.trim();
            const password = userPasswordInput.value.trim();
            const role = userRoleInput.value;

            if (!name) {
                alert("Name is required.");
                return;
            }

            if (!email) {
                alert("Email is required.");
                return;
            }

            if (!editingUserId && !password) {
                alert("Password is required for new users.");
                return;
            }

            const payload = {
                name,
                email,
                role,
            };

            // Only include department for professors
            if (role === "professor" && userDepartmentInput) {
                payload.department = userDepartmentInput.value;
            }

            if (password) {
                payload.password = password;
            }

            try {
                if (editingUserId) {
                    await updateUserApi(editingUserId, payload);
                } else {
                    await createUserApi(payload);
                }
                await loadUsers();
                await loadTeacherDepartments();
                closeUserModal();
            } catch (error) {
                alert(error?.message || "Failed to save user.");
            }
        });
    }

    if (userDeleteBtn) {
        userDeleteBtn.addEventListener("click", async () => {
            if (!editingUserId) {
                return;
            }
            const confirmed = confirm("Delete this user?");
            if (!confirmed) {
                return;
            }

            try {
                await deleteUserApi(editingUserId);
                await loadUsers();
                await loadTeacherDepartments();
                closeUserModal();
            } catch (error) {
                alert(error?.message || "Failed to delete user.");
            }
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
            if (!isAdminRole(state.role)) {
                return;
            }
            openClassModal("add");
        });
    }

    if (classList) {
        classList.addEventListener("click", (event) => {
            const editButton = event.target.closest(".class-edit");
            if (editButton) {
                if (!isAdminRole(state.role)) {
                    return;
                }
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
                : Number(state.currentUser?.id || 0);

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
                    await updateClassApi(editingClassId, {
                        name,
                        year,
                        semester: semesterValue,
                        startDate,
                        endDate,
                        createdBy
                    });
                    addAuditEntry("Edited class", state.userName || "User", name, "", {
                        scopeType: "class",
                        scopeId: editingClassId,
                    });
                } else {
                    const created = await createClassApi({
                        name,
                        year,
                        semester: semesterValue,
                        startDate,
                        endDate,
                        createdBy
                    });
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

    if (courseNewBtn) {
        courseNewBtn.addEventListener("click", () => {
            clearCourseForm();
            renderCourseModalList();
            if (courseNameInput) {
                courseNameInput.focus();
            }
        });
    }

    if (courseForm) {
        courseForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!courseNameInput || !courseCodeInput || !courseHoursInput) {
                return;
            }

            const name = courseNameInput.value.trim();
            const code = courseCodeInput.value.trim();
            const totalHours = Number(courseHoursInput.value);

            if (!name || !code || !Number.isFinite(totalHours) || totalHours <= 0) {
                alert("Course name, code, and a valid number of hours are required.");
                return;
            }

            if (!courseModalClassId) {
                alert("Select a class before managing courses.");
                return;
            }

            try {
                let savedCourse = null;
                let shouldReloadClasses = false;
                if (editingCourseId) {
                    savedCourse = await updateCourseApi(editingCourseId, {
                        name,
                        code,
                        totalHours,
                    });
                } else {
                    savedCourse = await createCourseApi({
                        name,
                        code,
                        totalHours,
                    });
                    if (savedCourse?.id && typeof addCourseToClassApi === "function") {
                        await addCourseToClassApi(courseModalClassId, savedCourse.id);
                        shouldReloadClasses = true;
                    }
                }

                await loadCourses();
                if (shouldReloadClasses) {
                    await loadClasses();
                }
                if (savedCourse?.id) {
                    const matchedCourse = courseDirectory.find(
                        (course) => String(course.id) === String(savedCourse.id)
                    );
                    if (matchedCourse) {
                        selectCourseForEdit(matchedCourse);
                        return;
                    }
                }
                renderCourseModalList();
            } catch (error) {
                alert(error?.message || "Failed to save course.");
            }
        });
    }

    if (courseDeleteBtn) {
        courseDeleteBtn.addEventListener("click", async () => {
            if (!editingCourseId) {
                return;
            }

            const confirmed = confirm("Delete this course?");
            if (!confirmed) {
                return;
            }

            try {
                await deleteCourseApi(editingCourseId);
                clearCourseForm();
                await loadCourses();
                renderCourseModalList();
            } catch (error) {
                alert(error?.message || "Failed to delete course.");
            }
        });
    }

    if (courseCancelBtn) {
        courseCancelBtn.addEventListener("click", () => {
            closeCourseModal();
        });
    }

    if (courseCloseBtn) {
        courseCloseBtn.addEventListener("click", () => {
            closeCourseModal();
        });
    }

    if (courseModal) {
        courseModal.addEventListener("click", (event) => {
            if (event.target === courseModal) {
                closeCourseModal();
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
            const roomStore = typeof getBookingClassrooms === "function" ? getBookingClassrooms() : roomDirectory;
            const editButton = event.target.closest(".room-edit");
            if (editButton) {
                const roomId = editButton.dataset.roomId;
                const roomItem = roomStore.find((item) => String(item.id) === String(roomId));
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
            if (!roomNameInput || !roomBuildingInput || !roomFloorInput) {
                return;
            }

            const name = roomNameInput.value.trim();
            const building = roomBuildingInput.value.trim();
            const floor = roomFloorInput.value.trim();

            if (!name || !building || !floor) {
                alert("Room name, building, and floor are required.");
                return;
            }

            const wasEditing = Boolean(editingRoomId);
            const previousId = editingRoomId;

            const savePromise = wasEditing
                ? updateClassroomApi(previousId, {name, building})
                : createClassroomApi({name, building});

            savePromise
                .then(async (savedRoom) => {
                    const roomId = Number(savedRoom?.id || previousId);
                    upsertRoom({id: String(roomId), name, building, floor});
                    await loadClassrooms();
                    closeRoomModal();
                    renderRoomList();

                    if (!wasEditing && Number.isFinite(roomId)) {
                        selectRoom(roomId);
                    } else if (previousId && String(state.selectedRoomId) === String(previousId)) {
                        selectRoom(previousId);
                    }
                })
                .catch((error) => {
                    alert(error?.message || "Failed to save room.");
                });
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

            const roomStore = typeof getBookingClassrooms === "function" ? getBookingClassrooms() : roomDirectory;
            const actor = state.userName || "User";
            const removed = roomStore.find((item) => String(item.id) === String(editingRoomId)) || null;

            deleteClassroomApi(editingRoomId)
                .then(async () => {
                    const index = roomStore.findIndex((item) => String(item.id) === String(editingRoomId));
                    if (index !== -1) {
                        roomStore.splice(index, 1);
                    }
                    if (removed) {
                        addAuditEntry("Deleted room", actor, removed.name, "", {
                            scopeType: "room",
                            scopeId: removed.id,
                        });
                    }
                    closeRoomModal();
                    if (String(state.selectedRoomId) === String(removed?.id)) {
                        state.selectedRoomId = null;
                        updateViewVisibility();
                    }
                    await loadClassrooms();
                    renderRoomList();
                    renderEvents();
                })
                .catch((error) => {
                    alert(error?.message || "Failed to delete room.");
                });
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
            if (
                state.view === "class" &&
                (isAdminRole(state.role) || isTeacherRole(state.role)) &&
                !state.selectedClassId
            ) {
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
            const smartMode =
                state.view === "class" &&
                isTeacherRole(state.role) &&
                state.smartOverlayEnabled;
            openBookingModal(dayIndex, startMinutes, null, { smartMode });
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
            const isSmartMode = Boolean(pendingBooking.smartMode);
            const isSmartClassBooking =
                isSmartMode && targetView === "class" && isTeacherRole(state.role);
            const bookingDay = pendingBooking.day;
            const ignoreId = pendingBooking.eventId || null;
            const bookingDate = pendingBooking.date || (() => {
                const base = startOfWeek(new Date());
                base.setDate(base.getDate() + state.weekOffset * 7 + bookingDay);
                return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
            })();

            const professorInput = bookingProfessor ? bookingProfessor.value.trim() : "";
            const selectedTeacherId = bookingProfessor?.dataset.teacherId || pendingBooking.teacherId || "";
            const bookingTeacherCatalog = getBookingTeachers();
            const selectedTeacher =
                bookingTeacherCatalog.find((teacher) => String(teacher.id) === String(selectedTeacherId)) ||
                resolveTeacherFromInput(professorInput, bookingTeacherCatalog);
            const teacherId = selectedTeacher ? selectedTeacher.id : null;
            const professorLabel = selectedTeacher ? selectedTeacher.name || professorInput : professorInput;

            const activeClassId = getSelectedClassId();
            const roomSelectedClassId =
                bookingClassInput?.dataset.classId ||
                pendingBooking.classId ||
                pendingBooking.classIds?.[0] ||
                "";
            const classId =
                targetView === "class"
                    ? pendingBooking.classId || pendingBooking.classIds?.[0] || activeClassId || null
                    : (targetView === "room" || targetView === "teacher")
                        ? roomSelectedClassId || pendingBooking.classId || pendingBooking.classIds?.[0] || null
                        : null;
            let classroomId = targetView === "room" ? pendingBooking.roomId : null;
            let roomLabel = "";

            const roomCatalog = getBookingClassrooms();

            if (targetView === "class" || targetView === "teacher") {
                const availableRooms = getAvailableRoomsForBooking(
                    bookingDay,
                    bookingDate,
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

            if ((targetView === "class" || targetView === "teacher") && isAdminRole(state.role) && !classId) {
                alert("Select a class first.");
                return;
            }
            if ((targetView === "class" || targetView === "teacher") && !classroomId) {
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
                bookingDate,
                startMinutes,
                endMinutes,
                ignoreId,
                classId,
                classroomId,
                teacherId
            );

            const roomConflict =
                (targetView === "class" || targetView === "teacher") && classroomId
                    ? getRoomBookingConflict(bookingDay, bookingDate, startMinutes, endMinutes, ignoreId, classroomId)
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

            const submitTeacherCatalog = getBookingTeachers();
            const courseCatalog = courseDirectory || [];
            const subjectInput = bookingSubject ? bookingSubject.value.trim() : "";

            {
            let resolvedTeacherId = null;
            let professorLabel = "";
            let selectedCourse = null;
            let subjectLabel = "";
            let typeValue = "";
            let typeLabel = "";

            if (isSmartClassBooking) {
                resolvedTeacherId = state.currentTeacherId || null;
                const teacherItem = submitTeacherCatalog.find(
                    (teacher) => String(teacher.id) === String(resolvedTeacherId)
                );
                professorLabel = teacherItem?.name || "";
                const selectedCourseId = bookingSubject?.dataset.courseId || pendingBooking.courseId || "";
                selectedCourse =
                    courseCatalog.find((course) => String(course.id) === String(selectedCourseId)) ||
                    resolveCourseFromInput(subjectInput, courseCatalog);
                subjectLabel = selectedCourse?.name || selectedCourse?.code || subjectInput || "";
                typeValue = "DEFAULT";
                typeLabel = "Default";
            } else {
                const professorInput = bookingProfessor ? bookingProfessor.value.trim() : "";
                const selectedTeacherId = bookingProfessor?.dataset.teacherId || pendingBooking.teacherId || "";
                const selectedTeacher =
                    submitTeacherCatalog.find((teacher) => String(teacher.id) === String(selectedTeacherId)) ||
                    resolveTeacherFromInput(professorInput, submitTeacherCatalog);
                resolvedTeacherId = selectedTeacher ? selectedTeacher.id : null;
                professorLabel = selectedTeacher ? selectedTeacher.name || professorInput : professorInput;
                const selectedCourseId = bookingSubject?.dataset.courseId || pendingBooking.courseId || "";
                selectedCourse =
                    courseCatalog.find((course) => String(course.id) === String(selectedCourseId)) ||
                    resolveCourseFromInput(subjectInput, courseCatalog);
                subjectLabel =
                    selectedCourse?.name || selectedCourse?.code || subjectInput || "Untitled class";
                typeValue = bookingType ? bookingType.value : "";
                typeLabel = bookingType
                    ? bookingType.options[bookingType.selectedIndex]?.text || typeValue
                    : "";
            }

            const recurringEnabled =
                Boolean(bookingRecurring && bookingRecurring.checked) &&
                targetView === "class" &&
                isAdminRole(state.role) &&
                !pendingBooking.eventId;

            const shouldCheckTeacherConflict = isTeacherRole(state.role) && resolvedTeacherId;
            const teacherConflict = shouldCheckTeacherConflict
                ? getTeacherBookingConflict(
                    bookingDay,
                    startMinutes,
                    endMinutes,
                    ignoreId,
                    resolvedTeacherId
                )
                : null;

            if (teacherConflict) {
                alert("That time slot conflicts with your teacher schedule.");
                return;
            }

            const metaParts = [];
            if (professorLabel) {
                metaParts.push(professorLabel);
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

            const objectLabel = subjectLabel;
            const bookingTime = formatBookingTimeRange(startValue, endValue);
            const actor = state.userName || "User";
            const auditScope =
                targetView === "class"
                    ? {scopeType: "class", scopeId: classId}
                    : targetView === "room"
                        ? {scopeType: "room", scopeId: classroomId}
                        : {scopeType: "general", scopeId: null};

            let courseId = null;
            if (isSmartClassBooking) {
                courseId = selectedCourse?.id || (subjectLabel ? await resolveCourseIdFromSubject(subjectLabel) : null);
                if (!courseId) {
                    alert("Select or enter a course name first.");
                    return;
                }
                if (!resolvedTeacherId) {
                    alert("No teacher profile found for this account.");
                    return;
                }
            } else {
                courseId = selectedCourse?.id || (await resolveCourseIdFromSubject(subjectLabel));
                if (!courseId) {
                    alert("Select or enter a course name first.");
                    return;
                }
            }

            if (pendingBooking) {
                pendingBooking.teacherId = resolvedTeacherId;
                pendingBooking.courseId = courseId;
            }

            if (pendingBooking.eventId) {
                const payload = {
                    classroomId,
                    teacherId: resolvedTeacherId,
                    courseId,
                    date: pendingBooking.date,
                    startTime: startValue,
                    endTime: endValue,
                    status: pendingBooking.status || "BOOKED",
                    visibility: pendingBooking.visibility || "VISIBLE",
                    type: typeValue || pendingBooking.type || "DEFAULT",
                    priority: pendingBooking.priority ?? 0,
                    createdBy: pendingBooking.createdBy || Number(state.currentUser?.id || 0),
                    classIds: pendingBooking.classIds && pendingBooking.classIds.length > 0
                        ? pendingBooking.classIds
                        : classId
                            ? [classId]
                            : [],
                    linkedScheduleId: pendingBooking.linkedScheduleId || null,
                    recurring: recurringEnabled,
                };

                saveScheduleApi(pendingBooking.eventId, payload)
                    .then(async () => {
                        await refreshSchedules();
                        addAuditEntry("Edited", actor, objectLabel, bookingTime, auditScope);
                        closeBookingModal();
                    })
                    .catch((saveError) => {
                        console.error("Failed to save schedule", saveError);
                        alert(`Failed to save schedule: ${saveError.message}`);
                    });
                return;
            } else {
                try {
                    const payload = {
                        classroomId,
                        teacherId: resolvedTeacherId,
                        courseId,
                        date: bookingDate,
                        startTime: startValue,
                        endTime: endValue,
                        status: pendingBooking.status || "BOOKED",
                        visibility: pendingBooking.visibility || "VISIBLE",
                        type: typeValue || pendingBooking.type || "DEFAULT",
                        priority: pendingBooking.priority ?? 0,
                        createdBy: pendingBooking.createdBy || Number(state.currentUser?.id || 0),
                        classIds:
                            pendingBooking.classIds && pendingBooking.classIds.length > 0
                                ? pendingBooking.classIds
                                : classId
                                    ? [classId]
                                    : [],
                        linkedScheduleId: pendingBooking.linkedScheduleId || null,
                        recurring: recurringEnabled,
                    };

                    await saveScheduleApi(null, payload);
                    await refreshSchedules();
                    addAuditEntry("Booked", actor, objectLabel, bookingTime, auditScope);
                    closeBookingModal();
                } catch (saveError) {
                    console.error("Failed to create schedule", saveError);
                    alert(`Failed to create booking: ${saveError.message}`);
                }
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
            renderBookingClassOptions();
            renderBookingSubjectOptions();
        });
        bookingClassInput.addEventListener("focus", renderBookingClassOptions);
    }

    if (bookingProfessor) {
        bookingProfessor.addEventListener("input", () => {
            if (pendingBooking) {
                pendingBooking.teacherId = null;
            }
            bookingProfessor.dataset.teacherId = "";
            renderBookingProfessorOptions();
        });
        bookingProfessor.addEventListener("focus", renderBookingProfessorOptions);
    }

  if (bookingSubject) {
    bookingSubject.addEventListener("input", () => {
      if (pendingBooking) {
        pendingBooking.courseId = null;
      }
      bookingSubject.dataset.courseId = "";
      renderBookingSubjectOptions();
    });
    bookingSubject.addEventListener("focus", renderBookingSubjectOptions);
  }

  const bookingPickers = [
    { group: bookingClassGroup, results: bookingClassResults },
    { group: bookingRoomGroup, results: bookingRoomResults },
    { group: bookingProfessorGroup, results: bookingProfessorResults },
    { group: bookingSubjectGroup, results: bookingSubjectResults },
  ].filter(({ group, results }) => group && results);

  bookingPickers.forEach(({ group, results }) => {
    bindPickerAutoClose(group, results);
  });

    if (bookingStart) {
        bookingStart.addEventListener("input", () => {
            if (pendingBooking) {
                pendingBooking.startMinutes = parseTimeInput(bookingStart.value);
            }
            renderBookingRoomOptions();
            renderBookingClassOptions();
        });
    }

    if (bookingEnd) {
        bookingEnd.addEventListener("input", () => {
            if (pendingBooking) {
                pendingBooking.endMinutes = parseTimeInput(bookingEnd.value);
            }
            renderBookingRoomOptions();
            renderBookingClassOptions();
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
            const auditScope =
                targetView === "class"
                    ? {scopeType: "class", scopeId: removed.classId}
                    : targetView === "room"
                        ? {scopeType: "room", scopeId: removed.roomId}
                        : {scopeType: "general", scopeId: null};
            deleteScheduleApi(pendingBooking.eventId)
                .then(async () => {
                    await refreshSchedules();
                    addAuditEntry("Deleted", actor, objectLabel, bookingTime, auditScope);
                    closeBookingModal();
                })
                .catch((deleteError) => {
                    console.error("Failed to delete schedule", deleteError);
                    alert(`Failed to delete booking: ${deleteError.message}`);
                });
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

    bookingPickers.forEach(({ group, results }) => {
      if (!group.contains(event.target)) {
        closePickerResults(results);
      }
    });
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

async function initializeAuthenticatedApp() {
    await loadClassrooms();
    await loadCourses();
    await loadClasses();
    syncCurrentUserDirectoryEntry();
    if (isAdminRole(state.role)) {
        await loadUsers();
    }
    await loadTeacherDepartments();
    await loadTeachers();
    await loadSchedules();
    syncCurrentTeacherContext();
    renderCurrentView();
}

async function initializeApp() {
    bindEvents();
    updateFilterGroup();
    updateWeek();
    renderAuditLog();

    const restoredSession = restoreSession();
    if (!restoredSession) {
        showLogin();
        return;
    }

    try {
        applyAuthenticatedSession(
            restoredSession.token,
            normalizeUserPayload(restoredSession.user),
            false
        );
        const me = await getCurrentUserApi();
        const normalizedUser = normalizeUserPayload(me);
        applyAuthenticatedSession(restoredSession.token, normalizedUser, true);
        showSchedule(normalizedUser.role, normalizedUser.name, false);
        await initializeAuthenticatedApp();
    } catch (error) {
        showLogin();
    }
}

initializeApp();
