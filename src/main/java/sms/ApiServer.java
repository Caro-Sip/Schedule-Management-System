package sms;

import io.javalin.Javalin;
import io.javalin.http.Context;
import static io.javalin.apibuilder.ApiBuilder.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import sms.Config.DatabaseConfig;
import sms.Objects.ClassEntity;
import sms.Objects.Teacher;
import sms.Service.ClassService;
import sms.Service.TeacherService;
import sms.exception.ClassNotFoundException;
import sms.exception.InvalidClassException;
import sms.exception.InvalidTeacherException;
import sms.exception.TeacherNotFoundException;

public class ApiServer {

    private static TeacherService teacherService;
    private static ClassService classService;
    
    public static void main(String[] args) {
        ensureDatabase();
        teacherService = new TeacherService();
        classService = new ClassService();

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

    private static void getAllClasses(Context ctx) {
        try {
            List<ClassEntity> classes = classService.getAllClasses();
            ctx.json(classes);
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(errorResponse(e, "Failed to load classes"));
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
}