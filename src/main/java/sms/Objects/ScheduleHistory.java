package sms.Objects;

import java.time.LocalDateTime;

public class ScheduleHistory {
    private int id;
    private int scheduleId;
    private String action;
    private int changedBy;
    private LocalDateTime timestamp;
    private String note;

    public ScheduleHistory() {}

    public ScheduleHistory(int scheduleId, String action, int changedBy, String note) {
        this.scheduleId = scheduleId;
        this.action = action;
        this.changedBy = changedBy;
        this.note = note;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getScheduleId() { return scheduleId; }
    public void setScheduleId(int scheduleId) { this.scheduleId = scheduleId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public int getChangedBy() { return changedBy; }
    public void setChangedBy(int changedBy) { this.changedBy = changedBy; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    @Override
    public String toString() {
        return "ScheduleHistory{" +
                "id=" + id +
                ", scheduleId=" + scheduleId +
                ", action='" + action + '\'' +
                ", changedBy=" + changedBy +
                ", timestamp=" + timestamp +
                ", note='" + note + '\'' +
                '}';
    }
}
