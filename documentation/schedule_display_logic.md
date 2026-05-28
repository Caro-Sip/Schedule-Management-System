# Schedule Display Logic Report

This report explains how the Schedule Management System web app displays schedules for teachers, users, and classes, referencing the relevant files and line numbers. This is intended for developers who need to understand or extend the schedule display functionality.

---

## 1. HTML Structure

The main schedule UI is in the `<section class="schedule" id="schedule-view">` block in [src/main/resources/public/index.html](src/main/resources/public/index.html#L87-L355):

- **Tabs**:  
  ```html
  <nav class="tabs" id="schedule-tabs">
    <button class="tab active" data-view="class">Class Schedule</button>
    <button class="tab" data-view="teacher" id="teacher-tab">Teacher Schedule</button>
    <button class="tab" data-view="room">Room Schedule</button>
    <button class="tab hidden" data-view="user" id="user-tab">User</button>
    ...
  </nav>
  ```
  These tabs let the user switch between class, teacher, room, and user schedules.

- **Schedule Card**:  
  The main schedule grid is rendered inside:
  ```html
  <div class="schedule-card" id="schedule-card">
    <div class="schedule-scroll">
      <div class="schedule-grid">
        <div class="schedule-header" id="schedule-header"></div>
        <div class="schedule-body">
          <div class="times" id="time-column"></div>
          <div class="grid-area">
            <div class="events" id="events"></div>
          </div>
        </div>
      </div>
    </div>
    ...
  </div>
  ```

---

## 2. JavaScript State Management

The app uses a global `state` object to track the current view, selected entities, and user role. Key properties include (see [js/views.js](src/main/resources/public/js/views.js#L11-L26)):

- `state.view`: Current view (`"class"`, `"teacher"`, `"room"`, or `"user"`)
- `state.selectedClassId`, `state.selectedTeacherId`, `state.selectedRoomId`: Track which class/teacher/room is selected
- `state.role`: Current user's role (admin, professor, etc.)
- `state.userScheduleOrigin`: Used to track if a teacher schedule was opened from a user context

---

## 3. View Switching Logic

- The function `setView(view)` updates `state.view` and triggers UI updates ([js/views.js](src/main/resources/public/js/views.js#L101-L109)).
- Tabs in the UI call `setView()` to switch between schedule types.
- The function `updateViewVisibility()` shows/hides UI panels based on the current view and role ([js/views.js](src/main/resources/public/js/views.js#L110-L180)).

---

## 4. Rendering the Schedule

- The main function for rendering the schedule grid is `renderEvents()` in [js/schedule.js](src/main/resources/public/js/schedule.js#L400-L560).
- It determines which events to show based on `state.view` and the selected entity:
  - **Class schedule**: Filters events by `state.selectedClassId`
  - **Teacher schedule**: Filters events by `state.selectedTeacherId`
  - **Room schedule**: Filters events by `state.selectedRoomId`
- The function `renderCurrentView()` in [js/views.js](src/main/resources/public/js/views.js#L181-L220) decides which list or schedule to render based on the current state.

---

## 5. Teacher Schedule Logic

- When the user selects the "Teacher Schedule" tab, `state.view` is set to `"teacher"` ([index.html](src/main/resources/public/index.html#L100-L101)).
- The UI expects `state.selectedTeacherId` to be set (e.g., by clicking a teacher in a list).
- `renderEvents()` filters the events ([js/schedule.js](src/main/resources/public/js/schedule.js#L414-L420)):
  ```js
  if (state.view === "teacher" && state.selectedTeacherId) {
    filteredItems = items.filter(
      (item) =>
        String(item.teacherId) === String(state.selectedTeacherId) ||
        String(item.professor) === String(state.selectedTeacherId)
    );
  }
  ```
- The filtered events are rendered in the schedule grid.

---

## 6. User/Class Schedule Logic

- For class schedules, `state.view` is `"class"` and `state.selectedClassId` must be set.
- For user schedules, `state.view` is `"user"` and the user directory is shown.
- The schedule grid is only shown if a class is selected ([js/schedule.js](src/main/resources/public/js/schedule.js#L401-L413)):
  ```js
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
  ```

## 7. User Tab Click Flow

The User tab is only exposed to admins in the UI ([src/main/resources/public/index.html](src/main/resources/public/index.html#L98-L104)) and the tab handler prevents non-admin access in [src/main/resources/public/js/main.js](src/main/resources/public/js/main.js#L1-L12). When a user row is clicked, the frontend does not render the schedule directly from the row data. It first resolves the clicked row to a full user object in [src/main/resources/public/js/main.js](src/main/resources/public/js/main.js#L253-L279), then passes that user into `showUserSchedule(user)` in [src/main/resources/public/js/dom.js](src/main/resources/public/js/dom.js#L241-L271).

The user list itself is rendered with the raw user id stored on each row at [src/main/resources/public/js/dom.js](src/main/resources/public/js/dom.js#L319-L321). The click handler reads that id, looks up the matching record in `userDirectory`, and decides what schedule to open based on the user role.

- For a class monitor, `showUserSchedule(user)` resolves a class id using `resolveClassIdForUser(user)` in [src/main/resources/public/js/dom.js](src/main/resources/public/js/dom.js#L219-L226). It then clears any teacher selection, switches to the class view, marks the origin as `"user"`, and calls `selectClass(classId)`.
- For a professor or teacher role, `showUserSchedule(user)` resolves the linked teacher profile id using `resolveTeacherIdForUser(user)` in [src/main/resources/public/js/dom.js](src/main/resources/public/js/dom.js#L228-L238). That lookup matches `teacher.userId` against `user.id`, which means the schedule is filtered by the teacher profile id, not the user id itself.

Once the teacher id is selected, `selectTeacher(teacherId)` stores it in `state.selectedTeacherId` and triggers a rerender ([src/main/resources/public/js/dom.js](src/main/resources/public/js/dom.js#L204-L217)). The visible schedule is then filtered in [src/main/resources/public/js/schedule.js](src/main/resources/public/js/schedule.js#L414-L420):

```js
if (state.view === "teacher" && state.selectedTeacherId) {
  filteredItems = items.filter(
    (item) =>
      String(item.teacherId) === String(state.selectedTeacherId) ||
      String(item.professor) === String(state.selectedTeacherId)
  );
}
```

That means the frontend can display a teacher schedule from either `eventItem.teacherId` or `eventItem.professor`, as long as one of those fields matches the resolved teacher profile id. If no teacher profile is linked to the user, `showUserSchedule(user)` alerts the user and stops.

---

## 8. Summary of Flow

1. **User selects a tab** (class, teacher, room, user).
2. **State is updated** (`state.view`, selected entity IDs).
3. **UI panels are shown/hidden** based on the view and role.
4. **Events are filtered** for the selected entity.
5. **Schedule grid is rendered** with the filtered events.

---

## 9. Key Functions

- `setView(view)`: Switches the current view ([js/views.js](src/main/resources/public/js/views.js#L101-L109)).
- `updateViewVisibility()`: Shows/hides UI panels ([js/views.js](src/main/resources/public/js/views.js#L110-L180)).
- `renderCurrentView()`: Renders the appropriate list or schedule ([js/views.js](src/main/resources/public/js/views.js#L181-L220)).
- `renderEvents()`: Draws the schedule grid for the current selection ([js/schedule.js](src/main/resources/public/js/schedule.js#L400-L560)).

---

## 10. Implementation Notes

- The schedule grid is generic and reused for all views; only the filtering logic changes.
- The system uses a directory of events, classes, teachers, and rooms, loaded at startup or via API.
- The UI is role-aware: some tabs and actions are only available to admins or teachers.

---

This report provides a clear overview for a developer to understand and extend the schedule display logic for teachers, users, and classes. For code-level details for a specific function, see the referenced files and line numbers above.
