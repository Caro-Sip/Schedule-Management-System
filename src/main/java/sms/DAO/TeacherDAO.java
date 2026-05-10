package sms.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.Teacher;

public class TeacherDAO {
    // Helper method to get database connection
    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE - Insert a new teacher
    public boolean createTeacher(Teacher teacher) throws SQLException {
        String sql = "INSERT INTO teachers (user_id, department) VALUES (?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setInt(1, teacher.getUserId());
            pstmt.setString(2, teacher.getDepartment());

            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        teacher.setId(generatedKeys.getInt(1));
                    }
                }
            }
            return rowsAffected > 0;
        }
    }

    // READ - Get teacher by ID
    public Teacher getById(int id) throws SQLException {
        String sql = "SELECT id, user_id, department FROM teachers WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Teacher(
                        rs.getInt("id"),
                        rs.getInt("user_id"),
                        rs.getString("department")
                );
            }
        }
        return null;
    }

    // READ - Get teacher by user ID
    public Teacher getByUserId(int userId) throws SQLException {
        String sql = "SELECT id, user_id, department FROM teachers WHERE user_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Teacher(
                        rs.getInt("id"),
                        rs.getInt("user_id"),
                        rs.getString("department")
                );
            }
        }
        return null;
    }

    // READ - Get teachers by department
    public List<Teacher> getByDepartment(String department) throws SQLException {
        String sql = "SELECT id, user_id, department FROM teachers WHERE department = ?";
        List<Teacher> teachers = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, department);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                teachers.add(new Teacher(
                        rs.getInt("id"),
                        rs.getInt("user_id"),
                        rs.getString("department")
                ));
            }
        }
        return teachers;
    }

    // READ - Get all teachers
    public List<Teacher> getAllTeachers() throws SQLException {
        String sql = "SELECT id, user_id, department FROM teachers";
        List<Teacher> teachers = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                teachers.add(new Teacher(
                        rs.getInt("id"),
                        rs.getInt("user_id"),
                        rs.getString("department")
                ));
            }
        }
        return teachers;
    }

    // UPDATE - Update teacher information
    public boolean updateTeacher(Teacher teacher) throws SQLException {
        String sql = "UPDATE teachers SET user_id = ?, department = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, teacher.getUserId());
            pstmt.setString(2, teacher.getDepartment());
            pstmt.setInt(3, teacher.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    public boolean updateTeacherDepartment(int teacherId, String department) throws SQLException {
        String sql = "UPDATE teachers SET department = ? WHERE id = ?";

        try(Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)){

            pstmt.setString(1, department);
            pstmt.setInt(2,teacherId);

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // DELETE - Delete teacher by ID
    public boolean deleteTeacher(int id) throws SQLException {
        String sql = "DELETE FROM teachers WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // DELETE - Delete all teachers
    public boolean deleteAllTeachers() throws SQLException {
        String sql = "DELETE FROM teachers";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        }
    }

    // Check if teacher exists
    public boolean teacherExists(int id) throws SQLException {
        String sql = "SELECT 1 FROM teachers WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        }
    }

    // Get teacher count
    public int getTeacherCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM teachers";

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
