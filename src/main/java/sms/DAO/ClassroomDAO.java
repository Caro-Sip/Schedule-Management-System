package sms.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.Classroom;

public class ClassroomDAO {

    // Helper method to get database connection
    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE - Insert a new classroom
    public boolean createClassroom(Classroom classroom) {
        String sql = "INSERT INTO classroom (id, name, building, capacity) VALUES (?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classroom.getId());
            pstmt.setString(2, classroom.getName());
            pstmt.setString(3, classroom.getBuilding());
            pstmt.setInt(4, classroom.getCapacity());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating classroom: " + e.getMessage());
            return false;
        }
    }

    // READ - Get classroom by ID
    public Classroom getClassroomById(int id) {
        String sql = "SELECT id, name, building, capacity FROM classroom WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Classroom(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("building"),
                        rs.getInt("capacity")
                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving classroom: " + e.getMessage());
        }
        return null;
    }

    // READ - Get classroom by name
    public Classroom getClassroomByName(String name) {
        String sql = "SELECT id, name, building, capacity FROM classroom WHERE name = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Classroom(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("building"),
                        rs.getInt("capacity")
                );
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving classroom by name: " + e.getMessage());
        }
        return null;
    }

    // READ - Get all classrooms
    public List<Classroom> getAllClassrooms() {
        String sql = "SELECT id, name, building, capacity FROM classroom";
        List<Classroom> classrooms = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Classroom classroom = new Classroom(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("building"),
                        rs.getInt("capacity")
                );
                classrooms.add(classroom);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving all classrooms: " + e.getMessage());
        }
        return classrooms;
    }

    // READ - Get classrooms by building
    public List<Classroom> getClassroomsByBuilding(String building) {
        String sql = "SELECT id, name, building, capacity FROM classroom WHERE building = ?";
        List<Classroom> classrooms = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, building);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                Classroom classroom = new Classroom(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("building"),
                        rs.getInt("capacity")
                );
                classrooms.add(classroom);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving classrooms by building: " + e.getMessage());
        }
        return classrooms;
    }

    // UPDATE - Update classroom information
    public boolean updateClassroom(Classroom classroom) {
        String sql = "UPDATE classroom SET name = ?, building = ?, capacity = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, classroom.getName());
            pstmt.setString(2, classroom.getBuilding());
            pstmt.setInt(3, classroom.getCapacity());
            pstmt.setInt(4, classroom.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error updating classroom: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete classroom by ID
    public boolean deleteClassroom(int id) {
        String sql = "DELETE FROM classroom WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting classroom: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete all classrooms
    public boolean deleteAllClassrooms() {
        String sql = "DELETE FROM classroom";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        } catch (SQLException e) {
            System.err.println("Error deleting all classrooms: " + e.getMessage());
            return false;
        }
    }

    // Check if classroom exists
    public boolean classroomExists(int id) {
        String sql = "SELECT 1 FROM classroom WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            System.err.println("Error checking classroom existence: " + e.getMessage());
            return false;
        }
    }

    // Get classroom count
    public int getClassroomCount() {
        String sql = "SELECT COUNT(*) FROM classroom";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("Error getting classroom count: " + e.getMessage());
        }
        return 0;
    }
}
