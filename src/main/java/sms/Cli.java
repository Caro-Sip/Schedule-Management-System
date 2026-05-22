package sms;

import java.io.File;
import java.util.List;
import java.util.Scanner;

import sms.Objects.Schedule;
import sms.Objects.Teacher;
import sms.Objects.User;
import sms.Service.ScheduleService;
import sms.Service.UserService;
import sms.Service.TeacherService;

/**
 * Schedule Management System - CLI Interface (Phase 1)
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
        System.out.println("4. Manage Teachers");
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
            List<Schedule> schedules = scheduleService.getSchedulesForClass(classId);
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
            List<Schedule> schedules = scheduleService.getSchedulesForTeacher(teacherId);
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
            List<Schedule> schedules = scheduleService.getSchedulesForRoom(classroomId);
            renderSchedules(schedules);
        } catch (UnsupportedOperationException e) {
            printFeatureUnavailable("Room schedule lookup", e);
        } catch (Exception e) {
            System.out.println("Failed to retrieve room schedule: " + e.getMessage());
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

    private void renderSchedules(List<Schedule> schedules) {
        if (schedules == null || schedules.isEmpty()) {
            System.out.println("No schedules found.");
            return;
        }

        System.out.println();
        for (Schedule schedule : schedules) {
            System.out.println(schedule);
        }
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
