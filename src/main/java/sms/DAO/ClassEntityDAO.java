package sms.DAO;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.ClassEntity;
import sms.Objects.TimeSlot;

public class ClassEntityDAO {

    // Helper method to get database connection
    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE - Insert a new class
    public boolean createClass(ClassEntity classEntity) throws SQLException {
        String sql = "INSERT INTO classes (name, year, semester, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, classEntity.getName());
            pstmt.setInt(2, classEntity.getYear());
            pstmt.setInt(3, classEntity.getSemester());
            pstmt.setString(4, classEntity.getStartDate());
            pstmt.setString(5, classEntity.getEndDate());
            pstmt.setInt(6, classEntity.getCreatedBy());

            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        classEntity.setId(generatedKeys.getInt(1));
                    }
                }
            }
            return rowsAffected > 0;
        }
    }

    // READ - Get class by ID
    public ClassEntity getById(int id) throws SQLException {
        String sql = "SELECT id, name, year, semester, start_date, end_date, created_by FROM classes WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new ClassEntity(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getInt("year"),
                    rs.getInt("semester"),
                    rs.getString("start_date"),
                    rs.getString("end_date"),
                    rs.getInt("created_by")
                );
            }
        }
        return null;
    }

    // READ - Get class by name
    public ClassEntity getByName(String name) throws SQLException {
        String sql = "SELECT id, name, year, semester, start_date, end_date, created_by FROM classes WHERE name = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new ClassEntity(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getInt("year"),
                    rs.getInt("semester"),
                    rs.getString("start_date"),
                    rs.getString("end_date"),
                    rs.getInt("created_by")
                );
            }
        }
        return null;
    }

    // READ - Get all classes
    public List<ClassEntity> getAllClasses() throws SQLException {
        String sql = "SELECT id, name, year, semester, start_date, end_date, created_by FROM classes";
        List<ClassEntity> classEntities = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                ClassEntity classEntity = new ClassEntity(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getInt("year"),
                    rs.getInt("semester"),
                    rs.getString("start_date"),
                    rs.getString("end_date"),
                    rs.getInt("created_by")
                );
                classEntities.add(classEntity);
            }
        }
        return classEntities;
    }

    // READ - Get classes by year
    public List<ClassEntity> getByYear(int year) throws SQLException {
        String sql = "SELECT id, name, year, semester, start_date, end_date, created_by FROM classes WHERE year = ?";
        List<ClassEntity> classEntities = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, year);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                ClassEntity classEntity = new ClassEntity(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getInt("year"),
                    rs.getInt("semester"),
                    rs.getString("start_date"),
                    rs.getString("end_date"),
                    rs.getInt("created_by")
                );
                classEntities.add(classEntity);
            }
        }
        return classEntities;
    }

    // READ - Get classes by creator
    public List<ClassEntity> getByCreatedBy(int createdBy) throws SQLException {
        String sql = "SELECT id, name, year, semester, start_date, end_date, created_by FROM classes WHERE created_by = ?";
        List<ClassEntity> classEntities = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, createdBy);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                ClassEntity classEntity = new ClassEntity(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getInt("year"),
                    rs.getInt("semester"),
                    rs.getDate("start_date").toLocalDate().toString(),
                    rs.getDate("end_date").toLocalDate().toString(),
                    rs.getInt("created_by")
                );
                classEntities.add(classEntity);
            }
        }
        return classEntities;
    }

    // READ - Get classes by time slot
    public List<ClassEntity> getByTimeSlot(TimeSlot slot) throws SQLException {
        String sql = "SELECT DISTINCT c.id, c.name, c.year, c.semester, c.start_date, c.end_date, c.created_by "
                + "FROM classes c "
                + "JOIN schedule_classes sc ON sc.class_id = c.id "
                + "JOIN schedule s ON s.id = sc.schedule_id "
                + "WHERE s.date = ? AND s.start_time = ? AND s.end_time = ?";
        List<ClassEntity> classEntities = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDate(1, Date.valueOf(slot.getDate()));
            pstmt.setTime(2, Time.valueOf(slot.getStartTime()));
            pstmt.setTime(3, Time.valueOf(slot.getEndTime()));
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                ClassEntity classEntity = new ClassEntity(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getInt("year"),
                    rs.getInt("semester"),
                    rs.getDate("start_date").toLocalDate().toString(),
                    rs.getDate("end_date").toLocalDate().toString(),
                    rs.getInt("created_by")
                );
                classEntities.add(classEntity);
            }
        }
        return classEntities;
    }

    // UPDATE - Update class information
    public boolean updateClass(ClassEntity classEntity) throws SQLException {
        String sql = "UPDATE classes SET name = ?, year = ?, semester = ?, start_date = ?, end_date = ?, created_by = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, classEntity.getName());
            pstmt.setInt(2, classEntity.getYear());
            pstmt.setInt(3, classEntity.getSemester());
            pstmt.setString(4, classEntity.getStartDate());
            pstmt.setString(5, classEntity.getEndDate());
            pstmt.setInt(6, classEntity.getCreatedBy());
            pstmt.setInt(7, classEntity.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // DELETE - Delete class by ID
    public boolean deleteClass(int id) throws SQLException {
        String sql = "DELETE FROM classes WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // DELETE - Delete all classes
    public boolean deleteAllClasses() throws SQLException {
        String sql = "DELETE FROM classes";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        }
    }

    // UPDATE - Cancel schedules linked to a class
    public int cancelSchedulesForClass(int classId) throws SQLException {
        String sql = "UPDATE schedule SET status = 'CANCELLED' "
                + "WHERE id IN (SELECT schedule_id FROM schedule_classes WHERE class_id = ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            return pstmt.executeUpdate();
        }
    }

    // Check if class exists
    public boolean classExists(int id) throws SQLException {
        String sql = "SELECT 1 FROM classes WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        }
    }

    // Get class count
    public int getClassCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM classes";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }
}
