package sms;

import io.javalin.Javalin;
import io.javalin.http.Context;
import static io.javalin.apibuilder.ApiBuilder.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import sms.Config.DatabaseConfig;
import sms.Objects.ClassEntity;
import sms.Objects.Classroom;
import sms.Objects.Course;
import sms.Objects.Schedule;
import sms.Objects.Teacher;
import sms.Service.ClassService;
import sms.Service.TeacherService;
import sms.Service.ScheduleService;
import sms.DAO.ClassroomDAO;
import sms.DAO.CourseDAO;
import sms.DAO.ClassroomDAO;
import sms.exception.ClassNotFoundException;
import sms.exception.InvalidClassException;
import sms.exception.InvalidTeacherException;
import sms.exception.TeacherNotFoundException;

public class ApiServer {

    private static TeacherService teacherService;
    private static ClassService classService;
    private static ScheduleService scheduleService;
    private static ClassroomDAO classroomDAO;
    private static CourseDAO courseDAO;
    
    public static void main(String[] args) {
        ensureDatabase();
        teacherService = new TeacherService();
        classService = new ClassService();
        scheduleService = new ScheduleService();
        classroomDAO = new ClassroomDAO();
        courseDAO = new CourseDAO();

        @SuppressWarnings("unused")
        Javalin app = Javalin.create(config -> {
            config.staticFiles.add(staticFiles -> {
                staticFiles.hostedPath = "/";
                staticFiles.directory = "/public";
            });

            config.routes.apiBuilder(() -> {
                path("/api/teachers", () -> {
                    get(ApiServer::getAllTeachers);
                    post(ApiServer::createTeacher);
                    get("/department/{department}", ApiServer::getTeachersByDepartment);
                    get("/{id}", ApiServer::getTeacherById);
                    put("/{id}", ApiServer::updateTeacher);
                    delete("/{id}", ApiServer::deleteTeacher);
                });
                path("/api/classes", () -> {
                    get(ApiServer::getAllClasses);
                    post(ApiServer::createClass);
                    get("/{id}", ApiServer::getClassById);
                    put("/{id}", ApiServer::updateClass);
                    delete("/{id}", ApiServer::deleteClass);
                });
                path("/api/classrooms", () -> {
                    get(ApiServer::getAllClassrooms);
                });
                path("/api/courses", () -> {
                    get(ApiServer::getAllCourses);
                    post(ApiServer::createCourse);
                });
                path("/api/schedules", () -> {
                    get(ApiServer::getAllSchedules);
                    post(ApiServer::createSchedule);
                    get("/class/{classId}", ApiServer::getSchedulesForClass);
                    get("/teacher/{teacherId}", ApiServer::getSchedulesForTeacher);
                    get("/room/{roomId}", ApiServer::getSchedulesForRoom);
                    get("/{id}", ApiServer::getScheduleById);
                });
            });
        })
        .start(8080);

        System.out.println("Access at http://localhost:8080");
    }
    
    private static void ensureDatabase() {
        Path dbPath = Paths.get(DatabaseConfig.getDatabaseName());
        if (!Files.exists(dbPath)) {
            DatabaseInit.initializeDatabase();
        }
    }

    private static void getAllTeachers(Context ctx) {
        List<Teacher> teachers = teacherService.getAllTeachers();
        ctx.json(teachers);
    }

    private static void getAllSchedules(Context ctx) {
        try {
            List<Map<String, Object>> schedules = scheduleService.getAllScheduleViews();
            ctx.json(schedules);
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(errorResponse(e, "Failed to load schedules"));
        }
    }

    private static void createSchedule(Context ctx) {
        try {
            Map<?, ?> payload = ctx.bodyAsClass(Map.class);
            Integer scheduleId = readOptionalInteger(payload, "id");
            Schedule savedSchedule = scheduleId != null && scheduleId > 0
                ? scheduleService.saveSchedule(
                    scheduleId,
                    readOptionalInteger(payload, "classroomId"),
                    readOptionalInteger(payload, "teacherId"),
                    readOptionalInteger(payload, "courseId"),
                    readOptionalDate(payload, "date"),
                    readOptionalTime(payload, "startTime"),
                    readOptionalTime(payload, "endTime"),
                    readOptionalString(payload, "status"),
                    readOptionalString(payload, "visibility"),
                    readOptionalString(payload, "type"),
                    readOptionalInteger(payload, "priority"),
                    readOptionalInteger(payload, "createdBy"),
                    payload.get("classIds") == null ? null : readClassIds(payload.get("classIds")),
                    readOptionalInteger(payload, "linkedScheduleId")
                )
                : scheduleService.createSchedule(
                resolveClassroomId(payload.get("classroomId")),
                readOptionalInteger(payload, "teacherId"),
                readInt(payload, "courseId"),
                LocalDate.parse(readString(payload, "date")),
                LocalTime.parse(readString(payload, "startTime")),
                LocalTime.parse(readString(payload, "endTime")),
                readOptionalString(payload, "status"),
                readOptionalString(payload, "visibility"),
                readOptionalString(payload, "type"),
                readOptionalInt(payload, "priority", 0),
                readInt(payload, "createdBy"),
                readClassIds(payload.get("classIds")),
                readOptionalInteger(payload, "linkedScheduleId")
            );
            ctx.status(scheduleId != null && scheduleId > 0 ? 200 : 201).json(scheduleService.getScheduleView(savedSchedule.getId()));
        } catch (DateTimeParseException e) {
            ctx.status(400).json(errorResponse(e, "Invalid date or time format"));
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid schedule data"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to create schedule"));
        }
    }

    private static int resolveClassroomId(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Missing required field: classroomId");
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        String text = value.toString().trim();
        if (text.isEmpty()) {
            throw new IllegalArgumentException("Missing required field: classroomId");
        }

        // Try parse as integer
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            // Not a plain integer, try lookup by classroom name
            try {
                ClassroomDAO dao = new ClassroomDAO();
                var classroom = dao.getClassroomByName(text);
                if (classroom != null) {
                    return classroom.getId();
                }
            } catch (Exception ex) {
                // ignore and try other heuristics
            }

            // If value looks like an alphanumeric code like 'R-101', extract digits
            String digits = text.replaceAll("\\D+", "");
            if (!digits.isEmpty()) {
                try {
                    return Integer.parseInt(digits);
                } catch (NumberFormatException ex) {
                    // fall through
                }
            }

            throw new IllegalArgumentException("Invalid classroom id: " + text);
        }
    }

    private static void getSchedulesForClass(Context ctx) {
        try {
            int classId = Integer.parseInt(ctx.pathParam("classId"));
            ctx.json(scheduleService.getScheduleViewsForClass(classId));
        } catch (NumberFormatException e) {
            ctx.status(400).json(errorResponse(e, "Invalid class id"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to load class schedules"));
        }
    }

    private static void getSchedulesForTeacher(Context ctx) {
        try {
            int teacherId = Integer.parseInt(ctx.pathParam("teacherId"));
            ctx.json(scheduleService.getScheduleViewsForTeacher(teacherId));
        } catch (NumberFormatException e) {
            ctx.status(400).json(errorResponse(e, "Invalid teacher id"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to load teacher schedules"));
        }
    }

    private static void getSchedulesForRoom(Context ctx) {
        try {
            int roomId = Integer.parseInt(ctx.pathParam("roomId"));
            ctx.json(scheduleService.getScheduleViewsForRoom(roomId));
        } catch (NumberFormatException e) {
            ctx.status(400).json(errorResponse(e, "Invalid room id"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to load room schedules"));
        }
    }

    private static void getScheduleById(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Map<String, Object> schedule = scheduleService.getScheduleView(id);
            if (schedule == null) {
                ctx.status(404).json(errorResponse(new RuntimeException("Not found"), "Schedule not found"));
                return;
            }
            ctx.json(schedule);
        } catch (NumberFormatException e) {
            ctx.status(400).json(errorResponse(e, "Invalid schedule id"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to load schedule"));
        }
    }

    private static void getAllClasses(Context ctx) {
        try {
            List<ClassEntity> classes = classService.getAllClasses();
            ctx.json(classes);
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(errorResponse(e, "Failed to load classes"));
        }
    }

    private static void getAllClassrooms(Context ctx) {
        try {
            List<Classroom> classrooms = classroomDAO.getAllClassrooms();
            ctx.json(classrooms);
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(errorResponse(e, "Failed to load classrooms"));
        }
    }

    private static void getAllCourses(Context ctx) {
        try {
            List<Course> courses = courseDAO.getAllCourses();
            ctx.json(courses);
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(errorResponse(e, "Failed to load courses"));
        }
    }

    private static void createCourse(Context ctx) {
        try {
            Map<?, ?> payload = ctx.bodyAsClass(Map.class);
            String name = readString(payload, "name");
            String code = readString(payload, "code");
            int totalHours = readOptionalInt(payload, "totalHours", 45);

            Course existing = courseDAO.getByCode(code);
            if (existing != null) {
                ctx.status(200).json(existing);
                return;
            }

            Course course = new Course(name, code, totalHours);
            if (!courseDAO.createCourse(course)) {
                throw new RuntimeException("Course was not created");
            }
            ctx.status(201).json(course);
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid course data"));
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(errorResponse(e, "Failed to create course"));
        }
    }

    private static void getTeacherById(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Teacher teacher = teacherService.getTeacher(id);
            ctx.json(teacher);
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid teacher id"));
        } catch (TeacherNotFoundException e) {
            ctx.status(404).json(errorResponse(e, "Teacher not found"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to load teacher"));
        }
    }

    private static void getClassById(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            ClassEntity classEntity = classService.getClass(id);
            ctx.json(classEntity);
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid class id"));
        } catch (ClassNotFoundException e) {
            ctx.status(404).json(errorResponse(e, "Class not found"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to load class"));
        }
    }

    private static void getTeachersByDepartment(Context ctx) {
        try {
            String department = ctx.pathParam("department");
            List<Teacher> teachers = teacherService.getTeachersByDepartment(department);
            ctx.json(teachers);
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid department"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to load teachers"));
        }
    }

    private static void createTeacher(Context ctx) {
        try {
            Teacher payload = ctx.bodyAsClass(Teacher.class);
            teacherService.createTeacher(payload.getUserId(), payload.getDepartment());
            ctx.status(201).json(Collections.singletonMap("message", "Teacher created"));
        } catch (InvalidTeacherException | IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid teacher data"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to create teacher"));
        }
    }

    private static void createClass(Context ctx) {
        try {
            ClassEntity payload = ctx.bodyAsClass(ClassEntity.class);
            ClassEntity created = classService.createClass(
                    payload.getName(),
                    payload.getYear(),
                    payload.getSemester(),
                    payload.getStartDate(),
                    payload.getEndDate(),
                    payload.getCreatedBy()
            );
            ctx.status(201).json(created);
        } catch (InvalidClassException | IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid class data"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to create class"));
        }
    }

    private static void updateTeacher(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Teacher payload = ctx.bodyAsClass(Teacher.class);
            payload.setId(id);
            teacherService.updateTeacher(payload);
            ctx.json(Collections.singletonMap("message", "Teacher updated"));
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid teacher data"));
        } catch (TeacherNotFoundException e) {
            ctx.status(404).json(errorResponse(e, "Teacher not found"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to update teacher"));
        }
    }

    private static void updateClass(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            ClassEntity payload = ctx.bodyAsClass(ClassEntity.class);
            payload.setId(id);
            classService.updateClass(payload);
            ctx.json(Collections.singletonMap("message", "Class updated"));
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid class data"));
        } catch (ClassNotFoundException e) {
            ctx.status(404).json(errorResponse(e, "Class not found"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to update class"));
        }
    }

    private static void deleteTeacher(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            teacherService.deleteTeacher(id);
            ctx.json(Collections.singletonMap("message", "Teacher deleted"));
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid teacher id"));
        } catch (TeacherNotFoundException e) {
            ctx.status(404).json(errorResponse(e, "Teacher not found"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to delete teacher"));
        }
    }

    private static void deleteClass(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            classService.deleteClass(id);
            ctx.json(Collections.singletonMap("message", "Class deleted"));
        } catch (IllegalArgumentException e) {
            ctx.status(400).json(errorResponse(e, "Invalid class id"));
        } catch (ClassNotFoundException e) {
            ctx.status(404).json(errorResponse(e, "Class not found"));
        } catch (Exception e) {
            ctx.status(500).json(errorResponse(e, "Failed to delete class"));
        }
    }

    private static Map<String, String> errorResponse(Exception e, String fallback) {
        String message = e.getMessage();
        if (message == null || message.trim().isEmpty()) {
            message = fallback;
        }
        return Collections.singletonMap("error", message);
    }

    private static String readString(Map<?, ?> payload, String key) {
        Object value = payload.get(key);
        if (value == null) {
            throw new IllegalArgumentException("Missing required field: " + key);
        }
        return value.toString();
    }

    private static String readOptionalString(Map<?, ?> payload, String key) {
        Object value = payload.get(key);
        return value == null ? null : value.toString();
    }

    private static int readInt(Map<?, ?> payload, String key) {
        Object value = payload.get(key);
        if (value == null) {
            throw new IllegalArgumentException("Missing required field: " + key);
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.parseInt(value.toString());
    }

    private static Integer readOptionalInteger(Map<?, ?> payload, String key) {
        Object value = payload.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        String text = value.toString().trim();
        if (text.isEmpty()) {
            return null;
        }
        return Integer.valueOf(text);
    }

    private static LocalDate readOptionalDate(Map<?, ?> payload, String key) {
        Object value = payload.get(key);
        if (value == null || value.toString().trim().isEmpty()) {
            return null;
        }
        return LocalDate.parse(value.toString());
    }

    private static LocalTime readOptionalTime(Map<?, ?> payload, String key) {
        Object value = payload.get(key);
        if (value == null || value.toString().trim().isEmpty()) {
            return null;
        }
        return LocalTime.parse(value.toString());
    }

    private static int readOptionalInt(Map<?, ?> payload, String key, int defaultValue) {
        Object value = payload.get(key);
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        String text = value.toString().trim();
        return text.isEmpty() ? defaultValue : Integer.parseInt(text);
    }

    @SuppressWarnings("unchecked")
    private static List<Integer> readClassIds(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Missing required field: classIds");
        }

        List<Integer> classIds = new ArrayList<>();
        if (value instanceof List<?>) {
            for (Object item : (List<Object>) value) {
                if (item instanceof Number) {
                    classIds.add(((Number) item).intValue());
                } else if (item != null) {
                    classIds.add(Integer.valueOf(item.toString()));
                }
            }
            return classIds;
        }

        String text = value.toString().trim();
        if (text.isEmpty()) {
            return classIds;
        }

        for (String part : text.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                classIds.add(Integer.valueOf(trimmed));
            }
        }
        return classIds;
    }
}