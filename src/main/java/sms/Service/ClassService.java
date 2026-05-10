package sms.Service;

import java.util.List;

import sms.Objects.ClassEntity;
import sms.Objects.TimeSlot;
import sms.exception.ClassNotFoundException;
import sms.exception.InvalidClassException;

public class ClassService {

    public void createClass(String name, int year, int createdBy) throws InvalidClassException {
        throw new UnsupportedOperationException("Create class not implemented yet");
    }

    public ClassEntity getClass(int classId) throws ClassNotFoundException {
        throw new UnsupportedOperationException("Get class not implemented yet");
    }

    public List<ClassEntity> getAllClasses() {
        throw new UnsupportedOperationException("Get all classes not implemented yet");
    }

    public void updateClass(ClassEntity classEntity) throws ClassNotFoundException {
        throw new UnsupportedOperationException("Update class not implemented yet");
    }

    public void deleteClass(int classId) throws ClassNotFoundException {
        throw new UnsupportedOperationException("Delete class not implemented yet");
    }

    public List<ClassEntity> getClassesByCreator(int createdBy) {
        throw new UnsupportedOperationException("Get classes by creator not implemented yet");
    }

    public List<ClassEntity> getClassesByTimeSlot(TimeSlot slot) {
        throw new UnsupportedOperationException("Get classes by timeslot not implemented yet");
    }

    public void cancelClass(int classId, String reason) throws ClassNotFoundException {
        throw new UnsupportedOperationException("Cancel class not implemented yet");
    }
}
