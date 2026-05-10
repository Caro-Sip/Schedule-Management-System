# Build & Deployment Guide

## Overview

The SMS project uses Maven profiles to build two separate JARs:
- **CLI** (Phase 1) — Console interface for direct database management and testing
- **API** (Phase 2) — REST server for the web frontend

## Building the Project

### CLI Build (Default)

**Command:**
```bash
mvn clean package
```

**Output:** `target/sms-1.0-SNAPSHOT.jar`

**What it does:**
- Entry point: `sms.Cli`
- Runs an interactive console menu
- Single-user session via CLI
- Used for Phase 1 development

**Run it:**
```bash
java -jar target/sms-1.0-SNAPSHOT.jar
```

---

### API Build

**Command:**
```bash
mvn clean package -P api
```

**Output:** `target/sms-1.0-SNAPSHOT.jar` (same filename, different entry point)

**What it does:**
- Entry point: `sms.ApiServer`
- Starts a Javalin web server on port `8080`
- Exposes REST endpoints for the web frontend
- Used for Phase 2 deployment

**Run it:**
```bash
java -jar target/sms-1.0-SNAPSHOT.jar
```

**Test the server:**
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "ok",
  "message": "Schedule Management System API is running"
}
```

---

## Profile Details

### Profile: `cli` (Default)

```xml
<profile>
  <id>cli</id>
  <activation>
    <activeByDefault>true</activeByDefault>
  </activation>
  <properties>
    <main.class>sms.Cli</main.class>
  </properties>
</profile>
```

- **Active by default** — If you run `mvn package` without `-P`, this is used
- **Main class:** `sms.Cli`
- **Best for:** Local development, testing, Phase 1

### Profile: `api`

```xml
<profile>
  <id>api</id>
  <properties>
    <main.class>sms.ApiServer</main.class>
  </properties>
</profile>
```

- **Activated with:** `-P api`
- **Main class:** `sms.ApiServer`
- **Best for:** Server deployment, Phase 2, production

---

## How Maven Profiles Work

Maven profiles allow you to conditionally set properties based on activation rules.

**How `-P` flag works:**

```bash
mvn clean package              # Uses 'cli' profile (default)
mvn clean package -P api       # Uses 'api' profile
mvn clean package -P cli -P api # Uses both profiles (builds twice)
```

**Property substitution:**

In `pom.xml`, the `maven-shade-plugin` uses:
```xml
<mainClass>${main.class}</mainClass>
```

Maven replaces `${main.class}` with the value from the active profile's `<properties>` section:
- If `cli` is active: `${main.class}` = `sms.Cli`
- If `api` is active: `${main.class}` = `sms.ApiServer`

---

## Development Workflow

### Phase 1 (CLI Development)

```bash
# Build CLI JAR
mvn clean package

# Run CLI
java -jar target/sms-1.0-SNAPSHOT.jar

# Output:
# Database not found. Initializing...
# Database initialized successfully.
# Login Form
# 1. Login
# 2. Continue as Guest
# 1. View Class Schedule
# 2. View Teacher Schedule
# 3. View Room Schedule
```

### Phase 2 (API Development)

```bash
# Build API JAR
mvn clean package -P api

# Run API server
java -jar target/sms-1.0-SNAPSHOT.jar

# Output:
# Database not found. Initializing...
# Database initialized successfully.
# API Server started on http://localhost:8080

# Test in another terminal
curl http://localhost:8080/health
# {"status":"ok","message":"Schedule Management System API is running"}
```

---

## Troubleshooting

### "No such property: main.class"
- Ensure your `pom.xml` has the `<profiles>` section defined
- Verify the profile names match: `cli` or `api`

### JAR runs but wrong entry point
- Check which profile was used: `mvn clean package -P api` (note the `-P api`)
- Default is CLI — add `-P api` explicitly for API build

### Dependencies missing at runtime
- The `maven-shade-plugin` packages all dependencies (except junit) into the JAR
- Run `mvn clean compile` to verify dependencies resolve correctly
- Check that `sqlite-jdbc` and `javalin` are in your `pom.xml`

---

## Next Steps

- **CLI routes:** Add service calls in `Cli.java` for user authentication and schedule viewing
- **API routes:** Define REST endpoints in `ApiServer.java` using Javalin's `app.get()`, `app.post()`, etc.
- **Database schema:** Create `db/V0_nothing.sql` with table definitions
- **Services:** Implement business logic in `Service/` package
