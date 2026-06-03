package sms.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

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
}
