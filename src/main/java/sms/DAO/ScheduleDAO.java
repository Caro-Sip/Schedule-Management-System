package sms.DAO;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.Schedule;

public class ScheduleDAO {

    // Helper method to get database connection
    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE - Insert a new schedule
    public boolean createSchedule(Schedule schedule) {
        String sql = "INSERT INTO schedule (classroom_id, teacher_id, course_id, date, start_time, end_time, status, visibility, type, priority, created_by, created_at, greyed_at, linked_schedule_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setInt(1, schedule.getClassroomId());
            pstmt.setObject(2, schedule.getTeacherId(), Types.INTEGER);
            pstmt.setInt(3, schedule.getCourseId());
            pstmt.setDate(4, Date.valueOf(schedule.getDate()));
            pstmt.setTime(5, Time.valueOf(schedule.getStartTime()));
            pstmt.setTime(6, Time.valueOf(schedule.getEndTime()));
            pstmt.setString(7, schedule.getStatus());
            pstmt.setString(8, schedule.getVisibility());
            pstmt.setString(9, schedule.getType());
            pstmt.setInt(10, schedule.getPriority());
            pstmt.setInt(11, schedule.getCreatedBy());
            pstmt.setTimestamp(12, Timestamp.valueOf(schedule.getCreatedAt()));
            pstmt.setTimestamp(13, schedule.getGreyedAt() != null ? Timestamp.valueOf(schedule.getGreyedAt()) : null);
            pstmt.setObject(14, schedule.getLinkedScheduleId(), Types.INTEGER);

            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        schedule.setId(generatedKeys.getInt(1));
                    }
                }
            }
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error creating schedule: " + e.getMessage());
            return false;
        }
    }

    // READ - Get schedule by ID
    public Schedule getScheduleById(int id) {
        String sql = "SELECT id, classroom_id, teacher_id, course_id, date, start_time, end_time, status, visibility, type, priority, created_by, created_at, greyed_at, linked_schedule_id FROM schedule WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                Schedule schedule = new Schedule();
                schedule.setId(rs.getInt("id"));
                schedule.setClassroomId(rs.getInt("classroom_id"));
                schedule.setTeacherId((Integer) rs.getObject("teacher_id"));
                schedule.setCourseId(rs.getInt("course_id"));
                schedule.setDate(rs.getDate("date").toLocalDate());
                schedule.setStartTime(rs.getTime("start_time").toLocalTime());
                schedule.setEndTime(rs.getTime("end_time").toLocalTime());
                schedule.setStatus(rs.getString("status"));
                schedule.setVisibility(rs.getString("visibility"));
                schedule.setType(rs.getString("type"));
                schedule.setPriority(rs.getInt("priority"));
                schedule.setCreatedBy(rs.getInt("created_by"));
                schedule.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                Timestamp greyedAt = rs.getTimestamp("greyed_at");
                schedule.setGreyedAt(greyedAt != null ? greyedAt.toLocalDateTime() : null);
                schedule.setLinkedScheduleId(rs.getInt("linked_schedule_id"));
                if (rs.wasNull()) schedule.setLinkedScheduleId(null);
                return schedule;
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving schedule: " + e.getMessage());
        }
        return null;
    }

    // READ - Get all schedules
    public List<Schedule> getAllSchedules() {
        String sql = "SELECT id, classroom_id, teacher_id, course_id, date, start_time, end_time, status, visibility, type, priority, created_by, created_at, greyed_at, linked_schedule_id FROM schedule";
        List<Schedule> schedules = new ArrayList<>();

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Schedule schedule = new Schedule();
                schedule.setId(rs.getInt("id"));
                schedule.setClassroomId(rs.getInt("classroom_id"));
                schedule.setTeacherId((Integer) rs.getObject("teacher_id"));
                schedule.setCourseId(rs.getInt("course_id"));
                schedule.setDate(rs.getDate("date").toLocalDate());
                schedule.setStartTime(rs.getTime("start_time").toLocalTime());
                schedule.setEndTime(rs.getTime("end_time").toLocalTime());
                schedule.setStatus(rs.getString("status"));
                schedule.setVisibility(rs.getString("visibility"));
                schedule.setType(rs.getString("type"));
                schedule.setPriority(rs.getInt("priority"));
                schedule.setCreatedBy(rs.getInt("created_by"));
                schedule.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                Timestamp greyedAt = rs.getTimestamp("greyed_at");
                schedule.setGreyedAt(greyedAt != null ? greyedAt.toLocalDateTime() : null);
                schedule.setLinkedScheduleId(rs.getInt("linked_schedule_id"));
                if (rs.wasNull()) schedule.setLinkedScheduleId(null);
                schedules.add(schedule);
            }
        } catch (SQLException e) {
            System.err.println("Error retrieving all schedules: " + e.getMessage());
        }
        return schedules;
    }

    // UPDATE - Update schedule information
    public boolean updateSchedule(Schedule schedule) {
        String sql = "UPDATE schedule SET classroom_id = ?, teacher_id = ?, course_id = ?, date = ?, start_time = ?, end_time = ?, status = ?, visibility = ?, type = ?, priority = ?, created_by = ?, created_at = ?, greyed_at = ?, linked_schedule_id = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, schedule.getClassroomId());
            pstmt.setObject(2, schedule.getTeacherId(), Types.INTEGER);
            pstmt.setInt(3, schedule.getCourseId());
            pstmt.setDate(4, Date.valueOf(schedule.getDate()));
            pstmt.setTime(5, Time.valueOf(schedule.getStartTime()));
            pstmt.setTime(6, Time.valueOf(schedule.getEndTime()));
            pstmt.setString(7, schedule.getStatus());
            pstmt.setString(8, schedule.getVisibility());
            pstmt.setString(9, schedule.getType());
            pstmt.setInt(10, schedule.getPriority());
            pstmt.setInt(11, schedule.getCreatedBy());
            pstmt.setTimestamp(12, Timestamp.valueOf(schedule.getCreatedAt()));
            pstmt.setTimestamp(13, schedule.getGreyedAt() != null ? Timestamp.valueOf(schedule.getGreyedAt()) : null);
            pstmt.setObject(14, schedule.getLinkedScheduleId(), Types.INTEGER);
            pstmt.setInt(15, schedule.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Error updating schedule: " + e.getMessage());
            return false;
        }
    }

    // DELETE - Delete schedule by ID
    public boolean deleteSchedule(int id) {
        String sql = "DELETE FROM schedule WHERE id = ?";

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

    // DELETE - Delete all schedules
    public boolean deleteAllSchedules() {
        String sql = "DELETE FROM schedule";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            return true;
        } catch (SQLException e) {
            System.err.println("Error deleting all schedules: " + e.getMessage());
            return false;
        }
    }

    // Check if schedule exists
    public boolean scheduleExists(int id) {
        String sql = "SELECT 1 FROM schedule WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            System.err.println("Error checking schedule existence: " + e.getMessage());
            return false;
        }
    }

    // Get schedule count
    public int getScheduleCount() {
        String sql = "SELECT COUNT(*) FROM schedule";

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
