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

    // CREATE - Insert a new user
    public boolean createUser(Course course) {
        String sql = "INSERT INTO course (id, name, code, totalHours) VALUES (?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, course.getId());
            pstmt.setString(2, course.getName());
            pstmt.setString(3, course.getCode());
            pstmt.setInt(4, course.getTotalHours());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating user: " + e.getMessage());
            return false;
        }
    }

    // READ - Get user by ID
    public Course getId(int id) {
        String sql = "SELECT id, name, code, totalHours FROM course WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Course(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("code"),
                        rs.getInt("totalHours")

                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving user: " + e.getMessage());
        }
        return null;
    }

    // READ - Get user by email
    public Course getName(String name) {
        String sql = "SELECT id, name, code, totalHours FROM users WHERE name = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Course(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("code"),
                        rs.getInt("totalHours")

                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving user by email: " + e.getMessage());
        }
        return null;
    }

    // READ - Get all users
    public List<Course> getCode() {
        String sql = "SELECT id, name, code, totalHours  FROM code";
        List<Course> course = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Course user = new Course(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("code"),
                        rs.getInt("totalHours")
                );
                course.add(user);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving all users: " + e.getMessage());
        }
        return course;
    }

    // READ - Get all users by role
    public List<Course> getTotalHours(int totalHours ) {
        String sql = "SELECT id, name, code, totalHours FROM course WHERE totalHours = ?";
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
                        rs.getInt("totalHours")

                );
                courses.add(course);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving users by role: " + e.getMessage());
        }
        return courses;
    }

    // UPDATE - Update user information
    public boolean updateUser(Course course) {
        String sql = "UPDATE course SET id = ?, name = ?, code = ?, totalHours = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, course.getName());
            pstmt.setString(2, course.getCode());
            pstmt.setInt(3, course.getTotalHours());
            pstmt.setInt(4, course.getId());;

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error updating user: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete user by ID
    public boolean deleteUser(int id) {
        String sql = "DELETE FROM course WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting user: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete all users
    public boolean deleteAllUsers() {
        String sql = "DELETE FROM course";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        } catch (SQLException e) {
            System.err.println("Error deleting all users: " + e.getMessage());
            return false;
        }
    }

    // Check if user exists
    public boolean userExists(int id) {
        String sql = "SELECT 1 FROM courses WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            System.err.println("Error checking course existence: " + e.getMessage());
            return false;
        }
    }

    // Get user count
    public int getUserCount() {
        String sql = "SELECT COUNT(*) FROM courses";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("Error getting course count: " + e.getMessage());
        }
        return 0;
    }
}
