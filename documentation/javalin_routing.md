# Javalin Routing API Documentation

## Overview
The new Javalin dependency (Phase 2) uses an attribute-based routing configuration approach.

## Routes Configuration

### Key Pattern
- Routes are defined as an **attribute object** on the Javalin config
- Access via: `config.routes`
- The `routes` object exposes HTTP method functions: `.get()`, `.post()`, `.put()`, `.delete()`, etc.

### Example Usage
```java
var app = Javalin.create(config -> {
    config.routes.get("/", ctx -> {
        // Handler logic
    });
    config.routes.get("/health", ctx -> {
        // Handler logic
    });
}).start(8080);
```

### Syntax
```java
config.routes.METHOD(path, handler)
```

Where:
- **METHOD**: HTTP verb (`get`, `post`, `put`, `delete`, etc.)
- **path**: Route path as string (e.g., `/`, `/health`, `/api/users`)
- **handler**: Lambda expression receiving `Context` parameter for request/response handling

### Context Object
The handler receives a `Context` object with methods like:
- `.json(Object)` - Send JSON response
- `.result(String)` - Send string response
- `.status(int)` - Set HTTP status code

## Implementation Notes
- Routes are configured in the Javalin constructor before `.start()`
- Configuration is done in a fluent, functional style using lambda expressions
- This replaces older approaches where routes might have been defined separately
