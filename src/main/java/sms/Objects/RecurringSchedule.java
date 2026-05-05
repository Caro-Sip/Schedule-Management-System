package sms.Objects;

import java.time.LocalDate;
import java.time.LocalTime;

public class RecurringSchedule {
    private int id;
    private int teacherId;
    private int classroomId;
    private int courseId;
    private int dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate effectiveFrom;
    private LocalDate effectiveUntil;

    public RecurringSchedule() {}

    public RecurringSchedule(int teacherId, int classroomId, int courseId, int dayOfWeek,
                            LocalTime startTime, LocalTime endTime, LocalDate effectiveFrom, LocalDate effectiveUntil) {
        this.teacherId = teacherId;
        this.classroomId = classroomId;
        this.courseId = courseId;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.effectiveFrom = effectiveFrom;
        this.effectiveUntil = effectiveUntil;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getTeacherId() { return teacherId; }
    public void setTeacherId(int teacherId) { this.teacherId = teacherId; }

    public int getClassroomId() { return classroomId; }
    public void setClassroomId(int classroomId) { this.classroomId = classroomId; }

    public int getCourseId() { return courseId; }
    public void setCourseId(int courseId) { this.courseId = courseId; }

    public int getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(int dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public LocalDate getEffectiveUntil() { return effectiveUntil; }
    public void setEffectiveUntil(LocalDate effectiveUntil) { this.effectiveUntil = effectiveUntil; }

    @Override
    public String toString() {
        return "RecurringSchedule{" +
                "id=" + id +
                ", teacherId=" + teacherId +
                ", classroomId=" + classroomId +
                ", courseId=" + courseId +
                ", dayOfWeek=" + dayOfWeek +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", effectiveFrom=" + effectiveFrom +
                ", effectiveUntil=" + effectiveUntil +
                '}';
    }
}
