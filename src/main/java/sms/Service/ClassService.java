package sms.Service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;


import sms.DAO.ClassEntityDAO;
import sms.DAO.ClassCourseDAO;
import sms.DAO.CourseDAO;
import sms.Objects.ClassEntity;
import sms.Objects.Course;
import sms.Objects.TimeSlot;
import sms.exception.ClassNotFoundException;
import sms.exception.InvalidClassException;

public class ClassService {
    private final ClassEntityDAO classEntityDAO;
    private final ClassCourseDAO classCourseDAO;
    private final CourseDAO courseDAO;

    public ClassService() {
        this(new ClassEntityDAO(), new ClassCourseDAO(), new CourseDAO());
    }

    public ClassService(ClassEntityDAO classEntityDAO){
        this(classEntityDAO, new ClassCourseDAO(), new CourseDAO());
    }

    public ClassService(ClassEntityDAO classEntityDAO, ClassCourseDAO classCourseDAO, CourseDAO courseDAO){
        this.classEntityDAO = classEntityDAO;
        this.classCourseDAO = classCourseDAO;
        this.courseDAO = courseDAO;
    }

    public ClassEntity createClass(String name, int year, int semester,
                                   String startDate, String endDate, int createdBy)
            throws InvalidClassException {
        if(name == null || name.trim().isEmpty()){
            throw new IllegalArgumentException("Name cannot be empty");
        }

        if(year < 0){
            throw new IllegalArgumentException("Year cannot be in the negative");
        }

        if (semester != 1 && semester != 2) {
            throw new IllegalArgumentException("Semester must be 1 or 2");
        }

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }

        LocalDate parsedStartDate = LocalDate.parse(startDate);
        LocalDate parsedEndDate = LocalDate.parse(endDate);

        if (parsedStartDate.isAfter(parsedEndDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        if (createdBy <= 0) {
            throw new IllegalArgumentException("Creator id must be positive");
        }

        try{
            ClassEntity classEntity = new ClassEntity(name, year, semester, startDate, endDate, createdBy);

            boolean isCreated = classEntityDAO.createClass(classEntity);

            if(!isCreated){
                throw new InvalidClassException("Class was not created");
            }
            return classEntity;
        } catch (SQLException e){
            throw new RuntimeException("Failed to create class");
        }
    }

    public ClassEntity getClass(int classId) throws ClassNotFoundException {
        if(classId < 0){
            throw new IllegalArgumentException("Invalid class id");
        }

        try{
            ClassEntity classEntity = classEntityDAO.getById(classId);

            if(classEntity == null){
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }

            return classEntity;
        } catch (SQLException e){
            throw new RuntimeException("Failed to find class", e);
        }
    }

    public List<ClassEntity> getAllClasses() {
        try{
            List<ClassEntity> classes = classEntityDAO.getAllClasses();
            return classes;
        } catch (SQLException e){
            throw new RuntimeException("Failed to get data from class table");
        }
    }

    public List<Course> getCoursesForClass(int classId) throws ClassNotFoundException {
        if (classId <= 0) {
            throw new IllegalArgumentException("Invalid class id");
        }

        try {
            if (!classEntityDAO.classExists(classId)) {
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }

            return classCourseDAO.getCoursesByClassId(classId);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to get courses for class", e);
        }
    }

    public List<Integer> getCourseIdsForClass(int classId) throws ClassNotFoundException {
        if (classId <= 0) {
            throw new IllegalArgumentException("Invalid class id");
        }

        try {
            if (!classEntityDAO.classExists(classId)) {
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }

            return classCourseDAO.getCourseIdsByClassId(classId);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to get course ids for class", e);
        }
    }

    public void setCoursesForClass(int classId, List<Integer> courseIds) throws ClassNotFoundException {
        if (classId <= 0) {
            throw new IllegalArgumentException("Invalid class id");
        }

        try {
            if (!classEntityDAO.classExists(classId)) {
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }

            List<Integer> normalizedCourseIds = normalizeCourseIds(courseIds);
            validateCoursesExist(normalizedCourseIds);
            classCourseDAO.replaceCoursesForClass(classId, normalizedCourseIds);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to set courses for class", e);
        }
    }

    public void addCourseToClass(int classId, int courseId) throws ClassNotFoundException {
        if (classId <= 0) {
            throw new IllegalArgumentException("Invalid class id");
        }

        if (courseId <= 0) {
            throw new IllegalArgumentException("Invalid course id");
        }

        try {
            if (!classEntityDAO.classExists(classId)) {
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }

            if (!courseDAO.courseExists(courseId)) {
                throw new IllegalArgumentException("Course not found with id: " + courseId);
            }

            classCourseDAO.addCourseToClass(classId, courseId);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to add course to class", e);
        }
    }

    public void removeCourseFromClass(int classId, int courseId) throws ClassNotFoundException {
        if (classId <= 0) {
            throw new IllegalArgumentException("Invalid class id");
        }

        if (courseId <= 0) {
            throw new IllegalArgumentException("Invalid course id");
        }

        try {
            if (!classEntityDAO.classExists(classId)) {
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }

            classCourseDAO.removeCourseFromClass(classId, courseId);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to remove course from class", e);
        }
    }

    public void updateClass(ClassEntity classEntity) throws ClassNotFoundException {
        if(classEntity == null){
            throw new IllegalArgumentException("Class cannot be empty");
        }

        if(classEntity.getName() == null || classEntity.getName().trim().isEmpty()){
            throw new IllegalArgumentException("Name cannot be empty");
        }

        if(classEntity.getYear() < 0){
            throw new IllegalArgumentException("Year cannot be in the negative");
        }

        if (classEntity.getSemester() != 1 && classEntity.getSemester() != 2) {
            throw new IllegalArgumentException("Semester must be 1 or 2");
        }

        if (classEntity.getStartDate() == null || classEntity.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }

        LocalDate parsedStartDate = LocalDate.parse(classEntity.getStartDate());
        LocalDate parsedEndDate = LocalDate.parse(classEntity.getEndDate());

        if (parsedStartDate.isAfter(parsedEndDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        if (classEntity.getCreatedBy() <= 0) {
            throw new IllegalArgumentException("Creator id must be positive");
        }

        try{
            boolean isUpdated = classEntityDAO.updateClass(classEntity);

            if(!isUpdated){
                throw new ClassNotFoundException("Class was not updated");
            }
        }
        catch (SQLException e){
                throw new RuntimeException("Failed to update class");
        }
    }

    public void deleteClass(int classId) throws ClassNotFoundException {
        if (classId < 0) {
            throw new IllegalArgumentException("Invalid class id");
        }

        try {
            boolean isDeleted = classEntityDAO.deleteClass(classId);

            if (!isDeleted) {
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to delete class", e);
        }
    }

    public List<ClassEntity> getClassesByCreator(int createdBy) {
        if (createdBy < 0) {
            throw new IllegalArgumentException("Invalid creator id");
        }

        try {
            return classEntityDAO.getByCreatedBy(createdBy);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to get classes by creator", e);
        }
    }

    public List<ClassEntity> getClassesByTimeSlot(TimeSlot slot) {
        if (slot == null || slot.getDate() == null || slot.getStartTime() == null || slot.getEndTime() == null) {
            throw new IllegalArgumentException("Invalid time slot");
        }

        try {
            return classEntityDAO.getByTimeSlot(slot);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to get classes by time slot", e);
        }
    }

    public void cancelClass(int classId, String reason) throws ClassNotFoundException {
        if (classId < 0) {
            throw new IllegalArgumentException("Invalid class id");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason cannot be empty");
        }

        try {
            if (!classEntityDAO.classExists(classId)) {
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }

            classEntityDAO.cancelSchedulesForClass(classId);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to cancel class", e);
        }
    }

    public boolean classHasCourse(int classId, int courseId) {
        if (classId <= 0 || courseId <= 0) {
            return false;
        }

        try {
            return classCourseDAO.classHasCourse(classId, courseId);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to verify class course relationship", e);
        }
    }

    private List<Integer> normalizeCourseIds(List<Integer> courseIds) {
        List<Integer> normalized = new ArrayList<>();
        if (courseIds == null) {
            return normalized;
        }

        for (Integer courseId : new LinkedHashSet<>(courseIds)) {
            if (courseId == null || courseId <= 0) {
                throw new IllegalArgumentException("Invalid course id");
            }
            normalized.add(courseId);
        }

        return normalized;
    }

    private void validateCoursesExist(List<Integer> courseIds) throws SQLException {
        for (int courseId : courseIds) {
            if (!courseDAO.courseExists(courseId)) {
                throw new IllegalArgumentException("Course not found with id: " + courseId);
            }
        }
    }
}
