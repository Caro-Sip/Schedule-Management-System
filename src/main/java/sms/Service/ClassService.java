package sms.Service;

import java.sql.SQLException;
import java.util.List;


import sms.DAO.ClassEntityDAO;
import sms.Objects.ClassEntity;
import sms.Objects.TimeSlot;
import sms.exception.ClassNotFoundException;
import sms.exception.InvalidClassException;

public class ClassService {
    ClassEntityDAO classEntityDAO;

    ClassService(ClassEntityDAO classEntityDAO){
        this.classEntityDAO = classEntityDAO;
    }

    public void createClass(String name, int year, int createdBy) throws InvalidClassException {
        if(name == null || name.trim().isEmpty()){
            throw new IllegalArgumentException("Name cannot be empty");
        }

        if(year < 0){
            throw new IllegalArgumentException("Year cannot be in the negative");
        }

        try{
            ClassEntity classEntity = new ClassEntity(name,year,createdBy);

            boolean isCreated = classEntityDAO.createClass(classEntity);

            if(!isCreated){
                throw new InvalidClassException("Class was not created");
            }
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

    public void updateClass(ClassEntity classEntity) throws ClassNotFoundException {
        if(classEntity == null){
            throw new IllegalArgumentException("Class cannot be empty");
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
}
