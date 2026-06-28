# Analysis of OOP Concepts, SOLID Principles, and GoF Patterns in the Source Code

This report identifies instances of Object-Oriented Programming (OOP) concepts, SOLID design principles, and Gang of Four (GoF) design patterns within the `src/` folder of the **Schedule Management System** codebase.

---

## 1. Object-Oriented Programming (OOP) Concepts

### Encapsulation
Encapsulation refers to the bundling of data (fields) and the methods that operate on that data (getters/setters), while restricting direct access to some of the object's components.

*   **Domain Objects**: In the `sms/Objects/` package, all classes strictly enforce encapsulation by declaring fields as `private` and exposing access and mutations through `public` getters and setters.
    *   **Relative Path**: `src/main/java/sms/Objects/User.java`
    *   **Code Reference**: [User.java](../src/main/java/sms/Objects/User.java)
    *   **Fields**: `id`, `name`, `email`, `passwordHash`, `role`, `lastModified` are all private.
*   **Data Access Objects (DAOs)**: The classes in the `sms/DAO/` package encapsulate all SQLite database connections and SQL transactions, shielding the Service layer from low-level storage details.
    *   **Relative Path**: `src/main/java/sms/DAO/ScheduleDAO.java`
    *   **Code Reference**: [ScheduleDAO.java](../src/main/java/sms/DAO/ScheduleDAO.java#L18-L20)
    *   **Snippet**: A private helper method `getConnection()` is encapsulated within the class.

### Inheritance
Inheritance allows a class (subclass/child class) to inherit attributes and methods from another class (superclass/parent class).

*   **Custom Exception Hierarchy**: The codebase utilizes class inheritance to define a structured hierarchy of custom exceptions. All specific business validation exceptions inherit from a base `SMSException`, which in turn extends the standard Java `Exception`.
    *   **Base Exception Class**: `src/main/java/sms/exception/SMSException.java`
    *   **Code Reference**: [SMSException.java](../src/main/java/sms/exception/SMSException.java#L3)
    *   **Declaration**: `public class SMSException extends Exception`
*   **Specific Exception Subclass Example**
    *   **Relative Path**: `src/main/java/sms/exception/ClassNotFoundException.java`
    *   **Code Reference**: [ClassNotFoundException.java](../src/main/java/sms/exception/ClassNotFoundException.java#L3)
    *   **Declaration**: `public class ClassNotFoundException extends SMSException`
    *   **Note**: Uses `super()` to delegate constructor logic to the parent exception class.

### Polymorphism
Polymorphism allows objects to be treated as instances of their parent class, or methods to have multiple forms. This is shown in the codebase through method overriding (runtime polymorphism) and method/constructor overloading (compile-time polymorphism).

*   **Runtime Polymorphism (Method Overriding)**:
    *   **Relative Path**: `src/main/java/sms/Objects/Teacher.java`
    *   **Code Reference**: [Teacher.java](../src/main/java/sms/Objects/Teacher.java#L30-L37)
    *   **Description**: Overrides the standard `java.lang.Object` implementation of `toString()` using the `@Override` annotation.
*   **Anonymous Subclassing in Unit Tests**:
    *   **Relative Path**: `src/test/java/sms/Service/ScheduleServiceTest.java`
    *   **Code Reference**: [ScheduleServiceTest.java](../src/test/java/sms/Service/ScheduleServiceTest.java#L29-L32)
    *   **Description**: Uses runtime polymorphism to mock dependencies without external libraries by instantiating anonymous subclasses of the DAO classes and overriding their query verification methods.
*   **Compile-Time Polymorphism (Method & Constructor Overloading)**:
    *   **Relative Path**: `src/main/java/sms/Objects/User.java`
    *   **Code Reference**: [User.java](../src/main/java/sms/Objects/User.java#L11-L36)
    *   **Description**: Defines 5 constructors with differing parameter types/counts to construct a `User` object under different scenarios.
    *   **Relative Path**: `src/main/java/sms/Service/ScheduleService.java`
    *   **Code Reference**: [ScheduleService.java](../src/main/java/sms/Service/ScheduleService.java#L85-L94)
    *   **Description**: Overloads the `createSchedule` method to allow creating schedules with or without a `recurring` boolean flag.

### Composition over Inheritance
*Favoring object composition (has-a relationships) over class inheritance (is-a relationships) to achieve modularity and loose coupling.*

*   **Service Layer Composing DAOs**:
    *   **Relative Path**: `src/main/java/sms/Service/ScheduleService.java`
    *   **Code Reference**: [ScheduleService.java](../src/main/java/sms/Service/ScheduleService.java#L40-L48)
    *   **Description**: Instead of inheriting database functionality (e.g. `extends ScheduleDAO`), `ScheduleService` **composes** multiple granular DAOs (`ScheduleDAO`, `ClassroomDAO`, `CourseDAO`, etc.) to reuse persistence logic. This allows it to combine behaviors from different data access components dynamically.
*   **API Controller Composing Services**:
    *   **Relative Path**: `src/main/java/sms/ApiServer.java`
    *   **Code Reference**: [ApiServer.java](../src/main/java/sms/ApiServer.java#L52-L58)
    *   **Description**: `ApiServer` utilizes composition by declaring instances of `TeacherService`, `ClassService`, `ScheduleService`, and others. It delegates handling of HTTP request paths to these service objects rather than subclassing them.
*   **Database Configuration Composing DataSource**:
    *   **Relative Path**: `src/main/java/sms/Config/DatabaseConfig.java`
    *   **Code Reference**: [DatabaseConfig.java](../src/main/java/sms/Config/DatabaseConfig.java)
    *   **Description**: Rather than inheriting driver methods from a vendor-specific class (e.g., `extends SQLiteDataSource`), `DatabaseConfig` **composes** an instance of `SQLiteDataSource` locally, wrapping it to expose clean connection configurations.

---

## 2. SOLID Design Principles

### Single Responsibility Principle (SRP)
*Every class should have a single responsibility or "one reason to change."*

*   **Service Layer separation from Persistence**:
    *   **Relative Path**: `src/main/java/sms/Service/UserService.java` & `src/main/java/sms/DAO/UserDAO.java`
    *   **Code Reference (Service)**: [UserService.java](../src/main/java/sms/Service/UserService.java)
    *   **Code Reference (DAO)**: [UserDAO.java](../src/main/java/sms/DAO/UserDAO.java)
    *   **Description**: `UserDAO` has the sole responsibility of querying and updating the `user` table in the database. `UserService` handles business validation, password hashing, and login flow logic. They are strictly segregated.

### Open/Closed Principle (OCP)
*Software entities should be open for extension, but closed for modification.*

*   **Exception Extension**:
    *   **Relative Path**: `src/main/java/sms/exception/`
    *   **Code Reference**: [SMSException.java](../src/main/java/sms/exception/SMSException.java)
    *   **Description**: If a new validation exception type is needed (e.g., `CourseLimitExceededException`), it can be added by extending `SMSException` without needing to modify `SMSException` itself or the catch blocks handling generic `SMSException` instances in `ApiServer`.

### Liskov Substitution Principle (LSP)
*Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.*

*   **Anonymous Inner Classes in Testing**:
    *   **Relative Path**: `src/test/java/sms/Service/ScheduleServiceTest.java`
    *   **Code Reference**: [ScheduleServiceTest.java](../src/test/java/sms/Service/ScheduleServiceTest.java#L29-L70)
    *   **Description**: The test constructs anonymous subclasses of `ClassroomDAO`, `CourseDAO`, `TeacherDAO`, `ClassEntityDAO`, and `ScheduleDAO`. These subclasses are substituted directly into the constructor of `ScheduleService` in place of the base classes without altering the behavior of the service.

### Interface Segregation Principle (ISP)
*Clients should not be forced to depend on methods they do not use.*

*   **Note on Java Codebase**: There are no custom Java interfaces defined in this codebase. Thus, ISP is not directly applicable at the interface level. However, classes are kept lean and focused, meaning clients (like `ApiServer`) only consume the specific methods they require from services.

### Dependency Inversion Principle (DIP)
*High-level modules should not depend on low-level modules; both should depend on abstractions. Rather than instantiating dependencies, dependencies should be injected.*

*   **Dependency Injection in ScheduleService**:
    *   **Relative Path**: `src/main/java/sms/Service/ScheduleService.java`
    *   **Code Reference**: [ScheduleService.java](../src/main/java/sms/Service/ScheduleService.java#L71-L83)
    *   **Description**: `ScheduleService` accepts all of its required DAOs (`ScheduleDAO`, `ScheduleClassDAO`, `ClassEntityDAO`, etc.) via its constructor. Instead of hardcoding the instantiation of concrete DAOs inside its business methods, it has them injected, which enables decoupling and allows for stubbing in unit tests.

---

## 3. Gang of Four (GoF) Design Patterns

### Lazy Singleton (with Double-Checked Locking Optimization)
*Ensure a class or resource has only one instance, cached globally and initialized thread-safely only when first requested.*

*   **Lazy Database Path & DataSource Caching**:
    *   **Relative Path**: `src/main/java/sms/Config/DatabaseConfig.java`
    *   **Code Reference**: [DatabaseConfig.java](../src/main/java/sms/Config/DatabaseConfig.java)
    *   **Description**: `DatabaseConfig` manages two lazy-initialized singletons. To avoid the runtime overhead of synchronizing every call, it employs the optimized **double-checked locking** pattern using `volatile` fields:
        1.  `databasePath`: Resolves the absolute path on the first call and returns the cached string thereafter.
        2.  `dataSource` (`SQLiteDataSource`): Instantiates and caches the single data source instance on demand, avoiding the overhead of creating a new `SQLiteDataSource` on every request.

### Factory Method Pattern
*Encapsulate the creation logic of complex objects or resources.*

*   **Database Connection Factory**:
    *   **Relative Path**: `src/main/java/sms/Config/DatabaseConfig.java`
    *   **Code Reference**: [DatabaseConfig.java](../src/main/java/sms/Config/DatabaseConfig.java)
    *   **Description**: The `getConnection()` method acts as a connection factory. Instead of consumer classes (like the DAOs) instantiating SQLite data source drivers or specifying connection URLs directly, they call this factory method which handles construction details and returns a standardized JDBC `Connection`.

### Strategy Pattern
*Define a family of algorithms/behaviors and select the appropriate one dynamically.*

*   **Environment-Based Path Resolution Strategy**:
    *   **Relative Path**: `src/main/java/sms/Config/DatabaseConfig.java`
    *   **Code Reference**: [DatabaseConfig.java](../src/main/java/sms/Config/DatabaseConfig.java)
    *   **Description**: Selects the database storage location strategy dynamically at runtime depending on the environment:
        - *Development Strategy*: If running classes directly in development (e.g. from IDE or `target/classes`), it falls back to the user working directory.
        - *Production/JAR Strategy*: If running from a packaged JAR file, it resolves the database path relative to the JAR location.

### Data Mapper
*A layer of Mappers that moves data between objects and a database while keeping them independent of each other.*

*   **DAO Layer**:
    *   **Relative Path**: `src/main/java/sms/DAO/`
    *   **Code Reference (Example)**: [ScheduleDAO.java](../src/main/java/sms/DAO/ScheduleDAO.java)
    *   **Description**: In contrast to the Active Record pattern, the domain objects (like `Schedule` or `User`) are simple POJOs (Plain Old Java Objects) with no database-related logic. The DAO classes act as Data Mappers, mapping database rows into domain objects and vice versa, keeping the domain models decoupled from the SQL database schema.

### Builder Pattern
*Separate the construction of a complex object from its representation.*

*   **JWT Creation and Verification**:
    *   **Relative Path**: `src/main/java/sms/Service/JwtUtils.java`
    *   **Code Reference**: [JwtUtils.java](../src/main/java/sms/Service/JwtUtils.java#L24-L43)
    *   **Description**: Uses fluent builder patterns from the `com.auth0.jwt` library to construct the `JWTVerifier` and build signed JSON Web Tokens (JWT) through step-by-step method chaining.
    *   **Snippet**:
        ```java
        return JWT.create()
                .withIssuer("sms-api")
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expiresAt))
                .withClaim("userId", user.getId())
                .withClaim("role", user.getRole())
                .sign(algorithm);
        ```

### Facade Pattern
*Provide a unified interface to a set of interfaces in a subsystem.*

*   **Service Layer as Facades**:
    *   **Relative Path**: `src/main/java/sms/Service/`
    *   **Code Reference (Example)**: [ScheduleService.java](../src/main/java/sms/Service/ScheduleService.java)
    *   **Description**: The service classes act as a Facade for the API controller layer (`ApiServer`). Instead of the HTTP route handlers in `ApiServer` dealing with raw database connections, multiple validation DAOs, and exception checks, they call a single high-level facade method (e.g., `scheduleService.createSchedule(...)`).

### Front Controller
*A single handler that receives all requests and routes them to appropriate handlers.*

*   **Web API Routing**:
    *   **Relative Path**: `src/main/java/sms/ApiServer.java`
    *   **Code Reference**: [ApiServer.java](../src/main/java/sms/ApiServer.java#L83-L150)
    *   **Description**: Uses Javalin to configure a central routing table. All HTTP API requests enter `ApiServer` and are routed to static method handlers (like `ApiServer::getAllTeachers`), representing the classic Front Controller architecture.
