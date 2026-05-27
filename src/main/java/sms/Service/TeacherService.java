package sms.Service;

import java.sql.SQLException;
import java.util.List;

import sms.DAO.ScheduleDAO;
import sms.DAO.TeacherDAO;
import sms.Objects.Schedule;
import sms.Objects.Teacher;
import sms.Objects.TimeSlot;
import sms.exception.InvalidTeacherException;
import sms.exception.TeacherNotFoundException;

public class TeacherService {
    private TeacherDAO teacherDAO;
    private final ScheduleDAO scheduleDAO;

    public TeacherService() {
        this(new TeacherDAO(), new ScheduleDAO());
    }

    public TeacherService(TeacherDAO teacherDao, ScheduleDAO scheduleDAO) {
        this.teacherDAO = teacherDao;
        this.scheduleDAO = scheduleDAO;
    }

    public void createTeacher(int userId, String department) throws InvalidTeacherException {
        if(userId < 0){
            throw new IllegalArgumentException("User position is invalid");
        }

        if(department == null || department.trim().isEmpty()){
            throw new IllegalArgumentException("Department name cannot be empty");
        }

        Teacher teacher = new Teacher(userId,department);
        try{
            boolean isCreated = teacherDAO.createTeacher(teacher);
            if(!isCreated){
                throw new InvalidTeacherException("Teacher was not created");
            }

        } catch (SQLException e){
            throw new InvalidTeacherException("Failed to create", e);
        }
    }

    public Teacher getTeacher(int teacherId) throws TeacherNotFoundException {
        if(teacherId < 0){
            throw new IllegalArgumentException("Invalid teacher Id");
        }

        try{
            Teacher teacher  = teacherDAO.getById(teacherId);

            if(teacher == null){
                throw new TeacherNotFoundException("No teacher found with id" + teacherId);
            }

            return teacher;
        } catch (SQLException e){
            throw new TeacherNotFoundException("Failled to find", e);
        }
    }

    public List<Teacher> getAllTeachers() {
        try{
            List<Teacher> teacherList = teacherDAO.getAllTeachers();
            return teacherList;
        } catch (SQLException e){
            throw new RuntimeException("Failed to retrieve teachers",e);
        } 
    }

    public void updateTeacher(Teacher teacher) throws TeacherNotFoundException {
        if (teacher == null || teacher.getId() < 0){
            throw new IllegalArgumentException("Teacher is invalid");
        }

        if (teacher.getDepartment() == null || teacher.getDepartment().trim().isEmpty()){
            throw new IllegalArgumentException("Department cannot be empty");
        }

        try {
            boolean updated = teacherDAO.updateTeacherDepartment(teacher.getId(), teacher.getDepartment());

            if(!updated){
                throw new TeacherNotFoundException("Teacher with id " + teacher.getId() + " not found");
            }
        } catch (SQLException e){
            throw new RuntimeException("Failed to find teacher", e);
        }
    }

    public void deleteTeacher(int teacherId) throws TeacherNotFoundException {
        if (teacherId < 0){
            throw new IllegalArgumentException("Teacher Id cannot be negative");
        }

        try {
            boolean isDeleted = teacherDAO.deleteTeacher(teacherId);

            if (!isDeleted){
                throw new TeacherNotFoundException("Teacher with id " + teacherId + " not found");
            }
        } catch (SQLException e){
            throw new RuntimeException();
        }
    }

    public List<Teacher> getTeachersByDepartment(String department) {
        if (department == null || department.trim().isEmpty()){
            throw new IllegalArgumentException("Department cannot be empty");
        }

        try {
            List<Teacher> teacherList = teacherDAO.getByDepartment(department);
            return teacherList;
        } catch (SQLException e){
            throw new RuntimeException("Failed to retrieve teachers by department",e);
        }
    }

    public List<String> getTeacherDepartments() {
        try {
            return teacherDAO.getDistinctDepartments();
        } catch (SQLException e) {
            throw new RuntimeException("Failed to retrieve teacher departments", e);
        }
    }

    // TODO isTeacherAvailable function
    // public boolean isTeacherAvailable(int teacherId, TimeSlot slot) {
    //     if (teacherId < 0) {
    //         throw new IllegalArgumentException("Invalid teacher Id");
    //     }

    //     if (slot == null || slot.getDate() == null || slot.getStartTime() == null || slot.getEndTime() == null) {
    //         throw new IllegalArgumentException("Invalid time slot");
    //     }

    //     try {
    //         if (!teacherDAO.teacherExists(teacherId)) {
    //             throw new IllegalArgumentException("Teacher not found with id:" + teacherId);
    //         }
    //     } catch (SQLException e) {
    //         throw new RuntimeException("Failed to check teacher availability", e);
    //     }

    //     for (Schedule schedule : scheduleDAO.getAllSchedules()) {
    //         Integer assignedTeacherId = schedule.getTeacherId();
    //         if (assignedTeacherId == null || assignedTeacherId != teacherId) {
    //             continue;
    //         }

    //         if (schedule.getDate() == null || !schedule.getDate().equals(slot.getDate())) {
    //             continue;
    //         }

    //         if (isCancelled(schedule)) {
    //             continue;
    //         }

    //         if (isTimeOverlapping(slot, schedule)) {
    //             return false;
    //         }
    //     }

    //     return true;
    // }

    private boolean isTimeOverlapping(TimeSlot slot, Schedule schedule) {
        return slot.getStartTime().isBefore(schedule.getEndTime())
                && slot.getEndTime().isAfter(schedule.getStartTime());
    }

    private boolean isCancelled(Schedule schedule) {
        String status = schedule.getStatus();
        return status != null && status.equalsIgnoreCase("CANCELLED");
    }
}
