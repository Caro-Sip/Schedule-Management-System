package sms.Service;

import sms.Objects.ClassEntity;
import sms.Objects.Classroom;
import sms.Objects.Teacher;
import sms.Objects.TimeSlot;
import sms.exception.InvalidClassException;
import sms.exception.InvalidRoomException;
import sms.exception.InvalidTeacherException;
import sms.exception.InvalidTimeSlotException;
import sms.exception.TeacherOverloadedException;

public class ValidationService {

    public void validateTeacher(Teacher teacher) throws InvalidTeacherException {
        throw new UnsupportedOperationException("Teacher validation not implemented yet");
    }

    public void validateRoom(Classroom room) throws InvalidRoomException {
        throw new UnsupportedOperationException("Room validation not implemented yet");
    }

    public void validateClass(ClassEntity classEntity) throws InvalidClassException {
        throw new UnsupportedOperationException("Class validation not implemented yet");
    }

    public void validateTimeSlot(TimeSlot slot) throws InvalidTimeSlotException {
        throw new UnsupportedOperationException("Timeslot validation not implemented yet");
    }

    public boolean isValidEmail(String email) {
        throw new UnsupportedOperationException("Email validation not implemented yet");
    }

    public boolean isValidPhoneNumber(String phone) {
        throw new UnsupportedOperationException("Phone validation not implemented yet");
    }

    public boolean isValidRoomNumber(String roomNumber) {
        throw new UnsupportedOperationException("Room number validation not implemented yet");
    }

    public boolean isValidClassCode(String code) {
        throw new UnsupportedOperationException("Class code validation not implemented yet");
    }

    public void validateTeacherNotOverloaded(int teacherId, int maxClassesPerSemester)
            throws TeacherOverloadedException {
        throw new UnsupportedOperationException("Teacher overload validation not implemented yet");
    }
}
