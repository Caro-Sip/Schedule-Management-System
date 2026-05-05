package sms.Objects;

public class ScheduleClass {
    private int scheduleId;
    private int classId;

    public ScheduleClass() {}

    public ScheduleClass(int scheduleId, int classId) {
        this.scheduleId = scheduleId;
        this.classId = classId;
    }

    public int getScheduleId() { return scheduleId; }
    public void setScheduleId(int scheduleId) { this.scheduleId = scheduleId; }

    public int getClassId() { return classId; }
    public void setClassId(int classId) { this.classId = classId; }

    @Override
    public String toString() {
        return "ScheduleClass{" +
                "scheduleId=" + scheduleId +
                ", classId=" + classId +
                '}';
    }
}
