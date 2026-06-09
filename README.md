# Schedule-Management-System
Object Oriented Programming Proposed Project

## Welcome to the Project!

If you are a new developer or are onboarding into this repository, please start by reading our detailed guide guides:

*   **[Frontend Architecture Guide](file:///c:/Users/syphon/Schedule-Management-System/documentation/frontend_architecture_guide.md)** — A complete walkthrough of how the user interface works, files structure, state management, and debugging tips for new developers who aren't yet familiar with JavaScript, HTML, and CSS.
*   **[Project Brief](file:///c:/Users/syphon/Schedule-Management-System/documentation/project_brief.md)** — Core responsibilities of the service layer and directory structures.
*   **[Build & Deployment Guide](file:///c:/Users/syphon/Schedule-Management-System/documentation/build_deployment.md)** — How to compile and run CLI (Console UI) and API (Javalin Web Server) profiles.
*   **[Schedule Display Logic Report](file:///c:/Users/syphon/Schedule-Management-System/documentation/schedule_display_logic.md)** — In-depth breakdown of user, teacher, class, and room display filters.
*   **[User Session Management](file:///c:/Users/syphon/Schedule-Management-System/documentation/user_session.md)** — Details on session persistency, HTTP sessions, and JWT.
*   **[Javalin Routing API](file:///c:/Users/syphon/Schedule-Management-System/documentation/javalin_routing.md)** — How backend routes are mapped.

---

## Getting Started

1. **Initialize the Database**:
   Run `sms.DatabaseInit` to create and populate the local SQLite database file `schedule.db`.
2. **Build and Run the API server**:
   ```bash
   mvn clean package -P api
   java -jar target/sms-1.0-SNAPSHOT.jar
   ```
   Access the web interface locally at `http://localhost:8080`.

## Architecture Overview
- **Database Config**: Linked in the `sms.Config` package.
- **DAO layer**: Performs CRUD operations against SQLite.
- **Service layer**: Validates inputs and holds business logic (shared between CLI and REST interface).
- **Frontend client**: Built with modern vanilla HTML/CSS/JS served under `src/main/resources/public/`.

## Default Admin Credentials
- **Email**: `admin@school.local`
- **Password**: `hash_admin_001`