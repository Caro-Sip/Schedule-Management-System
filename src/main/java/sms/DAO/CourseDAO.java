package sms.DAO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.Course;

public class CourseDAO {

    // Helper method to get database connection
    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE - Insert a new course
    public boolean createCourse(Course course) throws SQLException {
        String sql = "INSERT INTO courses (name, code, total_hours) VALUES (?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, course.getName());
            pstmt.setString(2, course.getCode());
            pstmt.setInt(3, course.getTotalHours());

            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        course.setId(generatedKeys.getInt(1));
                    }
                }
            }
            return rowsAffected > 0;
        }
    }

    // READ - Get course by ID
    public Course getById(int id) throws SQLException {
        String sql = "SELECT id, name, code, total_hours FROM courses WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Course(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("code"),
                        rs.getInt("total_hours")
                );
            }
        }
        return null;
    }

    // READ - Get course by code
    public Course getByCode(String code) throws SQLException {
        String sql = "SELECT id, name, code, total_hours FROM courses WHERE code = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, code);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Course(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("code"),
                        rs.getInt("total_hours")
                );
            }
        }
        return null;
    }

    // READ - Get all courses
    public List<Course> getAllCourses() throws SQLException {
        String sql = "SELECT id, name, code, total_hours FROM courses";
        List<Course> courses = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Course course = new Course(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("code"),
                        rs.getInt("total_hours")
                );
                courses.add(course);
            }
        }
        return courses;
    }

    // READ - Get courses by total hours
    public List<Course> getByTotalHours(int totalHours) throws SQLException {
        String sql = "SELECT id, name, code, total_hours FROM courses WHERE total_hours = ?";
        List<Course> courses = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, totalHours);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                Course course = new Course(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("code"),
                        rs.getInt("total_hours")
                );
                courses.add(course);
            }
        }
        return courses;
    }

    // UPDATE - Update course information
    public boolean updateCourse(Course course) throws SQLException {
        String sql = "UPDATE courses SET name = ?, code = ?, total_hours = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, course.getName());
            pstmt.setString(2, course.getCode());
            pstmt.setInt(3, course.getTotalHours());
            pstmt.setInt(4, course.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // DELETE - Delete course by ID
    public boolean deleteCourse(int id) throws SQLException {
        String sql = "DELETE FROM courses WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // DELETE - Delete all courses
    public boolean deleteAllCourses() throws SQLException {
        String sql = "DELETE FROM courses";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        }
    }

    // Check if course exists
    public boolean courseExists(int id) throws SQLException {
        String sql = "SELECT 1 FROM courses WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        }
    }

    // Get course count
    public int getCourseCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM courses";

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
