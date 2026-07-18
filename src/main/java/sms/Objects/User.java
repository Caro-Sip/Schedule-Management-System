package sms.Objects;

public class User {
    private int id;
    private String name;
    private String email;
    private String passwordHash;
    private String role;
    private String lastModified;
    private Integer classId;

    public User() {}

    public User(int id, String name, String email, String passwordHash, String role) {
        this(id, name, email, passwordHash, role, null);
    }

    public User(int id, String name, String email, String passwordHash, String role, String lastModified) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.lastModified = lastModified;
    }

    public User(String name, String email, String passwordHash, String role) {
        this(name, email, passwordHash, role, null);
    }

    public User(String name, String email, String passwordHash, String role, String lastModified) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.lastModified = lastModified;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getLastModified() { return lastModified; }
    public void setLastModified(String lastModified) { this.lastModified = lastModified; }

    public Integer getClassId() { return classId; }
    public void setClassId(Integer classId) { this.classId = classId; }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
