package sms.DAO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import sms.Config.DatabaseConfig;
import sms.Objects.ScheduleClass;

public class ScheduleClassDAO {

    // Helper method to get database connection
    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE - Insert a new user
    public boolean createUser(ScheduleClass schedule_class) {
        String sql = "INSERT INTO users (scheduelId, classId) VALUES (?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, schedule_class.getScheduleId());
            pstmt.setInt(2, schedule_class.getClassId());


            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating user: " + e.getMessage());
            return false;
        }
    }

    // READ - Get user by ID
    public ScheduleClass getScheduleId(int id) {
        String sql = "SELECT id, name, email, password_hash, role FROM users WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new ScheduleClass(
                        rs.getInt("scheduleId"),
                        rs.getInt("classId")
                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving user: " + e.getMessage());
        }
        return null;
    }

    // READ - Get user by id
    public ScheduleClass getClassId(int classId) {
        String sql = "SELECT scheduleId, classId FROM users WHERE email = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new ScheduleClass(
                        rs.getInt("scheduleId"),
                        rs.getInt("scheduleId")


                        );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving user by email: " + e.getMessage());
        }
        return null;
    }

    //

    // UPDATE - Update user information
    public boolean updateUser(ScheduleClass schedule_class) {
        String sql = "UPDATE users SET name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, schedule_class.getScheduleId());
            pstmt.setInt(1, schedule_class.getClassId());


            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error updating user: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete user by ID
    public boolean deleteUser(int id) {
        String sql = "DELETE FROM users WHERE id = ?";

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
        String sql = "DELETE FROM users";

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
        String sql = "SELECT 1 FROM users WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            System.err.println("Error checking user existence: " + e.getMessage());
            return false;
        }
    }

    // Get user count
    public int getUserCount() {
        String sql = "SELECT COUNT(*) FROM users";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("Error getting user count: " + e.getMessage());
        }
        return 0;
    }
}
