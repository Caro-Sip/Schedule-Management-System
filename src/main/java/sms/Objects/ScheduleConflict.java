package sms.Objects;

public class ScheduleConflict {
    private int scheduleId;
    private int teacherId;
    private int classroomId;
    private String reason;
    private TimeSlot slot;

    public ScheduleConflict() {}

    public ScheduleConflict(int scheduleId, int teacherId, int classroomId, String reason, TimeSlot slot) {
        this.scheduleId = scheduleId;
        this.teacherId = teacherId;
        this.classroomId = classroomId;
        this.reason = reason;
        this.slot = slot;
    }

    public int getScheduleId() { return scheduleId; }
    public void setScheduleId(int scheduleId) { this.scheduleId = scheduleId; }

    public int getTeacherId() { return teacherId; }
    public void setTeacherId(int teacherId) { this.teacherId = teacherId; }

    public int getClassroomId() { return classroomId; }
    public void setClassroomId(int classroomId) { this.classroomId = classroomId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public TimeSlot getSlot() { return slot; }
    public void setSlot(TimeSlot slot) { this.slot = slot; }

    @Override
    public String toString() {
        return "ScheduleConflict{" +
                "scheduleId=" + scheduleId +
                ", teacherId=" + teacherId +
                ", classroomId=" + classroomId +
                ", reason='" + reason + '\'' +
                ", slot=" + slot +
                '}';
    }
}
