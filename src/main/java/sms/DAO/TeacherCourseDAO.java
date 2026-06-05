package sms.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import sms.Config.DatabaseConfig;

public class TeacherCourseDAO {

    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    public boolean teacherTeachesCourseToClass(int teacherId, int courseId, int classId) throws SQLException {
        String sql = "SELECT 1 FROM teacher_courses WHERE teacher_id = ? AND course_id = ? AND class_id = ?";
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, teacherId);
            pstmt.setInt(2, courseId);
            pstmt.setInt(3, classId);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    public List<Map<String, Object>> getAllTeacherCourses() throws SQLException {
        String sql = "SELECT teacher_id, course_id, class_id, hours_taught FROM teacher_courses";
        List<Map<String, Object>> list = new ArrayList<>();
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("teacherId", rs.getInt("teacher_id"));
                map.put("courseId", rs.getInt("course_id"));
                map.put("classId", rs.getInt("class_id"));
                map.put("hoursTaught", rs.getInt("hours_taught"));
                list.add(map);
            }
        }
        return list;
    }
}
