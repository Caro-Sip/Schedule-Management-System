package sms.Service;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.Test;

import sms.DAO.ClassCourseDAO;
import sms.DAO.ClassEntityDAO;
import sms.DAO.ClassroomDAO;
import sms.DAO.CourseDAO;
import sms.DAO.RecurringScheduleDAO;
import sms.DAO.ScheduleClassDAO;
import sms.DAO.ScheduleDAO;
import sms.DAO.TeacherDAO;
import sms.DAO.TeacherCourseDAO;
import sms.Objects.Schedule;

public class ScheduleServiceTest {

    @Test
    public void testCreateScheduleWithValidTeacherCourseAssignment() throws Exception {
        // Stub all DAOs
        ClassroomDAO classroomDAO = new ClassroomDAO() {
            @Override
            public boolean classroomExists(int id) { return true; }
        };
        CourseDAO courseDAO = new CourseDAO() {
            @Override
            public boolean courseExists(int id) { return true; }
        };
        TeacherDAO teacherDAO = new TeacherDAO() {
            @Override
            public boolean teacherExists(int id) { return true; }
        };
        ClassEntityDAO classEntityDAO = new ClassEntityDAO() {
            @Override
            public boolean classExists(int id) { return true; }
        };
        ClassCourseDAO classCourseDAO = new ClassCourseDAO() {
            @Override
            public boolean classHasCourse(int classId, int courseId) { return true; }
        };
        TeacherCourseDAO teacherCourseDAO = new TeacherCourseDAO() {
            @Override
            public boolean teacherTeachesCourseToClass(int teacherId, int courseId, int classId) {
                // Teacher 1 teaches course to class, teacher 2 does not.
                return teacherId == 1;
            }
        };

        // ScheduleDAO returns true on createSchedule
        ScheduleDAO scheduleDAO = new ScheduleDAO() {
            @Override
            public boolean createSchedule(Schedule s) {
                s.setId(100); // Set dummy ID
                return true;
            }
        };

        ScheduleClassDAO scheduleClassDAO = new ScheduleClassDAO() {
            @Override
            public boolean createScheduleClass(int scheduleId, int classId) { return true; }
        };

        ScheduleService service = new ScheduleService(
                scheduleDAO,
                scheduleClassDAO,
                classEntityDAO,
                classCourseDAO,
                classroomDAO,
                courseDAO,
                teacherDAO,
                new RecurringScheduleDAO(),
                teacherCourseDAO
        );

        // Schedule with teacherId = 1 (assigned) should succeed
        Schedule schedule = service.createSchedule(
                1, // classroomId
                1, // teacherId (assigned)
                1, // courseId
                LocalDate.now(),
                LocalTime.of(9, 0),
                LocalTime.of(11, 0),
                "BOOKED",
                "VISIBLE",
                "DEFAULT",
                0,
                1,
                List.of(1),
                null
        );

        assertNotNull(schedule);
    }

    @Test
    public void testCreateScheduleWithInvalidTeacherCourseAssignmentThrowsException() throws Exception {
        // Stub all DAOs
        ClassroomDAO classroomDAO = new ClassroomDAO() {
            @Override
            public boolean classroomExists(int id) { return true; }
        };
        CourseDAO courseDAO = new CourseDAO() {
            @Override
            public boolean courseExists(int id) { return true; }
        };
        TeacherDAO teacherDAO = new TeacherDAO() {
            @Override
            public boolean teacherExists(int id) { return true; }
        };
        ClassEntityDAO classEntityDAO = new ClassEntityDAO() {
            @Override
            public boolean classExists(int id) { return true; }
        };
        ClassCourseDAO classCourseDAO = new ClassCourseDAO() {
            @Override
            public boolean classHasCourse(int classId, int courseId) { return true; }
        };
        TeacherCourseDAO teacherCourseDAO = new TeacherCourseDAO() {
            @Override
            public boolean teacherTeachesCourseToClass(int teacherId, int courseId, int classId) {
                // Teacher 1 teaches course to class, teacher 2 does not.
                return teacherId == 1;
            }
        };

        ScheduleService service = new ScheduleService(
                new ScheduleDAO(),
                new ScheduleClassDAO(),
                classEntityDAO,
                classCourseDAO,
                classroomDAO,
                courseDAO,
                teacherDAO,
                new RecurringScheduleDAO(),
                teacherCourseDAO
        );

        try {
            // Schedule with teacherId = 2 (not assigned) should fail validation
            service.createSchedule(
                    1, // classroomId
                    2, // teacherId (not assigned)
                    1, // courseId
                    LocalDate.now(),
                    LocalTime.of(9, 0),
                    LocalTime.of(11, 0),
                    "BOOKED",
                    "VISIBLE",
                    "DEFAULT",
                    0,
                    1,
                    List.of(1),
                    null
            );
            fail("Expected IllegalArgumentException for unassigned teacher");
        } catch (IllegalArgumentException e) {
            // Expect validation failure message
            if (!e.getMessage().contains("does not teach course")) {
                fail("Expected message to mention teacher course assignment validation failure, got: " + e.getMessage());
            }
        }
    }
}
