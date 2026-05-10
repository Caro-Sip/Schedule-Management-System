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

    // CREATE - Insert a new user
    public boolean createTeacher(Teacher teachers) {
        String sql = "INSERT INTO teachers (id,userId,department) VALUES (?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, teachers.getId());
            pstmt.setInt(2, teachers.getUserId());
            pstmt.setString(3, teachers.getDepartment());


            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating user: " + e.getMessage());
            return false;
        }
    }

    // READ - Get user by ID
    public Teacher getId(int id) {
        String sql = "SELECT id,userId,department FROM teachers WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Teacher(
                        rs.getInt("id"),
                        rs.getInt("userId"),
                        rs.getString("department")

                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving user by ID : " + e.getMessage());
        }
        return null;
    }

    // READ - Get user by id
    public Teacher getUserId(int userId) {
        String sql = "SELECT id,userId,department FROM users WHERE userId = ? = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Teacher(
                        rs.getInt("id"),
                        rs.getInt("userId"),
                        rs.getString("department")

                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving user by UserId: " + e.getMessage());
        }
        return null;
    }

    // READ - Get all users
    public List<Teacher> getDepartment(String department) {
        String sql = "SELECT id,userId,department FROM department WHERE department = ?";
        List<Teacher> teacher = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
               Teacher teachers = new Teacher(
                        rs.getInt("id"),
                        rs.getInt("userId"),
                        rs.getString("department")

                );
               teacher.add(teachers);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving all users: " + e.getMessage());
        }
        return teacher;
    }



    // UPDATE - Update user information
    public boolean updateUser(Teacher teacher) {
        String sql = "UPDATE teachers SET id = ?, userId = ?, department = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, teacher.getId());
            pstmt.setInt(2, teacher.getUserId());
            pstmt.setString(3, teacher.getDepartment());


            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error updating user: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete teacher by ID
    public boolean deleteUser(int id) {
        String sql = "DELETE FROM teachers WHERE id = ?";

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

    // DELETE - Delete all teachers
    public boolean deleteAllUsers() {
        String sql = "DELETE FROM teachers";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        } catch (SQLException e) {
            System.err.println("Error deleting all teachers: " + e.getMessage());
            return false;
        }
    }

    // Check if user exists
    public boolean userExists(int id) {
        String sql = "SELECT 1 FROM teachers WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            System.err.println("Error checking teacher existence: " + e.getMessage());
            return false;
        }
    }

    // Get teacher count
    public int getUserCount() {
        String sql = "SELECT COUNT(*) FROM teachers";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("Error getting teacher count: " + e.getMessage());
        }
        return 0;
    }
}


