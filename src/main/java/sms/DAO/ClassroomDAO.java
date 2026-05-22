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
    public boolean createClassroom(Classroom classroom) throws SQLException {
        String sql = "INSERT INTO classrooms (name, building) VALUES (?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, classroom.getName());
            pstmt.setString(2, classroom.getBuilding());

            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        classroom.setId(generatedKeys.getInt(1));
                    }
                }
            }
            return rowsAffected > 0;
        }
    }

    // READ - Get classroom by ID
    public Classroom getClassroomById(int id) throws SQLException {
        String sql = "SELECT id, name, building FROM classrooms WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Classroom(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("building")
                );
            }
        }
        return null;
    }

    // READ - Get classroom by name
    public Classroom getClassroomByName(String name) throws SQLException {
        String sql = "SELECT id, name, building FROM classrooms WHERE name = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Classroom(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("building")
                );
            }
        }
        return null;
    }

    // READ - Get all classrooms
    public List<Classroom> getAllClassrooms() throws SQLException {
        String sql = "SELECT id, name, building FROM classrooms";
        List<Classroom> classrooms = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Classroom classroom = new Classroom(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("building")
                );
                classrooms.add(classroom);
            }
        }
        return classrooms;
    }

    // READ - Get classrooms by building
    public List<Classroom> getClassroomsByBuilding(String building) throws SQLException {
        String sql = "SELECT id, name, building FROM classrooms WHERE building = ?";
        List<Classroom> classrooms = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, building);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                Classroom classroom = new Classroom(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("building")
                );
                classrooms.add(classroom);
            }
        }
        return classrooms;
    }

    // UPDATE - Update classroom information
    public boolean updateClassroom(Classroom classroom) throws SQLException {
        String sql = "UPDATE classrooms SET name = ?, building = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, classroom.getName());
            pstmt.setString(2, classroom.getBuilding());
            pstmt.setInt(3, classroom.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // DELETE - Delete classroom by ID
    public boolean deleteClassroom(int id) throws SQLException {
        String sql = "DELETE FROM classrooms WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // DELETE - Delete all classrooms
    public boolean deleteAllClassrooms() throws SQLException {
        String sql = "DELETE FROM classrooms";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        }
    }

    // Check if classroom exists
    public boolean classroomExists(int id) throws SQLException {
        String sql = "SELECT 1 FROM classrooms WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        }
    }

    // Get classroom count
    public int getClassroomCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM classrooms";

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
