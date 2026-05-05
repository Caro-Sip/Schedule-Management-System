package sms.Objects;

public class ClassStudent {
    private int classId;
    private int userId;

    public ClassStudent() {}

    public ClassStudent(int classId, int userId) {
        this.classId = classId;
        this.userId = userId;
    }

    public int getClassId() { return classId; }
    public void setClassId(int classId) { this.classId = classId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    @Override
    public String toString() {
        return "ClassStudent{" +
                "classId=" + classId +
                ", userId=" + userId +
                '}';
    }
}
