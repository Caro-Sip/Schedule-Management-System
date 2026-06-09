# Schedule Display Logic Report

This report explains how the Schedule Management System web app displays and filters schedules for classes, teachers, and rooms, referencing the relevant files and line numbers. This is intended for developers who need to understand or extend the schedule display functionality.

---

## 1. HTML Structure

The main schedule UI is in the `<section class="schedule" id="schedule-view">` block in [index.html](../src/main/resources/public/index.html#L87-L337):

*   **Tabs**:  
    ```html
    <nav class="tabs" id="schedule-tabs">
        <button class="tab active" data-view="class">Class Schedule</button>
        <button class="tab" data-view="teacher" id="teacher-tab">Teacher Schedule</button>
        <button class="tab" data-view="room">Room Schedule</button>
        <button class="tab hidden" data-view="user" id="user-tab">User</button>
        <button class="tab" data-view="audit" id="audit-tab">Audit Log</button>
    </nav>
    ```
    These tabs let the user switch between class, teacher, room, user directory (admin only), and audit logs (admin only).

*   **Schedule Grid Layout**:  
    The main schedule calendar grid is rendered inside:
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
    </div>
    ```

---

## 2. JavaScript State Management

The app uses a global `state` object inside [js/state.js](../src/main/resources/public/js/state.js#L5-L21) to track the current view, selected entities, user role, and overlay options:

*   `state.view`: Current view (`"class"`, `"teacher"`, `"room"`, `"user"`, or `"audit"`).
*   `state.selectedClassId`, `state.selectedRoomId`, `state.selectedTeacherId`: Tracks which specific class/room/teacher timeline is selected.
*   `state.role`: User role (`"admin"`, `"professor"`, `"class-monitor"`, or `"guest"`).
*   `state.smartOverlayEnabled`: Boolean flag checking if timetables are currently compared.
*   `state.smartOverlayClassIds`: Array of Class IDs overlayed on top of the teacher schedule.

---

## 3. View Switching Logic

*   **View Transition**: The function `setView(view)` in [js/views.js](../src/main/resources/public/js/views.js#L99-L140) updates `state.view`, configures the navigation tabs, clears selection contexts, and lazy-loads directories needed for that view via `ensureDataForView(view)`.
*   **Visibility Control**: The function `updateViewVisibility()` in [js/views.js](../src/main/resources/public/js/views.js#L160-L252) toggles panels and control groups.
    *   Hides lists, calendar cards, filters, and smart overlays depending on permissions and active selections.
    *   Exposes different views based on role logic:
        *   `isTeacherRole(state.role)` determines if they can view their own "Teacher Schedule".
        *   `canUseRoomScopedView(state.role)` checks if rooms can be browsed (restricted to admin, professor, and class-monitor).
*   **Renderer Selector**: `renderCurrentView()` in [js/views.js](../src/main/resources/public/js/views.js#L254-L286) determines whether to render listing panels (like the Class list or Room list) or to immediately clear and draw the schedule events.

---

## 4. Calendar Rendering & Layout Math

The calendar is dynamically constructed inside [js/schedule.js](../src/main/resources/public/js/schedule.js#L787-L944):
*   **Columns**: Drawn inside a CSS grid layout, where columns 0 to 6 map to Monday through Sunday. Columns are assigned via `grid-column: (dayIndex + 1)`.
*   **Event Positioning**:
    *   `START_HOUR = 7` (7 AM) and `END_HOUR = 17` (5 PM) bound the day.
    *   `HOUR_HEIGHT = 56` pixels.
    *   `minutesFromStart(time)` parses event start/end strings into minutes past 7 AM.
    *   The vertical placement of card divs is set using absolute CSS positioning variables:
        ```javascript
        const topPx = (startMins / 60) * HOUR_HEIGHT;
        const heightPx = (duration / 60) * HOUR_HEIGHT;
        ```

---

## 5. View-Specific Filtering Logic

When drawing the calendar, `renderEvents()` in [js/schedule.js](../src/main/resources/public/js/schedule.js#L843-L944) filters the global event entries depending on the active view:

### Class Schedule View
*   Filters events by `state.selectedClassId` (runs when `state.view === "class"`).
*   Includes events matching either `item.classId` or matching elements inside `item.classIds` arrays.

### Room Schedule View
*   Filters events by `state.selectedRoomId` (runs when `state.view === "room"`).
*   Matches events where `item.roomId === state.selectedRoomId`.

### Teacher Schedule View
*   Filters events by the active teacher profile: `getEffectiveTeacherId()` (which resolves to `state.selectedTeacherId || state.currentTeacherId`).
*   Matches events where `item.teacherId` or `item.professor` equals the resolved profile ID.

### SMART Overlay Mode (Comparison View)
*   When `state.smartOverlayEnabled` is `true` during the Teacher view:
    *   Schedules of all classes checked in the overlay list (`state.smartOverlayClassIds`) are fetched.
    *   These class events are merged into `eventsByView.class` and rendered simultaneously alongside the teacher's schedule to highlight conflict overlays.

---

## 6. User Directory Click Flow (Admin Feature)

Administrators managing users can click rows in the user directory to view specific schedules:

1.  **Row Click**: The user clicks a row in the user list. In [js/main.js](../src/main/resources/public/js/main.js#L329-L358), the listener extracts `userId` and resolves the clicked record in `userDirectory`.
2.  **Redirect Routing**: The user object is passed to `showUserSchedule(user)` in [js/dom.js](../src/main/resources/public/js/dom.js#L512-L550).
3.  **Role resolution**:
    *   **Class Monitor or Student**:
        *   Resolves class ID using `resolveClassIdForUser(user)` (checking `user.classId` mappings).
        *   Switches view context to `"class"`, marks `state.userScheduleOrigin = "user"`, and calls `selectClass(classId)`.
    *   **Professor (Teacher)**:
        *   Resolves the linked teacher profile ID using `resolveTeacherIdForUser(user)` (matching `teacher.userId` to `user.id`).
        *   Switches view context to `"teacher"`, marks `state.userScheduleOrigin = "user"`, and calls `selectTeacher(teacherId)`.
4.  **Back Navigation**:
    The click of the **Back to list** button (`backToListBtn`) detects if the timetable was opened from the User context (`state.userScheduleOrigin === "user"`). If so, it resets selections and returns the user to the User Directory tab.
