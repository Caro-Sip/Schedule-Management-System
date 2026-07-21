# Schedule-Management-System
Object Oriented Programming Proposed Project

## Welcome to the Project!

If you are a new developer or are onboarding into this repository, please start by reading our detailed guides:

*   **[Frontend Architecture Guide](documentation/frontend_architecture_guide.md)** — A complete walkthrough of how the user interface works, files structure, state management, and debugging tips.
*   **[Teacher Login & Scheduling Guide](documentation/teacher_login_and_scheduling.md)** — Comprehensive walkthrough of the teacher (professor) role, credentials authorization, profile mapping context, schedule grid filtering, and the SMART overlay comparison functionality.
*   **[Project Brief](documentation/project_brief.md)** — Core responsibilities of the service layer and directory structures.
*   **[Build & Deployment Guide](documentation/build_deployment.md)** — How to compile and run CLI (Console UI) and API (Javalin Web Server) profiles.
*   **[Schedule Display Logic Report](documentation/schedule_display_logic.md)** — In-depth breakdown of user, teacher, class, and room display filters.
*   **[User Session Management](documentation/user_session.md)** — Details on session persistency, HTTP sessions, and JWT.
*   **[Javalin Routing API](documentation/javalin_routing.md)** — How backend routes are mapped.

---

## Getting Started

### 1. Build the Shaded JAR
Compile the project to generate a self-contained, portable shaded JAR:
```bash
mvn clean package
```
This generates the packaged binary at `target/sms-1.0-SNAPSHOT.jar`.

### 2. Run the Application
You can copy this JAR to any folder on your computer. When run, it will automatically create and initialize the SQLite database file (`schedule.db`) in the same folder where the JAR resides.

#### A. Full Seed Mode (Default - Recommended for grading/evaluation)
This mode automatically populates the database with default teachers, classrooms, courses, and schedules for testing.
```bash
java -jar target/sms-1.0-SNAPSHOT.jar
```

#### B. Empty Shell Mode (Optional - Clean production setup)
If you want to start with a completely empty database to define your own classes and schedules from scratch:
```bash
java -jar target/sms-1.0-SNAPSHOT.jar --empty
```
*Note: This creates a single system administrator user (`admin@school.local` / `12345`) so you can log in and begin setups.*

Access the web interface locally at `http://localhost:8080`.

---

## Test Accounts (Full Seed Mode)

Use these accounts to test various views and scheduling controls:

| Role | Email | Password | Target Class / Context |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@school.local` | `12345` | Full CRUD privileges |
| **Year 1 Monitor (A)** | `monitor.y1a@school.local` | `12345` | IP-A-Y1-S2 (2026) schedule |
| **Year 1 Monitor (B)** | `monitor.y1b@school.local` | `12345` | IP-B-Y1-S2 (2026) schedule |
| **Year 2 SE Monitor** | `monitor.se@school.local` | `12345` | IP-SE-Y2-S2 (2026) schedule |
| **Year 2 AI Monitor** | `monitor.ai@school.local` | `12345` | IP-AI-Y2-S2 (2026) schedule |
| **Year 3 SE Monitor** | `monitor.y3se@school.local` | `12345` | IP-SE-Y3-S2 (2026) schedule |
| **Year 3 AI Monitor** | `monitor.y3ai@school.local` | `12345` | IP-AI-Y3-S2 (2026) schedule |
| **Teacher (Hok Tin)** | `hok.tin@school.local` | `12345` | Teacher schedule & SMART overlay |
| **Teacher (Pich Reatrey)** | `pich.reatrey@school.local` | `12345` | Teacher schedule & SMART overlay |

---

## Architecture Overview
- **Database Config**: Programmatic resolution of absolute directory path next to the executable JAR in `sms.Config`.
- **DAO layer**: Performs CRUD operations against SQLite.
- **Service layer**: Validates inputs and holds business logic.
- **Frontend client**: Built with modern vanilla HTML/CSS/JS served under `src/main/resources/public/`. It features **Hash-Based Routing** supporting the browser's Back/Forward button history.