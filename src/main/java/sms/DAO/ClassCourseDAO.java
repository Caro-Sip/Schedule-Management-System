package sms.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

import sms.Config.DatabaseConfig;
import sms.Objects.Course;

public class ClassCourseDAO {

    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    public List<Integer> getCourseIdsByClassId(int classId) throws SQLException {
        String sql = "SELECT course_id FROM class_courses WHERE class_id = ? ORDER BY course_id";
        List<Integer> courseIds = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    courseIds.add(rs.getInt("course_id"));
                }
            }
        }

        return courseIds;
    }

    public List<Course> getCoursesByClassId(int classId) throws SQLException {
        String sql = "SELECT c.id, c.name, c.code, c.total_hours "
                + "FROM courses c "
                + "INNER JOIN class_courses cc ON cc.course_id = c.id "
                + "WHERE cc.class_id = ? "
                + "ORDER BY c.name, c.code, c.id";
        List<Course> courses = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    courses.add(new Course(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("code"),
                            rs.getInt("total_hours")
                    ));
                }
            }
        }

        return courses;
    }

    public boolean classHasCourse(int classId, int courseId) throws SQLException {
        String sql = "SELECT 1 FROM class_courses WHERE class_id = ? AND course_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            pstmt.setInt(2, courseId);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    public boolean addCourseToClass(int classId, int courseId) throws SQLException {
        String sql = "INSERT OR IGNORE INTO class_courses (class_id, course_id) VALUES (?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            pstmt.setInt(2, courseId);
            return pstmt.executeUpdate() > 0;
        }
    }

    public boolean removeCourseFromClass(int classId, int courseId) throws SQLException {
        String sql = "DELETE FROM class_courses WHERE class_id = ? AND course_id = ?";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, classId);
            pstmt.setInt(2, courseId);
            return pstmt.executeUpdate() > 0;
        }
    }

    public boolean replaceCoursesForClass(int classId, List<Integer> courseIds) throws SQLException {
        List<Integer> uniqueCourseIds = new ArrayList<>();
        if (courseIds != null) {
            uniqueCourseIds.addAll(new LinkedHashSet<>(courseIds));
        }

        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement deleteStmt = conn.prepareStatement("DELETE FROM class_courses WHERE class_id = ?")) {
                    deleteStmt.setInt(1, classId);
                    deleteStmt.executeUpdate();
                }

                if (!uniqueCourseIds.isEmpty()) {
                    try (PreparedStatement insertStmt = conn.prepareStatement(
                            "INSERT OR IGNORE INTO class_courses (class_id, course_id) VALUES (?, ?)")) {
                        for (int courseId : uniqueCourseIds) {
                            insertStmt.setInt(1, classId);
                            insertStmt.setInt(2, courseId);
                            insertStmt.addBatch();
                        }
                        insertStmt.executeBatch();
                    }
                }

                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }
}