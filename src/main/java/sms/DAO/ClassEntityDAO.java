package sms.DAO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.ClassEntity;

public class ClassEntityDAO {

    // Helper method to get database connection
    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE - Insert a new user
    public boolean createUser(ClassEntity class_entity) {
        String sql = "INSERT INTO class_entity (id,name,year,createdBy) VALUES (?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, class_entity.getId());
            pstmt.setString(2, class_entity.getName());
            pstmt.setInt(3, class_entity.getYear());
            pstmt.setInt(4, class_entity.getCreatedBy());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating user: " + e.getMessage());
            return false;
        }
    }

    // READ - Get user by ID
    public ClassEntity getId(int id) {
        String sql = "SELECT id, name,year, createdBy  FROM class_entity WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new ClassEntity(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getInt("year"),
                        rs.getInt("createdBy")

                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving user: " + e.getMessage());
        }
        return null;
    }

    // READ - Get user by email
    public ClassEntity getName(String name) {
        String sql = "SELECT id, name, year, createdBy FROM class_entity WHERE email = ?"; //why is this error

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new ClassEntity(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getInt("year"),
                        rs.getInt("createdBy")
                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving user by email: " + e.getMessage());
        }
        return null;
    }

    // READ - Get all users
    public List<ClassEntity> getYear(int year) {
        String sql = "SELECT id, name,year, createdBy FROM class_entity";
        List<ClassEntity> classEntity = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                ClassEntity class_entity = new ClassEntity(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getInt("year"),
                        rs.getInt("createdBy")

                );
                classEntity.add(class_entity);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving all users: " + e.getMessage());
        }
        return classEntity;
    }

    // READ - Get all users by role
    public List<ClassEntity> getCreatedBy(int createdBy) {
        String sql = "SELECT id, name,year,createdBy FROM class_entity WHERE role = ?";
        List<ClassEntity> classEntity = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, createdBy);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                ClassEntity class_entity = new ClassEntity(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getInt("year"),
                        rs.getInt("createdBy")

                );
                classEntity.add(class_entity);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving users by role: " + e.getMessage());
        }
        return classEntity;
    }

    // UPDATE - Update user information
    public boolean updateUser(ClassEntity class_entity) {
        String sql = "UPDATE users SET id = ?, name = ?, year = ?, createdBy = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, class_entity.getId());
            pstmt.setString(2, class_entity.getName());
            pstmt.setInt(3, class_entity.getYear());
            pstmt.setInt(4, class_entity.getCreatedBy());
            pstmt.setInt(5, class_entity.getId());

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
