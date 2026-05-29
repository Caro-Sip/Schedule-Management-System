package sms.DAO;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.RecurringSchedule;

public class RecurringScheduleDAO {

    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    public boolean createSchedule(RecurringSchedule recurringSchedule) throws SQLException {
        String sql = "INSERT INTO recurring_schedule (teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setInt(1, recurringSchedule.getTeacherId());
            pstmt.setInt(2, recurringSchedule.getClassroomId());
            pstmt.setInt(3, recurringSchedule.getCourseId());
            pstmt.setInt(4, recurringSchedule.getDayOfWeek());
            pstmt.setString(5, recurringSchedule.getStartTime().toString());
            pstmt.setString(6, recurringSchedule.getEndTime().toString());
            pstmt.setString(7, recurringSchedule.getEffectiveFrom().toString());
            if (recurringSchedule.getEffectiveUntil() != null) {
                pstmt.setString(8, recurringSchedule.getEffectiveUntil().toString());
            } else {
                pstmt.setNull(8, Types.VARCHAR);
            }

            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        recurringSchedule.setId(generatedKeys.getInt(1));
                    }
                }
            }
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating schedule: " + e.getMessage());
            return false;
        }
    }

    public RecurringSchedule getById(int id) {
        String sql = "SELECT id, teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until "
            + "FROM recurring_schedule WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new RecurringSchedule(
                            rs.getInt("id"),
                            rs.getInt("teacher_id"),
                            rs.getInt("classroom_id"),
                            rs.getInt("course_id"),
                            rs.getInt("day_of_week"),
                            LocalTime.parse(rs.getString("start_time")),
                            LocalTime.parse(rs.getString("end_time")),
                            LocalDate.parse(rs.getString("effective_from")),
                            rs.getString("effective_until") != null ? LocalDate.parse(rs.getString("effective_until")) : null
                    );
                }
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedule by ID: " + e.getMessage());
        }
        return null;
    }

    public List<RecurringSchedule> getByTeacherId(int teacherId) {
        String sql = "SELECT id, teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until "
            + "FROM recurring_schedule WHERE teacher_id = ?";
        List<RecurringSchedule> schedules = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, teacherId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    schedules.add(new RecurringSchedule(
                            rs.getInt("id"),
                            rs.getInt("teacher_id"),
                            rs.getInt("classroom_id"),
                            rs.getInt("course_id"),
                            rs.getInt("day_of_week"),
                            LocalTime.parse(rs.getString("start_time")),
                            LocalTime.parse(rs.getString("end_time")),
                            LocalDate.parse(rs.getString("effective_from")),
                            rs.getString("effective_until") != null ? LocalDate.parse(rs.getString("effective_until")) : null
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedules by teacher ID: " + e.getMessage());
        }
        return schedules;
    }

    public List<RecurringSchedule> getByClassroomId(int classroomId) {
        String sql = "SELECT id, teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until "
            + "FROM recurring_schedule WHERE classroom_id = ?";
        List<RecurringSchedule> schedules = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classroomId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    schedules.add(new RecurringSchedule(
                            rs.getInt("id"),
                            rs.getInt("teacher_id"),
                            rs.getInt("classroom_id"),
                            rs.getInt("course_id"),
                            rs.getInt("day_of_week"),
                            LocalTime.parse(rs.getString("start_time")),
                            LocalTime.parse(rs.getString("end_time")),
                            LocalDate.parse(rs.getString("effective_from")),
                            rs.getString("effective_until") != null ? LocalDate.parse(rs.getString("effective_until")) : null
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedules by classroom ID: " + e.getMessage());
        }
        return schedules;
    }

    public List<RecurringSchedule> getByCourseId(int courseId) {
        String sql = "SELECT id, teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until "
            + "FROM recurring_schedule WHERE course_id = ?";
        List<RecurringSchedule> schedules = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, courseId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    schedules.add(new RecurringSchedule(
                            rs.getInt("id"),
                            rs.getInt("teacher_id"),
                            rs.getInt("classroom_id"),
                            rs.getInt("course_id"),
                            rs.getInt("day_of_week"),
                            LocalTime.parse(rs.getString("start_time")),
                            LocalTime.parse(rs.getString("end_time")),
                            LocalDate.parse(rs.getString("effective_from")),
                            rs.getString("effective_until") != null ? LocalDate.parse(rs.getString("effective_until")) : null
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedules by course ID: " + e.getMessage());
        }
        return schedules;
    }

    public boolean updateSchedule(RecurringSchedule recurringSchedule) {
        String sql = "UPDATE recurring_schedule SET teacher_id = ?, classroom_id = ?, course_id = ?, day_of_week = ?, "
            + "start_time = ?, end_time = ?, effective_from = ?, effective_until = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, recurringSchedule.getTeacherId());
            pstmt.setInt(2, recurringSchedule.getClassroomId());
            pstmt.setInt(3, recurringSchedule.getCourseId());
            pstmt.setInt(4, recurringSchedule.getDayOfWeek());
            pstmt.setString(5, recurringSchedule.getStartTime().toString());
            pstmt.setString(6, recurringSchedule.getEndTime().toString());
            pstmt.setString(7, recurringSchedule.getEffectiveFrom().toString());
            if (recurringSchedule.getEffectiveUntil() != null) {
                pstmt.setString(8, recurringSchedule.getEffectiveUntil().toString());
            } else {
                pstmt.setNull(8, Types.VARCHAR);
            }
            pstmt.setInt(9, recurringSchedule.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error updating schedule: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteSchedule(int id) {
        String sql = "DELETE FROM recurring_schedule WHERE id = ?";

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
        String sql = "DELETE FROM recurring_schedule";

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
        String sql = "SELECT 1 FROM recurring_schedule WHERE id = ?";

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
        String sql = "SELECT COUNT(*) FROM recurring_schedule";

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