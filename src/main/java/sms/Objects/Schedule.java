package sms.Objects;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class Schedule {
    private int id;
    private int classroomId;
    private int teacherId;
    private int courseId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String visibility;
    private String type;
    private int priority;
    private int createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime greyedAt;
    private Integer linkedScheduleId;

    public Schedule() {}

    public Schedule(int classroomId, int teacherId, int courseId, LocalDate date,
                   LocalTime startTime, LocalTime endTime, String status, String visibility,
                   String type, int priority, int createdBy) {
        this.classroomId = classroomId;
        this.teacherId = teacherId;
        this.courseId = courseId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.visibility = visibility;
        this.type = type;
        this.priority = priority;
        this.createdBy = createdBy;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getClassroomId() { return classroomId; }
    public void setClassroomId(int classroomId) { this.classroomId = classroomId; }

    public int getTeacherId() { return teacherId; }
    public void setTeacherId(int teacherId) { this.teacherId = teacherId; }

    public int getCourseId() { return courseId; }
    public void setCourseId(int courseId) { this.courseId = courseId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getGreyedAt() { return greyedAt; }
    public void setGreyedAt(LocalDateTime greyedAt) { this.greyedAt = greyedAt; }

    public Integer getLinkedScheduleId() { return linkedScheduleId; }
    public void setLinkedScheduleId(Integer linkedScheduleId) { this.linkedScheduleId = linkedScheduleId; }

    @Override
    public String toString() {
        return "Schedule{" +
                "id=" + id +
                ", classroomId=" + classroomId +
                ", teacherId=" + teacherId +
                ", courseId=" + courseId +
                ", date=" + date +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", status='" + status + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}
