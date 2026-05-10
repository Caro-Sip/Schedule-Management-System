# User Session Management

## Overview

User persistence across the session is handled differently depending on the deployment phase. Since the service layer is shared between CLI and REST API, the session strategy must adapt to each environment.

## Phase 1: Console UI (CLI)

### Current Session Singleton Pattern

For the console application, use a static singleton to maintain the logged-in user throughout the session.

```java
public class CurrentSession {
    private static User loggedInUser;
    
    public static void setUser(User user) {
        CurrentSession.loggedInUser = user;
    }
    
    public static User getUser() {
        return CurrentSession.loggedInUser;
    }
    
    public static boolean isLoggedIn() {
        return loggedInUser != null;
    }
    
    public static void logout() {
        CurrentSession.loggedInUser = null;
    }
}
```

### Usage

Any service or UI component can access the current user:

```java
// In Main.java or service methods
if (CurrentSession.isLoggedIn()) {
    User user = CurrentSession.getUser();
    // Perform role-based operations
}

// After login
CurrentSession.setUser(authenticatedUser);

// On logout
CurrentSession.logout();
```

## Phase 2: REST API (Javalin)

### Session Strategy

Two approaches are recommended:

#### Option 1: HTTP Sessions (Stateful)
- Use Javalin's built-in session support
- Server maintains session state
- Good for traditional web applications

```java
// In routes
app.post("/login", ctx -> {
    User user = userService.authenticate(username, password);
    ctx.sessionAttribute("user", user);
});

app.get("/profile", ctx -> {
    User user = ctx.sessionAttribute("user");
    if (user == null) {
        ctx.status(401).result("Unauthorized");
    } else {
        ctx.json(user);
    }
});
```

#### Option 2: JWT Tokens (Stateless)
- Client sends token with each request
- Server validates token signature
- Better for distributed/microservices architectures
- Recommended for scalability

```java
// In routes
app.post("/login", ctx -> {
    User user = userService.authenticate(username, password);
    String token = JwtUtil.generateToken(user);
    ctx.json(new LoginResponse(token));
});

app.get("/profile", ctx -> {
    String token = ctx.header("Authorization").replace("Bearer ", "");
    User user = JwtUtil.validateToken(token);
    if (user == null) {
        ctx.status(401).result("Unauthorized");
    } else {
        ctx.json(user);
    }
});
```

## Migration Considerations

- **Phase 1 → Phase 2:** The `CurrentSession` singleton is CLI-only. Do not use it in REST endpoints.
- **Service Reuse:** Services should accept `User` as a parameter rather than accessing `CurrentSession`. This ensures services work in both phases.
- **Separation:** Keep CLI session logic (`CurrentSession`) separate from API session logic (HTTP sessions or JWT).

## Best Practices

1. **Never store passwords** in `CurrentSession` or session attributes — only store user ID or full User object
2. **Always validate** sessions on sensitive operations
3. **Services first:** Design services to accept `User` parameter; don't make them session-dependent
4. **Role-based access:** Check user roles in services, not just UI layer
5. **Audit trail:** Log all user actions with timestamp and user ID for compliance
