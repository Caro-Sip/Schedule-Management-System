package sms.Objects;

import java.time.LocalDateTime;

public class AuditLog {
    private int id;
    private String entityType;
    private int entityId;
    private String action;
    private int userId;
    private LocalDateTime timestamp;
    private String details;

    public AuditLog() {}

    public AuditLog(String entityType, int entityId, String action, int userId, String details) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.userId = userId;
        this.details = details;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public int getEntityId() { return entityId; }
    public void setEntityId(int entityId) { this.entityId = entityId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    @Override
    public String toString() {
        return "AuditLog{" +
                "id=" + id +
                ", entityType='" + entityType + '\'' +
                ", entityId=" + entityId +
                ", action='" + action + '\'' +
                ", userId=" + userId +
                ", timestamp=" + timestamp +
                ", details='" + details + '\'' +
                '}';
    }
}
