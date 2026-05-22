package sms.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import sms.Config.DatabaseConfig;

public class ScheduleClassDAO {

    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    public boolean createScheduleClass(int scheduleId, int classId) throws SQLException {
        String sql = "INSERT INTO schedule_classes (schedule_id, class_id) VALUES (?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, scheduleId);
            pstmt.setInt(2, classId);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    public boolean deleteScheduleClass(int scheduleId, int classId) throws SQLException {
        String sql = "DELETE FROM schedule_classes WHERE schedule_id = ? AND class_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, scheduleId);
            pstmt.setInt(2, classId);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        }
    }

    public int deleteByClassId(int classId) throws SQLException {
        String sql = "DELETE FROM schedule_classes WHERE class_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            return pstmt.executeUpdate();
        }
    }

    public int deleteByClassAndTeacher(int classId, int teacherId) throws SQLException {
        String sql = "DELETE FROM schedule_classes WHERE class_id = ? AND schedule_id IN (SELECT id FROM schedule WHERE teacher_id = ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            pstmt.setInt(2, teacherId);
            return pstmt.executeUpdate();
        }
    }

    public List<Integer> getScheduleIdsByClassId(int classId) throws SQLException {
        String sql = "SELECT schedule_id FROM schedule_classes WHERE class_id = ?";
        List<Integer> scheduleIds = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                scheduleIds.add(rs.getInt("schedule_id"));
            }
        }
        return scheduleIds;
    }

    public List<Integer> getClassIdsByScheduleId(int scheduleId) throws SQLException {
        String sql = "SELECT class_id FROM schedule_classes WHERE schedule_id = ?";
        List<Integer> classIds = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, scheduleId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                classIds.add(rs.getInt("class_id"));
            }
        }
        return classIds;
    }
}
