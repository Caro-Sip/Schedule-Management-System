package sms.Service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.introspect.TypeResolutionContext.Empty;

import sms.DAO.TeacherDAO;
import sms.Objects.Teacher;
import sms.Objects.TimeSlot;
import sms.exception.InvalidTeacherException;
import sms.exception.TeacherNotFoundException;

public class TeacherService {
    private TeacherDAO teacherDAO;

    public TeacherService(TeacherDAO teacherDao){
        this.teacherDAO = teacherDao;
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
            boolean created = teacherDAO.createTeacher(teacher);
            if(!created){
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

    // TODO isTeacherAvailable function
    // caro: above my pay grade
    public boolean isTeacherAvailable(int teacherId, TimeSlot slot) {
        throw new UnsupportedOperationException("Teacher availability check not implemented yet");
    }
}
