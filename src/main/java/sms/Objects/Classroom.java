package sms.Objects;

public class Classroom {
    private int id;
    private String name;
    private String building;

    public Classroom() {}

    public Classroom(int id, String name, String building) {
        this.id = id;
        this.name = name;
        this.building = building;
    }

    public Classroom(String name, String building) {
        this.name = name;
        this.building = building;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    @Override
    public String toString() {
        return "Classroom{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", building='" + building + '\'' +
                '}';
    }
}
