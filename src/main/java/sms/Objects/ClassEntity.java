package sms.Objects;

import java.time.LocalDate;

public class ClassEntity {
    private int id;
    private String name;
    private int year;
    private int semester;
    private LocalDate startDate;
    private LocalDate endDate;
    private int createdBy;

    public ClassEntity() {}

    public ClassEntity(int id, String name, int year, int semester,
                       LocalDate startDate, LocalDate endDate, int createdBy) {
        this.id = id;
        this.name = name;
        this.year = year;
        this.semester = semester;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdBy = createdBy;
    }

    public ClassEntity(String name, int year, int semester,
                       LocalDate startDate, LocalDate endDate, int createdBy) {
        this.name = name;
        this.year = year;
        this.semester = semester;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdBy = createdBy;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    @Override
    public String toString() {
        return "ClassEntity{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", year=" + year +
                ", semester=" + semester +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", createdBy=" + createdBy +
                '}';
    }
}
