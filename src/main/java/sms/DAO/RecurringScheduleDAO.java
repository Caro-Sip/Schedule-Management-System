package sms.DAO;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.RecurringSchedule;

public class RecurringScheduleDAO {

    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    public boolean createSchedule(RecurringSchedule recurringSchedule) throws SQLException {
        String sql = "INSERT INTO recurring_schedules (id, teacherId, classroomId, courseId, dayOfWeek, startTime, endTime, effectiveFrom, effectiveUntil) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, recurringSchedule.getId());
            pstmt.setInt(2, recurringSchedule.getTeacherId());
            pstmt.setInt(3, recurringSchedule.getClassroomId());
            pstmt.setInt(4, recurringSchedule.getCourseId());
            pstmt.setInt(5, recurringSchedule.getDayOfWeek());
            pstmt.setTime(6, Time.valueOf(recurringSchedule.getStartTime()));
            pstmt.setTime(7, Time.valueOf(recurringSchedule.getEndTime()));
            pstmt.setDate(8, Date.valueOf(recurringSchedule.getEffectiveFrom()));
            pstmt.setDate(9, Date.valueOf(recurringSchedule.getEffectiveUntil()));

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating schedule: " + e.getMessage());
            return false;
        }
    }

    public RecurringSchedule getById(int id) {
        String sql = "SELECT id, teacherId, classroomId, courseId, dayOfWeek, startTime, endTime, effectiveFrom, effectiveUntil "
                + "FROM recurring_schedules WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new RecurringSchedule(
                            rs.getInt("id"),
                            rs.getInt("teacherId"),
                            rs.getInt("classroomId"),
                            rs.getInt("courseId"),
                            rs.getInt("dayOfWeek"),
                            rs.getTime("startTime"),
                            rs.getTime("endTime"),
                            rs.getDate("effectiveFrom"),
                            rs.getDate("effectiveUntil")
                    );
                }
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedule by ID: " + e.getMessage());
        }
        return null;
    }

    public List<RecurringSchedule> getByTeacherId(int teacherId) {
        String sql = "SELECT id, teacherId, classroomId, courseId, dayOfWeek, startTime, endTime, effectiveFrom, effectiveUntil "
                + "FROM recurring_schedules WHERE teacherId = ?";
        List<RecurringSchedule> schedules = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, teacherId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    schedules.add(new RecurringSchedule(
                            rs.getInt("id"),
                            rs.getInt("teacherId"),
                            rs.getInt("classroomId"),
                            rs.getInt("courseId"),
                            rs.getInt("dayOfWeek"),
                            rs.getTime("startTime"),
                            rs.getTime("endTime"),
                            rs.getDate("effectiveFrom"),
                            rs.getDate("effectiveUntil")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedules by teacher ID: " + e.getMessage());
        }
        return schedules;
    }

    public List<RecurringSchedule> getByClassroomId(int classroomId) {
        String sql = "SELECT id, teacherId, classroomId, courseId, dayOfWeek, startTime, endTime, effectiveFrom, effectiveUntil "
                + "FROM recurring_schedules WHERE classroomId = ?";
        List<RecurringSchedule> schedules = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classroomId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    schedules.add(new RecurringSchedule(
                            rs.getInt("id"),
                            rs.getInt("teacherId"),
                            rs.getInt("classroomId"),
                            rs.getInt("courseId"),
                            rs.getInt("dayOfWeek"),
                            rs.getTime("startTime"),
                            rs.getTime("endTime"),
                            rs.getDate("effectiveFrom"),
                            rs.getDate("effectiveUntil")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedules by classroom ID: " + e.getMessage());
        }
        return schedules;
    }

    public List<RecurringSchedule> getByCourseId(int courseId) {
        String sql = "SELECT id, teacherId, classroomId, courseId, dayOfWeek, startTime, endTime, effectiveFrom, effectiveUntil "
                + "FROM recurring_schedules WHERE courseId = ?";
        List<RecurringSchedule> schedules = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, courseId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    schedules.add(new RecurringSchedule(
                            rs.getInt("id"),
                            rs.getInt("teacherId"),
                            rs.getInt("classroomId"),
                            rs.getInt("courseId"),
                            rs.getInt("dayOfWeek"),
                            rs.getTime("startTime"),
                            rs.getTime("endTime"),
                            rs.getDate("effectiveFrom"),
                            rs.getDate("effectiveUntil")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedules by course ID: " + e.getMessage());
        }
        return schedules;
    }

    public boolean updateSchedule(RecurringSchedule recurringSchedule) {
        String sql = "UPDATE recurring_schedules SET teacherId = ?, classroomId = ?, courseId = ?, dayOfWeek = ?, "
                + "startTime = ?, endTime = ?, effectiveFrom = ?, effectiveUntil = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, recurringSchedule.getTeacherId());
            pstmt.setInt(2, recurringSchedule.getClassroomId());
            pstmt.setInt(3, recurringSchedule.getCourseId());
            pstmt.setInt(4, recurringSchedule.getDayOfWeek());
            pstmt.setTime(5, Time.valueOf(recurringSchedule.getStartTime()));
            pstmt.setTime(6, Time.valueOf(recurringSchedule.getEndTime()));
            pstmt.setDate(7, Date.valueOf(recurringSchedule.getEffectiveFrom()));
            pstmt.setDate(8, Date.valueOf(recurringSchedule.getEffectiveUntil()));
            pstmt.setInt(9, recurringSchedule.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error updating schedule: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteSchedule(int id) {
        String sql = "DELETE FROM recurring_schedules WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting schedule: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteAllSchedules() {
        String sql = "DELETE FROM recurring_schedules";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        } catch (SQLException e) {
            System.err.println("Error deleting all schedules: " + e.getMessage());
            return false;
        }
    }

    public boolean scheduleExists(int id) {
        String sql = "SELECT 1 FROM recurring_schedules WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            System.err.println("Error checking schedule existence: " + e.getMessage());
            return false;
        }
    }

    public int getScheduleCount() {
        String sql = "SELECT COUNT(*) FROM recurring_schedules";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("Error getting schedule count: " + e.getMessage());
        }
        return 0;
    }
}