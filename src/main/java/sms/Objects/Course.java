package sms.Objects;

public class Course {
    private int id;
    private String name;
    private String code;
    private int totalHours;

    public Course() {}

    public Course(int id, String name, String code, int totalHours) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.totalHours = totalHours;
    }

    public Course(String name, String code, int totalHours) {
        this.name = name;
        this.code = code;
        this.totalHours = totalHours;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public int getTotalHours() { return totalHours; }
    public void setTotalHours(int totalHours) { this.totalHours = totalHours; }

    @Override
    public String toString() {
        return "Course{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", code='" + code + '\'' +
                ", totalHours=" + totalHours +
                '}';
    }
}
