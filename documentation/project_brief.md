# Classroom Schedule Management System (SMS)

**Stack:** Java 25 · Maven · SQLite · Javalin 7 · JUnit 5

## Overview

The SMS is a Java 25 Maven project organized around a strict service-layer architecture, ensuring all business logic lives in reusable service classes shared across both phases of the application.

### Core Responsibilities

The service layer handles:
- Teaching assignments
- Room bookings
- Conflict detection
- Makeup/missed class scheduling
- Role-based access control
- Audit history tracking

## Architecture

### Two-Phase Deployment

**Phase 1: Console UI (CUI)**
- Exposes service logic through a console interface
- Used for development and CLI operations
- Local user persistence via static session singleton

**Phase 2: REST API**
- Wraps the same services in a Javalin 7 REST API
- Routes defined inside `config.routes` at app creation
- Fronted by a plain HTML/CSS/JS client
- HTTP session or JWT-based user persistence

### Persistence

- **Database:** SQLite via JDBC
- **Schema:** Version-controlled in `schema.sql`
- **Database file:** `.db` file is gitignored

### Build & Distribution

- **Output:** Fat runnable JAR via `maven-shade-plugin`
- **Main class:** `sms.Main`
- **Testing:** JUnit 5

### Project Structure

```
src/main/java/sms/
├── Main.java                 # Application entry point
├── Config/
│   ├── DatabaseConfig.java
│   └── routes.java          # (Phase 2) Javalin route definitions
├── DAO/
│   └── UserDAO.java         # Data access objects
├── Objects/
│   ├── User.java
│   ├── Teacher.java
│   ├── Course.java
│   ├── Schedule.java
│   ├── ClassEntity.java
│   └── ...
├── Service/
│   ├── UserService.java     # Shared business logic
│   └── ...
└── CurrentSession.java      # (Phase 1) Session singleton
```

### Dependencies

- SQLite JDBC
- Javalin 7.2.0
- JUnit 5
- Maven Central (for dependency resolution)

## Development Workflow

1. Write business logic in `Service` layer
2. Ensure all logic is testable and reusable
3. Phase 1: Wire services into console UI
4. Phase 2: Expose services via Javalin routes
5. All changes should maintain the service-first philosophy
