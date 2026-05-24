package sms.Service;

import java.sql.SQLException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import sms.DAO.ClassEntityDAO;
import sms.DAO.ScheduleClassDAO;
import sms.DAO.ScheduleDAO;
import sms.DAO.TeacherDAO;
import sms.Objects.ClassEntity;
import sms.Objects.Schedule;
import sms.Objects.ScheduleConflict;
import sms.Objects.TimeSlot;
import sms.exception.ClassNotFoundException;
import sms.exception.ScheduleConflictException;
import sms.exception.ScheduleNotFoundException;
import sms.exception.TeacherNotFoundException;

public class ScheduleService {
    private final ScheduleDAO scheduleDAO;
    private final ScheduleClassDAO scheduleClassDAO;
    private final ClassEntityDAO classEntityDAO;
    private final TeacherDAO teacherDAO;

    public ScheduleService() {
        this(new ScheduleDAO(), new ScheduleClassDAO(), new ClassEntityDAO(), new TeacherDAO());
    }

    public ScheduleService(ScheduleDAO scheduleDAO, ScheduleClassDAO scheduleClassDAO,
            ClassEntityDAO classEntityDAO, TeacherDAO teacherDAO) {
        this.scheduleDAO = scheduleDAO;
        this.scheduleClassDAO = scheduleClassDAO;
        this.classEntityDAO = classEntityDAO;
        this.teacherDAO = teacherDAO;
    }

    public List<Schedule> getAllSchedules() {
        try{
            List<Schedule> schedulesViewList = scheduleDAO.getAllSchedules();
            return schedulesViewList;
        } catch (SQLException e){
            throw new RuntimeException("Failed to retrieve schedules",e);
        }
    }

    public Schedule getSchedule(int id) {
        return scheduleDAO.getScheduleById(id);
    }

    // public List<Schedule> getAllScheduleViews() {
    //     try{
    //         List<Schedule> scheduleViewList = scheduleDAO.getAllSchedules();
    //         return scheduleViewList;
    //     } catch (SQLException e){
    //         throw new RuntimeException("Failed to retrieve schedules",e);
    //     }
    // }

    public Map<String, Object> getScheduleView(int id) {
        Schedule schedule = scheduleDAO.getScheduleById(id);
        if (schedule == null) {
            return null;
        }
        return buildScheduleView(schedule);
    }

    private Map<String, Object> buildScheduleView(Schedule schedule) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", schedule.getId());
        view.put("classroomId", schedule.getClassroomId());
        view.put("teacherId", schedule.getTeacherId());
        view.put("courseId", schedule.getCourseId());
        try {
            view.put("classIds", scheduleClassDAO.getClassIdsByScheduleId(schedule.getId()));
        } catch (Exception e) {
            view.put("classIds", List.of());
        }
        view.put("date", schedule.getDate() != null ? schedule.getDate().toString() : null);
        view.put("startTime", schedule.getStartTime() != null ? schedule.getStartTime().toString() : null);
        view.put("endTime", schedule.getEndTime() != null ? schedule.getEndTime().toString() : null);
        view.put("status", schedule.getStatus());
        view.put("visibility", schedule.getVisibility());
        view.put("type", schedule.getType());
        view.put("priority", schedule.getPriority());
        view.put("createdBy", schedule.getCreatedBy());
        view.put("createdAt", schedule.getCreatedAt() != null ? schedule.getCreatedAt().toString() : null);
        view.put("greyedAt", schedule.getGreyedAt() != null ? schedule.getGreyedAt().toString() : null);
        view.put("linkedScheduleId", schedule.getLinkedScheduleId());
        return view;
    }

    // TODO Schedule is not properly working yet
    // public void assignTeacherToClass(int classId, int teacherId, int userId)
    //         throws ClassNotFoundException, TeacherNotFoundException, ScheduleConflictException {
    //     validateClassId(classId);
    //     validateTeacherId(teacherId);

    //     try {
    //         if (!classEntityDAO.classExists(classId)) {
    //             throw new ClassNotFoundException("Class not found with id:" + classId);
    //         }

    //         if (!teacherDAO.teacherExists(teacherId)) {
    //             throw new TeacherNotFoundException("Teacher not found with id:" + teacherId);
    //         }

    //         List<Integer> scheduleIds = scheduleClassDAO.getScheduleIdsByClassId(classId);
    //         for (int scheduleId : scheduleIds) {
    //             Schedule schedule = scheduleDAO.getScheduleById(scheduleId);
    //             if (schedule == null) {
    //                 continue;
    //             }

    //             TimeSlot slot = new TimeSlot(schedule.getDate(), schedule.getStartTime(), schedule.getEndTime());
    //             List<ScheduleConflict> conflicts = findConflicts(teacherId, slot, scheduleId);
    //             if (!conflicts.isEmpty()) {
    //                 throw new ScheduleConflictException("Teacher has a scheduling conflict");
    //             }

    //             schedule.setTeacherId(teacherId);
    //             schedule.setCreatedBy(userId);
    //             boolean isUpdated = scheduleDAO.updateSchedule(schedule);
    //             if (!isUpdated) {
    //                 throw new ScheduleConflictException("Failed to assign teacher to class");
    //             }
    //         }
    //     } catch (ScheduleConflictException e) {
    //         throw e;
    //     } catch (Exception e) {
    //         throw new RuntimeException("Failed to assign teacher to class", e);
    //     }
    // }

    public void removeTeacherFromClass(int classId, int teacherId, int userId)
            throws ScheduleNotFoundException {
        validateClassId(classId);
        validateTeacherId(teacherId);

        try {
            int updated = 0;
            List<Integer> scheduleIds = scheduleClassDAO.getScheduleIdsByClassId(classId);
            for (int scheduleId : scheduleIds) {
                Schedule schedule = scheduleDAO.getScheduleById(scheduleId);
                if (schedule == null) {
                    continue;
                }

                Integer assignedTeacherId = schedule.getTeacherId();
                if (assignedTeacherId == null || assignedTeacherId != teacherId) {
                    continue;
                }

                schedule.setTeacherId(null);
                schedule.setCreatedBy(userId);
                if (scheduleDAO.updateSchedule(schedule)) {
                    updated++;
                }
            }

            if (updated == 0) {
                throw new ScheduleNotFoundException("No schedules found for class and teacher");
            }
        } catch (ScheduleNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to remove teacher from class", e);
        }
    }

    // TODO cannot see the current point of this function
    // public List<ScheduleConflict> detectConflicts(int teacherId, TimeSlot slot)
    //         throws TeacherNotFoundException {
    //     validateTeacherId(teacherId);
    //     validateTimeSlot(slot);

    //     try {
    //         if (!teacherDAO.teacherExists(teacherId)) {
    //             throw new TeacherNotFoundException("Teacher not found with id:" + teacherId);
    //         }
    //     } catch (TeacherNotFoundException e) {
    //         throw e;
    //     } catch (Exception e) {
    //         throw new RuntimeException("Failed to detect conflicts", e);
    //     }

    //     return findConflicts(teacherId, slot, null);
    // }

    // TODO need to recheck logic of this function
    // public boolean hasConflict(int teacherId, TimeSlot slot) {
    //     try {
    //         return !detectConflicts(teacherId, slot).isEmpty();
    //     } catch (TeacherNotFoundException e) {
    //         throw new RuntimeException("Failed to check conflicts", e);
    //     }
    // }

    // TODO normal schedule isn't working yet
    // public void scheduleMakeupClass(int originalClassId, TimeSlot newSlot, String reason, int userId)
    //         throws ClassNotFoundException, ScheduleConflictException {
    //     validateClassId(originalClassId);
    //     validateTimeSlot(newSlot);

    //     if (reason == null || reason.trim().isEmpty()) {
    //         throw new IllegalArgumentException("Reason cannot be empty");
    //     }

    //     try {
    //         if (!classEntityDAO.classExists(originalClassId)) {
    //             throw new ClassNotFoundException("Class not found with id:" + originalClassId);
    //         }

    //         Schedule baseSchedule = getOldestAbsentSchedule(originalClassId);
    //         Integer teacherId = baseSchedule.getTeacherId();
    //         if (teacherId != null && hasConflict(teacherId, newSlot)) {
    //             throw new ScheduleConflictException("Teacher has a scheduling conflict");
    //         }

    //         Duration missedDuration = Duration.between(baseSchedule.getStartTime(), baseSchedule.getEndTime());
    //         Duration newDuration = Duration.between(newSlot.getStartTime(), newSlot.getEndTime());
    //         if (!missedDuration.equals(newDuration)) {
    //             throw new IllegalArgumentException("Makeup duration must match missed class duration");
    //         }

    //         Schedule makeup = new Schedule(
    //                 baseSchedule.getClassroomId(),
    //                     baseSchedule.getTeacherId(),
    //                 baseSchedule.getCourseId(),
    //                 newSlot.getDate(),
    //                 newSlot.getStartTime(),
    //                 newSlot.getEndTime(),
    //                 "MAKEUP",
    //                 "VISIBLE",
    //                     baseSchedule.getType(),
    //                 baseSchedule.getPriority(),
    //                 userId
    //         );
    //         makeup.setCreatedAt(LocalDateTime.now());
    //         makeup.setLinkedScheduleId(baseSchedule.getId());

    //         boolean isCreated = scheduleDAO.createSchedule(makeup);
    //         if (!isCreated) {
    //             throw new ScheduleConflictException("Failed to create makeup class");
    //         }

    //         scheduleClassDAO.createScheduleClass(makeup.getId(), originalClassId);
    //     } catch (ScheduleConflictException e) {
    //         throw e;
    //     } catch (Exception e) {
    //         throw new RuntimeException("Failed to schedule makeup class", e);
    //     }
    // }

    // public void scheduleMarkupClass(int originalClassId, TimeSlot newSlot, String reason, int userId)
    //         throws ClassNotFoundException, ScheduleConflictException {
    //     scheduleMakeupClass(originalClassId, newSlot, reason, userId);
    // }

    public List<ClassEntity> getMakeupClassesForOriginal(int originalClassId) {
        validateClassId(originalClassId);

        Map<Integer, ClassEntity> classesById = new LinkedHashMap<>();
        try {
            List<Integer> originalScheduleIds = scheduleClassDAO.getScheduleIdsByClassId(originalClassId);
            if (originalScheduleIds.isEmpty()) {
                return new ArrayList<>();
            }

            for (Schedule schedule : scheduleDAO.getAllSchedules()) {
                if (schedule.getLinkedScheduleId() == null) {
                    continue;
                }

                if (!originalScheduleIds.contains(schedule.getLinkedScheduleId())) {
                    continue;
                }

                if (!isMakeup(schedule)) {
                    continue;
                }

                for (int classId : scheduleClassDAO.getClassIdsByScheduleId(schedule.getId())) {
                    ClassEntity classEntity = classEntityDAO.getById(classId);
                    if (classEntity != null) {
                        classesById.put(classEntity.getId(), classEntity);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to get makeup classes", e);
        }

        return new ArrayList<>(classesById.values());
    }

    public void markClassAsMissed(int classId, String reason, int userId)
            throws ClassNotFoundException {
        recordMissedClass(classId, reason, userId);
    }

    public void recordMissedClass(int classId, String reason, int userId)
            throws ClassNotFoundException {
        validateClassId(classId);

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason cannot be empty");
        }

        try {
            if (!classEntityDAO.classExists(classId)) {
                throw new ClassNotFoundException("Class not found with id:" + classId);
            }

            List<Integer> scheduleIds = scheduleClassDAO.getScheduleIdsByClassId(classId);
            for (int scheduleId : scheduleIds) {
                Schedule schedule = scheduleDAO.getScheduleById(scheduleId);
                if (schedule == null) {
                    continue;
                }
                schedule.setStatus("ABSENT");
                schedule.setCreatedBy(userId);
                scheduleDAO.updateSchedule(schedule);
            }
        } catch (ClassNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to record missed class", e);
        }
    }

    public List<ClassEntity> getMissedClasses() {
        return getMissedClassesByTeacher(-1);
    }

    public List<ClassEntity> getMissedClassesByTeacher(int teacherId) {
        Map<Integer, ClassEntity> classesById = new LinkedHashMap<>();
        try {
            for (Schedule schedule : scheduleDAO.getAllSchedules()) {
                if (!isMissed(schedule)) {
                    continue;
                }

                Integer assignedTeacherId = schedule.getTeacherId();
                if (teacherId >= 0 && (assignedTeacherId == null || assignedTeacherId != teacherId)) {
                    continue;
                }

                for (int classId : scheduleClassDAO.getClassIdsByScheduleId(schedule.getId())) {
                    ClassEntity classEntity = classEntityDAO.getById(classId);
                    if (classEntity != null) {
                        classesById.put(classEntity.getId(), classEntity);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to get missed classes", e);
        }

        return new ArrayList<>(classesById.values());
    }

    // TODO implement later
    // public List<Schedule> getSchedulesForTeacher(int teacherId) {
    //     validateTeacherId(teacherId);

    //     List<Schedule> matches = new ArrayList<>();
    //     for (Schedule schedule : scheduleDAO.getAllSchedules()) {
    //         Integer assignedTeacherId = schedule.getTeacherId();
    //         if (assignedTeacherId != null && assignedTeacherId == teacherId) {
    //             matches.add(schedule);
    //         }
    //     }
    //     return matches;
    // }

    // TODO implement schedule later
    // public List<Schedule> getSchedulesForRoom(int roomId) {
    //     if (roomId < 0) {
    //         throw new IllegalArgumentException("Invalid room id");
    //     }

    //     List<Schedule> matches = new ArrayList<>();
    //     for (Schedule schedule : scheduleDAO.getAllSchedules()) {
    //         if (schedule.getClassroomId() == roomId) {
    //             matches.add(schedule);
    //         }
    //     }
    //     return matches;
    // }

    // TODO re-evaluate importance of this function
    // public List<Schedule> getSchedulesForTimeSlot(TimeSlot slot) {
    //     validateTimeSlot(slot);

    //     List<Schedule> matches = new ArrayList<>();
    //     for (Schedule schedule : scheduleDAO.getAllSchedules()) {
    //         if (schedule.getDate() == null || !schedule.getDate().equals(slot.getDate())) {
    //             continue;
    //         }

    //         if (isTimeOverlapping(slot, schedule)) {
    //             matches.add(schedule);
    //         }
    //     }
    //     return matches;
    // }

    public Schedule getScheduleForClass(int classId) throws ScheduleNotFoundException {
        validateClassId(classId);

        try {
            List<Integer> scheduleIds = scheduleClassDAO.getScheduleIdsByClassId(classId);
            for (int scheduleId : scheduleIds) {
                Schedule schedule = scheduleDAO.getScheduleById(scheduleId);
                if (schedule != null) {
                    return schedule;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to get class schedule", e);
        }

        throw new ScheduleNotFoundException("No schedule found for class");
    }

    public List<Schedule> getSchedulesForClass(int classId) {
        validateClassId(classId);
        List<Schedule> schedules = new ArrayList<>();

        try {
            List<Integer> scheduleIds = scheduleClassDAO.getScheduleIdsByClassId(classId);
            for (int scheduleId : scheduleIds) {
                Schedule schedule = scheduleDAO.getScheduleById(scheduleId);
                if (schedule != null) {
                    schedules.add(schedule);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to get class schedules", e);
        }

        return schedules;
    }

    // TODO why is there duplicate functions?
    // public List<Schedule> getScheduleForTeacher(int teacherId) {
    //     return getSchedulesForTeacher(teacherId);
    // }

    // public List<Schedule> getScheduleForRoom(int classroomId) {
    //     return getSchedulesForRoom(classroomId);
    // }

    private void validateClassId(int classId) {
        if (classId < 0) {
            throw new IllegalArgumentException("Invalid class id");
        }
    }

    private void validateTeacherId(int teacherId) {
        if (teacherId < 0) {
            throw new IllegalArgumentException("Invalid teacher id");
        }
    }

    private void validateTimeSlot(TimeSlot slot) {
        if (slot == null || slot.getDate() == null || slot.getStartTime() == null || slot.getEndTime() == null) {
            throw new IllegalArgumentException("Invalid time slot");
        }
    }

    // TODO Reimplement find schedule conflicts
    // private List<ScheduleConflict> findConflicts(int teacherId, TimeSlot slot, Integer excludeScheduleId) {
    //     List<ScheduleConflict> conflicts = new ArrayList<>();
    //     for (Schedule schedule : scheduleDAO.getAllSchedules()) {
    //         if (excludeScheduleId != null && schedule.getId() == excludeScheduleId) {
    //             continue;
    //         }

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
    //             conflicts.add(new ScheduleConflict(
    //                     schedule.getId(),
    //                     assignedTeacherId,
    //                     schedule.getClassroomId(),
    //                     "Time overlap",
    //                     slot
    //             ));
    //         }
    //     }
    //     return conflicts;
    // }

    private Schedule getOldestAbsentSchedule(int classId) throws ScheduleNotFoundException {
        Schedule oldest = null;
        try {
            List<Integer> scheduleIds = scheduleClassDAO.getScheduleIdsByClassId(classId);
            for (int scheduleId : scheduleIds) {
                Schedule schedule = scheduleDAO.getScheduleById(scheduleId);
                if (schedule == null || !isMissed(schedule)) {
                    continue;
                }

                if (oldest == null) {
                    oldest = schedule;
                    continue;
                }

                if (schedule.getDate().isBefore(oldest.getDate())) {
                    oldest = schedule;
                    continue;
                }

                if (schedule.getDate().isEqual(oldest.getDate())
                        && schedule.getStartTime().isBefore(oldest.getStartTime())) {
                    oldest = schedule;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to find missed class", e);
        }

        if (oldest == null) {
            throw new ScheduleNotFoundException("No missed class found to make up");
        }

        return oldest;
    }

    private boolean isTimeOverlapping(TimeSlot slot, Schedule schedule) {
        return slot.getStartTime().isBefore(schedule.getEndTime())
                && slot.getEndTime().isAfter(schedule.getStartTime());
    }

    private boolean isCancelled(Schedule schedule) {
        String status = schedule.getStatus();
        return status != null && status.equalsIgnoreCase("CANCELLED");
    }

    private boolean isMissed(Schedule schedule) {
        String status = schedule.getStatus();
        return status != null && status.equalsIgnoreCase("ABSENT");
    }

    private boolean isMakeup(Schedule schedule) {
        String type = schedule.getType();
        return type != null && type.equalsIgnoreCase("MAKEUP");
    }
}
