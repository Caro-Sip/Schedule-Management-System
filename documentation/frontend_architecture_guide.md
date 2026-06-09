# Frontend Architecture Guide for New Developers

Welcome! If you have been introduced to the **Classroom Schedule Management System (SMS)** project blindfolded—and perhaps aren't yet familiar with HTML, CSS, or JavaScript—this guide is written specifically for you.

By the end of this document, you will understand exactly how the user interface is structured, how the files connect to each other, and how user actions on the screen travel all the way to the database and back.

---

## 1. High-Level System Architecture

Before diving into the code, let's understand the two main halves of the system and how they talk to each other:

```mermaid
graph TD
    subgraph Frontend [Web Browser Client]
        HTML[index.html (Structure)]
        CSS[styles.css (Design)]
        JS[JavaScript Files (Logic & State)]
    end

    subgraph Backend [Java Server & DB]
        Javalin[ApiServer.java (REST Controller)]
        Services[Service Layer (Business Logic)]
        DAOs[DAO Layer (SQL Queries)]
        DB[(SQLite Database)]
    end

    JS -- "HTTP Fetch (JSON & JWT Token)" --> Javalin
    Javalin -- Calls --> Services
    Services -- Calls --> DAOs
    DAOs -- Direct Read/Write --> DB
    Javalin -- "Serves static files (HTML/CSS/JS)" --> Frontend
```

### The Separation of Concerns
1. **The Backend (Java 25 + Javalin + SQLite)**:
   - Lives in `src/main/java/sms/`.
   - Starts a web server on port `8080` (configured in [ApiServer.java](file:///c:/Users/syphon/Schedule-Management-System/src/main/java/sms/ApiServer.java)).
   - Serves the database records via **REST API endpoints** (e.g., `/api/classes`, `/api/schedules`).
   - Serves the frontend static files (HTML, CSS, JS) from the `/public` folder to the browser on startup.
2. **The Frontend (Vanilla HTML5 / CSS3 / ES6 JavaScript)**:
   - Lives in `src/main/resources/public/`.
   - Runs entirely inside the user's web browser.
   - It is a **Single Page Application (SPA)**: there is only one HTML file (`index.html`), and JavaScript dynamically changes what is shown on screen without loading a new page.

---

## 2. A 5-Minute Web Crash Course

If you haven't written frontend code before, think of web development as building a house:
*   **HTML (Structure)**: The skeleton, walls, and doorways. It defines where buttons, forms, tables, and text exist on the page.
*   **CSS (Styling)**: The paint, wallpaper, and lighting. It controls the colors, sizes, alignment, fonts, and responsiveness (how it looks on phones vs. monitors).
*   **JavaScript (Behavior)**: The electrical system and smart controls. It listens when a user clicks a button, talks to the server, and updates the text on the walls without tearing down the house.

In our project:
*   **HTML** is contained in [index.html](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/index.html).
*   **CSS** is contained in [styles.css](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/styles.css).
*   **JavaScript** logic is modularized into several files in the `js/` folder.

---

## 3. How the Frontend JavaScript Files Fit Together

When `index.html` loads, it imports several JavaScript scripts at the very bottom of the body. Because the browser processes these files in order, their loading sequence is critical. A script loaded later can reference functions and constants declared in scripts loaded earlier:

```
Loading Sequence:
[1] js/state.js  ──> [2] js/dom.js  ──> [3] js/utils.js  ──> [4] js/audit.js  ──> [5] audit-log.js ──> [6] js/entities.js  ──> [7] js/schedule.js  ──> [8] js/views.js  ──> [9] js/main.js
```

Here is what each file does:

| Script File | Responsibility | Key Content |
| :--- | :--- | :--- |
| **[state.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/state.js)** | **Global State**: Holds the single source of truth for the frontend application. | `state` object (current role, active view tab, auth token, selected IDs), lists/directories for classes/users/teachers. |
| **[dom.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/dom.js)** | **DOM References & Helpers**: Stores shortcuts to HTML elements and handles common input bindings. | Element select-option helpers, showing user schedules based on role. |
| **[utils.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/utils.js)** | **Helper Calculations**: Common math, string parsers, and date/time formatters. | `minutesFromStart`, `formatClockTime`, `resolveClassroomFromInput` (parses typing filters like `j6` to building floors). |
| **[audit.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/audit.js)** | **Sidebar Logs Handler**: Controls the collapsible right-hand audit log widget. | Renders short audit log updates in the aside menu. |
| **[audit-log.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/audit-log.js)** | **Admin Log View**: Controls search, filtering, and listing in the main Audit Log tab. | `renderAdminAuditLog`, search input listeners for audit log entries. |
| **[entities.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/entities.js)** | **API Client & Normalization**: The layer that fetches data from Java endpoints and maps database keys to frontend properties. | `requestJson` helper, endpoints wrappers (`loginApi`, `loadClasses`, `saveScheduleApi`). |
| **[schedule.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/schedule.js)** | **Calendar Grid Renderer**: Calculates grid positions and draws scheduled event blocks. | `renderEvents` (draws event divs, positioning them by translating time to CSS height/top coordinates). |
| **[views.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/views.js)** | **Screen Transitions & Visibility**: Shows and hides different panels based on user role and selected view. | `setView`, `updateViewVisibility` (hides/shows tables, tabs, buttons, or modals). |
| **[main.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/main.js)** | **App Entry Point**: Listens for user interactions (clicks, form submissions) and wires up user workflows. | `bindEvents` (binds click/submit event listeners), `initializeAuthenticatedApp`. |

---

## 4. State Management (The Brain of the Frontend)

Instead of passing variables between functions, this application uses a **Global State** pattern. The `state` object inside [js/state.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/state.js) represents the current configuration of the application at any given microsecond.

For example, when a user clicks to view a room schedule for room ID `5`:
1. `state.view` is set to `"room"`.
2. `state.selectedRoomId` is set to `5`.
3. The UI queries: *"Hey scheduler, draw events where `roomId === 5`"* and redraws the calendar.

If the user changes tabs or logs out, we invoke `resetSessionState()` (in [js/views.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/views.js)), restoring defaults.

---

## 5. Walkthrough of a Core Flow: Logging In

Let's trace what happens when a user signs in. This illustrates the full round-trip from the screen to the database.

### Step 1: User action (HTML -> JS Event Listener)
In the login form on the web page:
*   The developer writes `<form id="login-form">` in [index.html](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/index.html).
*   In [js/main.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/main.js), we bind a submit listener:
    ```javascript
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Stop page reload
        const formData = new FormData(loginForm);
        const email = formData.get("email");
        const password = formData.get("password");
        
        const data = await loginApi(email, password); // Calls API client
        ...
    ```

### Step 2: The API Request (Fetch Client)
*   In [js/entities.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/entities.js), the `loginApi` function makes an HTTP request:
    ```javascript
    async function loginApi(email, password) {
        return requestJson(`/api/auth/login`, {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }
    ```
*   `requestJson` handles sending the headers and converts response payloads from text into usable JavaScript objects.

### Step 3: Backend Processing (Java controller -> DB)
*   The server in [ApiServer.java](file:///c:/Users/syphon/Schedule-Management-System/src/main/java/sms/ApiServer.java) listens for `POST /api/auth/login` and directs it to the `login()` method:
    ```java
    private static void login(Context ctx) {
        Map<?, ?> payload = ctx.bodyAsClass(Map.class);
        String email = readString(payload, "email");
        String password = readString(payload, "password");
        
        // Authenticate user against database via the User Service
        User user = userService.login(email, password);
        
        // Generate security token (JSON Web Token - JWT)
        String token = JwtUtils.generateToken(user);
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("user", toPublicUser(user));
        
        ctx.status(200).json(response);
    }
    ```
*   `userService.login(email, password)` calls the database layer to check if the credentials match the encrypted hash.

### Step 4: UI Update (JS -> HTML Render)
*   Back in [js/main.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/main.js), if the server sends back a `200 OK`, we invoke:
    ```javascript
    applyAuthenticatedSession(data.token, loggedInUser);
    showSchedule(loggedInUser.role, loggedInUser.name);
    await initializeAuthenticatedApp();
    ```
*   `applyAuthenticatedSession` (in [js/views.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/views.js)) stores the token so subsequent requests are authenticated.
*   `showSchedule` toggles CSS classes (`hidden`) to make the login panel vanish and render the scheduling grid.

---

## 6. How the Schedule Grid is Drawn

The schedule looks like a calendar table, but it is actually a dynamically drawn layout in [js/schedule.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/schedule.js).

1. **Calculating Columns**:
   - The grid represents Monday to Sunday (columns 0 to 6).
   - Columns are defined using CSS Grid. Each scheduled class gets positioned on the horizontal axis by assign `grid-column: (dayIndex + 1)`.
2. **Calculating Verticals (Time to Pixels)**:
   - The day begins at 7 AM (`START_HOUR = 7`) and ends at 5 PM (`END_HOUR = 17`).
   - Every hour of duration is mapped to `HOUR_HEIGHT = 56` pixels.
   - When drawing a scheduled event, `renderEvents()` computes the pixel offset from 7 AM:
     ```javascript
     const startMins = minutesFromStart(event.start); // e.g., 9:00 AM = 120 mins from 7:00 AM
     const endMins = minutesFromStart(event.end);     // e.g., 11:00 AM = 240 mins from 7:00 AM
     const duration = endMins - startMins;            // 120 mins
     
     // Position elements using absolute CSS style top/height attributes
     const topPx = (startMins / 60) * HOUR_HEIGHT;
     const heightPx = (duration / 60) * HOUR_HEIGHT;
     ```
   - It then creates a HTML `<div>` element representing the class block, styles it, and attaches it inside the `<div id="events">` container.

---

## 7. Developer Tips: Local Development and Debugging

### Step-by-Step: How to Test Your Changes
1.  **Start the Server**:
    Run the Maven build to bundle the API Jar and run it:
    ```bash
    mvn clean package -P api
    java -jar target/sms-1.0-SNAPSHOT.jar
    ```
2.  **Open the App**:
    Navigate to `http://localhost:8080` in your web browser.
3.  **Inspect Code (No Compiler Needed for Frontend)**:
    - If you only modify HTML, CSS, or JS, you generally do *not* need to stop the Java server.
    - Simply save your edits in the IDE, and reload the browser page (`Ctrl + F5` to ignore caching).
    - *Note*: If your IDE does not auto-sync static asset folder saves, run `mvn compile` to copy updated resources into the target folder.

### Debugging with Browser Developer Tools (F12)
Press **F12** or **Right Click -> Inspect** in Chrome/Firefox to open the Developer Tools:
*   **Console Tab**: Shows errors in your JavaScript code (like typos, undefined variables, or runtime crashes). You can print debugging notes here by adding `console.log(variable)` in your code.
*   **Network Tab**: Watch data exchanges in real-time. If a table is empty, check the Network tab to see if the HTTP requests (like `GET /api/classes`) are failing with red status codes (e.g. `500 Server Error` or `401 Unauthorized`).
*   **Elements Tab**: Inspect the DOM structure. You can see the dynamically generated schedule cards, verify their style attributes, and check if their coordinates (`top` / `height` / `grid-column`) were calculated properly.

---

## 8. Quick Cheat Sheet: Adding a New Feature

If you are asked to add a new button that performs an action (e.g., "Clear all schedules for this class"):
1.  **Add the Button in HTML**:
    Open [index.html](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/index.html) and place the button under the controls section:
    ```html
    <button class="btn btn-ghost" id="clear-schedule-btn">Clear All</button>
    ```
2.  **Define Element shortcut in JS**:
    Open [js/dom.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/dom.js) or `js/main.js` and get a reference to it:
    ```javascript
    const clearScheduleBtn = document.getElementById("clear-schedule-btn");
    ```
3.  **Bind Event Listener**:
    In [js/main.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/main.js)'s `bindEvents()`, attach an action:
    ```javascript
    clearScheduleBtn.addEventListener("click", async () => {
        if (!state.selectedClassId) return alert("Select a class first!");
        if (confirm("Delete all class schedules?")) {
            // Trigger API call from entities.js
            await deleteSchedulesForClassApi(state.selectedClassId);
            // Refresh schedule data and UI
            await refreshSchedules();
        }
    });
    ```
4.  **Add API Wrapper**:
    In [js/entities.js](file:///c:/Users/syphon/Schedule-Management-System/src/main/resources/public/js/entities.js), write the REST caller:
    ```javascript
    async function deleteSchedulesForClassApi(classId) {
        return requestJson(`/api/schedules/class/${classId}`, {
            method: "DELETE"
        });
    }
    ```
5.  **Expose endpoint in Java Backend**:
    In [ApiServer.java](file:///c:/Users/syphon/Schedule-Management-System/src/main/java/sms/ApiServer.java), register the path mapping and write the matching handler method.
