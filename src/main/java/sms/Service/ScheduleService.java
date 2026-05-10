package sms.Service;

import java.util.List;

import sms.Objects.ClassEntity;
import sms.Objects.Schedule;
import sms.Objects.ScheduleConflict;
import sms.Objects.TimeSlot;
import sms.exception.ClassNotFoundException;
import sms.exception.ScheduleConflictException;
import sms.exception.ScheduleNotFoundException;
import sms.exception.TeacherNotFoundException;

public class ScheduleService {

    public void assignTeacherToClass(int classId, int teacherId, int userId)
            throws ClassNotFoundException, TeacherNotFoundException, ScheduleConflictException {
        throw new UnsupportedOperationException("Assign teacher not implemented yet");
    }

    public void removeTeacherFromClass(int classId, int teacherId, int userId)
            throws ScheduleNotFoundException {
        throw new UnsupportedOperationException("Remove teacher not implemented yet");
    }

    public List<ScheduleConflict> detectConflicts(int teacherId, TimeSlot slot)
            throws TeacherNotFoundException {
        throw new UnsupportedOperationException("Conflict detection not implemented yet");
    }

    public boolean hasConflict(int teacherId, TimeSlot slot) {
        throw new UnsupportedOperationException("Conflict check not implemented yet");
    }

    public void scheduleMakeupClass(int originalClassId, TimeSlot newSlot, String reason, int userId)
            throws ClassNotFoundException, ScheduleConflictException {
        throw new UnsupportedOperationException("Makeup scheduling not implemented yet");
    }

    public void scheduleMarkupClass(int originalClassId, TimeSlot newSlot, String reason, int userId)
            throws ClassNotFoundException, ScheduleConflictException {
        throw new UnsupportedOperationException("Makeup scheduling not implemented yet");
    }

    public List<ClassEntity> getMakeupClassesForOriginal(int originalClassId) {
        throw new UnsupportedOperationException("Makeup class lookup not implemented yet");
    }

    public void markClassAsMissed(int classId, String reason, int userId)
            throws ClassNotFoundException {
        throw new UnsupportedOperationException("Mark missed class not implemented yet");
    }

    public void recordMissedClass(int classId, String reason, int userId)
            throws ClassNotFoundException {
        throw new UnsupportedOperationException("Record missed class not implemented yet");
    }

    public List<ClassEntity> getMissedClasses() {
        throw new UnsupportedOperationException("Missed class lookup not implemented yet");
    }

    public List<ClassEntity> getMissedClassesByTeacher(int teacherId) {
        throw new UnsupportedOperationException("Missed class lookup not implemented yet");
    }

    public List<Schedule> getSchedulesForTeacher(int teacherId) {
        throw new UnsupportedOperationException("Teacher schedule lookup not implemented yet");
    }

    public List<Schedule> getSchedulesForRoom(int roomId) {
        throw new UnsupportedOperationException("Room schedule lookup not implemented yet");
    }

    public List<Schedule> getSchedulesForTimeSlot(TimeSlot slot) {
        throw new UnsupportedOperationException("Timeslot schedule lookup not implemented yet");
    }

    public Schedule getScheduleForClass(int classId) throws ScheduleNotFoundException {
        throw new UnsupportedOperationException("Class schedule lookup not implemented yet");
    }

    public List<Schedule> getSchedulesForClass(int classId) {
        throw new UnsupportedOperationException("Class schedule lookup not implemented yet");
    }

    public List<Schedule> getScheduleForTeacher(int teacherId) {
        return getSchedulesForTeacher(teacherId);
    }

    public List<Schedule> getScheduleForRoom(int classroomId) {
        return getSchedulesForRoom(classroomId);
    }
}
