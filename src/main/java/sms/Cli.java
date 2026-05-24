package sms;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import sms.Objects.Teacher;
import sms.Objects.User;
import sms.Service.ScheduleService;
import sms.Service.UserService;
import sms.Service.TeacherService;

/**
 * DEPRACATED FEATURE
 * Schedule Management System - CLI Interface (Phase 1)
 * CLI was supposed to be used to test if features are working
 * BUT NOW THIS PHASE IS DEPRACATED
 */
public class Cli {
    private static final String DB_PATH = "schedule.db";

    private final UserService userService;
    private final ScheduleService scheduleService;
    private final Scanner scanner;
    private final TeacherService teacherService;
    private User currentUser;

    public Cli(UserService userService, ScheduleService scheduleService, TeacherService teacherService, Scanner scanner) {
        this.userService = userService;
        this.scheduleService = scheduleService;
        this.teacherService = teacherService;
        this.scanner = scanner;
    }

    public static void main(String[] args) {
        initializeDatabaseIfNeeded();

        Cli cli = new Cli(new UserService(), new ScheduleService(), new TeacherService(), new Scanner(System.in));
        cli.run();
    }

    private void run() {
        printHeader();
        if (!handleLoginFlow()) {
            System.out.println("Goodbye.");
            return;
        }

        mainLoop();
    }

    private void printHeader() {
        System.out.println("======================================");
        System.out.println("Welcome to Schedule Management System");
        System.out.println("======================================");
    }

    private boolean handleLoginFlow() {
        while (true) {
            printLoginMenu();
            int choice = readInt("Choose an option: ");
            switch (choice) {
                case 1:
                    currentUser = attemptLogin();
                    if (currentUser != null) {
                        System.out.println("Logged in as: " + currentUser.getEmail());
                        return true;
                    }
                    System.out.println("Login not available. Try again or continue as guest.");
                    break;
                case 2:
                    currentUser = attemptGuest();
                    if (currentUser == null) {
                        System.out.println("Guest mode not available. Continuing without a user.");
                    }
                    return true;
                case 0:
                    return false;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
    }

    private User attemptLogin() {
        String email = readLine("Email: ");
        String password = readLine("Password: ");

        try {
            return userService.login(email, password);
        } catch (UnsupportedOperationException e) {
            printFeatureUnavailable("Login", e);
            return null;
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            return null;
        }
    }

    private User attemptGuest() {
        try {
            return userService.continueAsGuest();
        } catch (UnsupportedOperationException e) {
            printFeatureUnavailable("Guest access", e);
            return null;
        } catch (Exception e) {
            System.out.println("Guest access failed: " + e.getMessage());
            return null;
        }
    }

    private void mainLoop() {
        boolean running = true;
        while (running) {
            printMenu();
            int choice = readInt("Select an option: ");
            switch (choice) {
                case 1:
                    handleClassSchedule();
                    break;
                case 2:
                    handleTeacherSchedule();
                    break;
                case 3:
                    handleRoomSchedule();
                    break;
                case 4:
                    handleCreateSchedule();
                    break;
                case 5:
                    handleTeacherManagement();
                    break;
                case 0:
                    running = false;
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
    }

    private void printMenu() {
        String userLabel = currentUser == null ? "Guest" : currentUser.getEmail();
        System.out.println();
        System.out.println("Current user: " + userLabel);
        System.out.println("1. View Class Schedule");
        System.out.println("2. View Teacher Schedule");
        System.out.println("3. View Room Schedule");
        System.out.println("4. Create Schedule");
        System.out.println("5. Manage Teachers");
        System.out.println("0. Exit");
    }

    private void printLoginMenu() {
        System.out.println();
        System.out.println("Login");
        System.out.println("1. Login");
        System.out.println("2. Continue as Guest");
        System.out.println("0. Exit");
    }

    private void handleClassSchedule() {
        int classId = readInt("Class ID: ");
        try {
            List<Map<String, Object>> schedules = scheduleService.getScheduleViewsForClass(classId);
            renderSchedules(schedules);
        } catch (UnsupportedOperationException e) {
            printFeatureUnavailable("Class schedule lookup", e);
        } catch (Exception e) {
            System.out.println("Failed to retrieve class schedule: " + e.getMessage());
        }
    }

    private void handleTeacherSchedule() {
        int teacherId = readInt("Teacher ID: ");
        try {
            List<Map<String, Object>> schedules = scheduleService.getScheduleViewsForTeacher(teacherId);
            renderSchedules(schedules);
        } catch (UnsupportedOperationException e) {
            printFeatureUnavailable("Teacher schedule lookup", e);
        } catch (Exception e) {
            System.out.println("Failed to retrieve teacher schedule: " + e.getMessage());
        }
    }

    private void handleRoomSchedule() {
        int classroomId = readInt("Room ID: ");
        try {
            List<Map<String, Object>> schedules = scheduleService.getScheduleViewsForRoom(classroomId);
            renderSchedules(schedules);
        } catch (UnsupportedOperationException e) {
            printFeatureUnavailable("Room schedule lookup", e);
        } catch (Exception e) {
            System.out.println("Failed to retrieve room schedule: " + e.getMessage());
        }
    }

    private void handleCreateSchedule() {
        int classroomId = readInt("Classroom ID: ");
        Integer teacherId = readOptionalInt("Teacher ID (blank for none): ");
        int courseId = readInt("Course ID: ");
        LocalDate date = readDate("Date (YYYY-MM-DD): ");
        LocalTime startTime = readTime("Start time (HH:MM): ");
        LocalTime endTime = readTime("End time (HH:MM): ");
        String status = readLine("Status [BOOKED]: ");
        String visibility = readLine("Visibility [VISIBLE]: ");
        String type = readLine("Type [DEFAULT]: ");
        int priority = readOptionalIntOrDefault("Priority [0]: ", 0);
        int createdBy = readInt("Created by user ID: ");
        Integer linkedScheduleId = readOptionalInt("Linked schedule ID (blank for none): ");
        List<Integer> classIds = readClassIds("Class IDs (comma-separated): ");

        try {
            var createdSchedule = scheduleService.createSchedule(
                    classroomId,
                    teacherId,
                    courseId,
                    date,
                    startTime,
                    endTime,
                    status,
                    visibility,
                    type,
                    priority,
                    createdBy,
                    classIds,
                    linkedScheduleId
            );
            System.out.println("Schedule created successfully.");
            System.out.println(scheduleService.getScheduleView(createdSchedule.getId()));
        } catch (Exception e) {
            System.out.println("Failed to create schedule: " + e.getMessage());
        }
    }

    private void handleTeacherManagement() {
        boolean inTeacherMenu = true;
        while (inTeacherMenu) {
            printTeacherMenu();
            int choice = readInt("Select an option: ");
            switch (choice) {
                case 1:
                    handleCreateTeacher();
                    break;
                case 2:
                    handleViewAllTeachers();
                    break;
                case 3:
                    handleViewTeacher();
                    break;
                case 4:
                    handleUpdateTeacher();
                    break;
                case 5:
                    handleDeleteTeacher();
                    break;
                case 6:
                    handleViewTeachersByDepartment();
                    break;
                case 0:
                    inTeacherMenu = false;
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
    }

    private void printTeacherMenu() {
        System.out.println();
        System.out.println("--- Teacher Management ---");
        System.out.println("1. Create Teacher");
        System.out.println("2. View All Teachers");
        System.out.println("3. View Teacher by ID");
        System.out.println("4. Update Teacher");
        System.out.println("5. Delete Teacher");
        System.out.println("6. View Teachers by Department");
        System.out.println("0. Back to Main Menu");
    }

    private void handleCreateTeacher() {
        int userId = readInt("User ID: ");
        String department = readLine("Department: ");

        try {
            teacherService.createTeacher(userId, department);
            System.out.println("Teacher created successfully.");
        } catch (Exception e) {
            System.out.println("Failed to create teacher: " + e.getMessage());
        }
    }

    private void handleViewAllTeachers() {
        try {
            List<Teacher> teachers = teacherService.getAllTeachers();
            if (teachers.isEmpty()) {
                System.out.println("No teachers found.");
            } else {
                System.out.println();
                for (Teacher teacher : teachers) {
                    System.out.println(teacher);
                }
            }
        } catch (Exception e) {
            System.out.println("Failed to retrieve teachers: " + e.getMessage());
        }
    }

    private void handleViewTeacher() {
        int teacherId = readInt("Teacher ID: ");

        try {
            Teacher teacher = teacherService.getTeacher(teacherId);
            System.out.println();
            System.out.println(teacher);
        } catch (Exception e) {
            System.out.println("Failed to retrieve teacher: " + e.getMessage());
        }
    }

    private void handleUpdateTeacher() {
        int teacherId = readInt("Teacher ID: ");
        String department = readLine("New Department: ");

        try {
            Teacher teacher = teacherService.getTeacher(teacherId);
            teacher.setDepartment(department);
            teacherService.updateTeacher(teacher);
            System.out.println("Teacher updated successfully.");
        } catch (Exception e) {
            System.out.println("Failed to update teacher: " + e.getMessage());
        }
    }

    private void handleDeleteTeacher() {
        int teacherId = readInt("Teacher ID: ");

        try {
            teacherService.deleteTeacher(teacherId);
            System.out.println("Teacher deleted successfully.");
        } catch (Exception e) {
            System.out.println("Failed to delete teacher: " + e.getMessage());
        }
    }

    private void handleViewTeachersByDepartment() {
        String department = readLine("Department: ");

        try {
            List<Teacher> teachers = teacherService.getTeachersByDepartment(department);
            if (teachers.isEmpty()) {
                System.out.println("No teachers found in that department.");
            } else {
                System.out.println();
                for (Teacher teacher : teachers) {
                    System.out.println(teacher);
                }
            }
        } catch (Exception e) {
            System.out.println("Failed to retrieve teachers: " + e.getMessage());
        }
    }

    private void renderSchedules(List<Map<String, Object>> schedules) {
        if (schedules == null || schedules.isEmpty()) {
            System.out.println("No schedules found.");
            return;
        }

        System.out.println();
        for (Map<String, Object> schedule : schedules) {
            System.out.println(formatSchedule(schedule));
        }
    }

    private String formatSchedule(Map<String, Object> schedule) {
        return "Schedule{" +
                "id=" + schedule.get("id") +
                ", classroomId=" + schedule.get("classroomId") +
                ", teacherId=" + schedule.get("teacherId") +
                ", courseId=" + schedule.get("courseId") +
                ", classIds=" + schedule.get("classIds") +
                ", date=" + schedule.get("date") +
                ", startTime=" + schedule.get("startTime") +
                ", endTime=" + schedule.get("endTime") +
                ", status='" + schedule.get("status") + '\'' +
                ", type='" + schedule.get("type") + '\'' +
                '}';
    }

    private int readInt(String prompt) {
        while (true) {
            String input = readLine(prompt);
            try {
                return Integer.parseInt(input);
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid number.");
            }
        }
    }

    private Integer readOptionalInt(String prompt) {
        String input = readLine(prompt);
        if (input.isBlank()) {
            return null;
        }

        try {
            return Integer.valueOf(input);
        } catch (NumberFormatException e) {
            System.out.println("Please enter a valid number or leave it blank.");
            return readOptionalInt(prompt);
        }
    }

    private int readOptionalIntOrDefault(String prompt, int defaultValue) {
        String input = readLine(prompt);
        if (input.isBlank()) {
            return defaultValue;
        }

        try {
            return Integer.parseInt(input);
        } catch (NumberFormatException e) {
            System.out.println("Please enter a valid number.");
            return readOptionalIntOrDefault(prompt, defaultValue);
        }
    }

    private LocalDate readDate(String prompt) {
        while (true) {
            String input = readLine(prompt);
            try {
                return LocalDate.parse(input);
            } catch (Exception e) {
                System.out.println("Please enter a valid date in YYYY-MM-DD format.");
            }
        }
    }

    private LocalTime readTime(String prompt) {
        while (true) {
            String input = readLine(prompt);
            try {
                return LocalTime.parse(input);
            } catch (Exception e) {
                System.out.println("Please enter a valid time in HH:MM format.");
            }
        }
    }

    private List<Integer> readClassIds(String prompt) {
        while (true) {
            String input = readLine(prompt);
            List<Integer> classIds = new ArrayList<>();

            if (input.isBlank()) {
                System.out.println("Please provide at least one class id.");
                continue;
            }

            try {
                for (String part : input.split(",")) {
                    String trimmed = part.trim();
                    if (!trimmed.isEmpty()) {
                        classIds.add(Integer.parseInt(trimmed));
                    }
                }

                if (classIds.isEmpty()) {
                    System.out.println("Please provide at least one class id.");
                    continue;
                }

                return new ArrayList<>(new LinkedHashSet<>(classIds));
            } catch (NumberFormatException e) {
                System.out.println("Please enter valid numeric class ids separated by commas.");
            }
        }
    }

    private String readLine(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }

    private void printFeatureUnavailable(String feature, UnsupportedOperationException e) {
        String message = e.getMessage() == null ? "" : " (" + e.getMessage() + ")";
        System.out.println(feature + " is not implemented yet" + message + ".");
    }

    private static void initializeDatabaseIfNeeded() {
        File dbFile = new File(DB_PATH);
        if (!dbFile.exists()) {
            System.out.println("Database not found. Initializing...");
            DatabaseInit.initializeDatabase();
            System.out.println("Database initialized successfully.");
        }
    }
}
