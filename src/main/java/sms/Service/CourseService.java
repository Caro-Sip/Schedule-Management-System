package sms.Service;

import java.sql.SQLException;
import java.util.List;

import sms.DAO.CourseDAO;
import sms.Objects.Course;

public class CourseService {
    private final CourseDAO courseDAO;

    public CourseService() {
        this(new CourseDAO());
    }

    public CourseService(CourseDAO courseDAO) {
        this.courseDAO = courseDAO;
    }

    public List<Course> getAllCourses() {
        try {
            return courseDAO.getAllCourses();
        } catch (SQLException e) {
            throw new RuntimeException("Failed to retrieve courses", e);
        }
    }

    public Course getByCode(String code) {
        String normalizedCode = normalizeCode(code);

        try {
            return courseDAO.getByCode(normalizedCode);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to retrieve course by code", e);
        }
    }

    public void createCourse(Course course) {
        if (course == null) {
            throw new IllegalArgumentException("Course cannot be empty");
        }

        String normalizedName = normalizeName(course.getName());
        String normalizedCode = normalizeCode(course.getCode());

        course.setName(normalizedName);
        course.setCode(normalizedCode);

        if (course.getTotalHours() <= 0) {
            throw new IllegalArgumentException("Total hours must be positive");
        }

        try {
            if (!courseDAO.createCourse(course)) {
                throw new RuntimeException("Course was not created");
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create course", e);
        }
    }

    private String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Course name cannot be empty");
        }
        return name.trim();
    }

    private String normalizeCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Course code cannot be empty");
        }
        return code.trim();
    }
}
