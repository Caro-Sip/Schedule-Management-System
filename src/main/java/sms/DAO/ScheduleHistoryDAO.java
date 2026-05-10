package sms.DAO;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.ScheduleHistory;

public class ScheduleHistoryDAO {

    // Helper method to get database connection
    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE - Insert a new schedule history
    public boolean createScheduleHistory(ScheduleHistory scheduleHistory) {
        String sql = "INSERT INTO schedule_history (scheduleId, action, changedBy, timestamp, note) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, scheduleHistory.getScheduleId());
            pstmt.setString(2, scheduleHistory.getAction());
            pstmt.setInt(3, scheduleHistory.getChangedBy());
            pstmt.setTimestamp(4, Timestamp.valueOf(scheduleHistory.getTimestamp()));
            pstmt.setString(5, scheduleHistory.getNote());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating schedule history: " + e.getMessage());
            return false;
        }
    }

    // READ - Get schedule history by ID
    public ScheduleHistory getById(int id) {
        String sql = "SELECT id, scheduleId, action, changedBy, timestamp, note FROM schedule_history WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                ScheduleHistory history = new ScheduleHistory();
                history.setId(rs.getInt("id"));
                history.setScheduleId(rs.getInt("scheduleId"));
                history.setAction(rs.getString("action"));
                history.setChangedBy(rs.getInt("changedBy"));
                history.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());
                history.setNote(rs.getString("note"));
                return history;
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedule history: " + e.getMessage());
        }
        return null;
    }

    // READ - Get schedule histories by scheduleId
    public List<ScheduleHistory> getByScheduleId(int scheduleId) {
        String sql = "SELECT id, scheduleId, action, changedBy, timestamp, note FROM schedule_history WHERE scheduleId = ?";
        List<ScheduleHistory> histories = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, scheduleId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                ScheduleHistory history = new ScheduleHistory();
                history.setId(rs.getInt("id"));
                history.setScheduleId(rs.getInt("scheduleId"));
                history.setAction(rs.getString("action"));
                history.setChangedBy(rs.getInt("changedBy"));
                history.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());
                history.setNote(rs.getString("note"));
                histories.add(history);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedule histories by scheduleId: " + e.getMessage());
        }
        return histories;
    }

    // READ - Get all schedule histories
    public List<ScheduleHistory> getAll() {
        String sql = "SELECT id, scheduleId, action, changedBy, timestamp, note FROM schedule_history";
        List<ScheduleHistory> histories = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                ScheduleHistory history = new ScheduleHistory();
                history.setId(rs.getInt("id"));
                history.setScheduleId(rs.getInt("scheduleId"));
                history.setAction(rs.getString("action"));
                history.setChangedBy(rs.getInt("changedBy"));
                history.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());
                history.setNote(rs.getString("note"));
                histories.add(history);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving all schedule histories: " + e.getMessage());
        }
        return histories;
    }

    // READ - Get schedule histories by changedBy
    public List<ScheduleHistory> getByChangedBy(int changedBy) {
        String sql = "SELECT id, scheduleId, action, changedBy, timestamp, note FROM schedule_history WHERE changedBy = ?";
        List<ScheduleHistory> histories = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, changedBy);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                ScheduleHistory history = new ScheduleHistory();
                history.setId(rs.getInt("id"));
                history.setScheduleId(rs.getInt("scheduleId"));
                history.setAction(rs.getString("action"));
                history.setChangedBy(rs.getInt("changedBy"));
                history.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());
                history.setNote(rs.getString("note"));
                histories.add(history);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedule histories by changedBy: " + e.getMessage());
        }
        return histories;
    }

    // UPDATE - Update schedule history
    public boolean updateScheduleHistory(ScheduleHistory scheduleHistory) {
        String sql = "UPDATE schedule_history SET scheduleId = ?, action = ?, changedBy = ?, timestamp = ?, note = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, scheduleHistory.getScheduleId());
            pstmt.setString(2, scheduleHistory.getAction());
            pstmt.setInt(3, scheduleHistory.getChangedBy());
            pstmt.setTimestamp(4, Timestamp.valueOf(scheduleHistory.getTimestamp()));
            pstmt.setString(5, scheduleHistory.getNote());
            pstmt.setInt(6, scheduleHistory.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error updating schedule history: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete schedule history by ID
    public boolean deleteById(int id) {
        String sql = "DELETE FROM schedule_history WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting schedule history: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete all schedule histories
    public boolean deleteAll() {
        String sql = "DELETE FROM schedule_history";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        } catch (SQLException e) {
            System.err.println("Error deleting all schedule histories: " + e.getMessage());
            return false;
        }
    }

    // Check if schedule history exists
    public boolean scheduleHistoryExists(int id) {
        String sql = "SELECT 1 FROM schedule_history WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            System.err.println("Error checking schedule history existence: " + e.getMessage());
            return false;
        }
    }

    // Get schedule history count
    public int getCount() {
        String sql = "SELECT COUNT(*) FROM schedule_history";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("Error getting schedule history count: " + e.getMessage());
        }
        return 0;
    }
}
