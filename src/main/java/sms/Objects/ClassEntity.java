package sms.Objects;

public class ClassEntity {
    private int id;
    private String name;
    private int year;
    private int createdBy;

    public ClassEntity() {}

    public ClassEntity(int id, String name, int year, int createdBy) {
        this.id = id;
        this.name = name;
        this.year = year;
        this.createdBy = createdBy;
    }

    public ClassEntity(String name, int year, int createdBy) {
        this.name = name;
        this.year = year;
        this.createdBy = createdBy;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    @Override
    public String toString() {
        return "ClassEntity{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", year=" + year +
                ", createdBy=" + createdBy +
                '}';
    }
}
