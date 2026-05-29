package sms.Service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import sms.DAO.ClassEntityDAO;
import sms.DAO.ClassCourseDAO;
import sms.DAO.ClassroomDAO;
import sms.DAO.CourseDAO;
import sms.DAO.RecurringScheduleDAO;
import sms.DAO.ScheduleClassDAO;
import sms.DAO.ScheduleDAO;
import sms.DAO.TeacherDAO;
import sms.Objects.ClassEntity;
import sms.Objects.RecurringSchedule;
import sms.Objects.Schedule;
import sms.Objects.TimeSlot;
import sms.exception.ClassNotFoundException;
import sms.exception.ScheduleNotFoundException;

public class ScheduleService {
    private static final Set<String> ALLOWED_SCHEDULE_TYPES = Set.of(
            "DEFAULT",
            "LECTURE",
            "TUTORIAL",
            "PRACTICAL",
            "MAKEUP",
            "OVERRIDE");

    private final ScheduleDAO scheduleDAO;
    private final ScheduleClassDAO scheduleClassDAO;
    private final ClassEntityDAO classEntityDAO;
    private final ClassCourseDAO classCourseDAO;
    private final ClassroomDAO classroomDAO;
    private final CourseDAO courseDAO;
    private final TeacherDAO teacherDAO;
    private final RecurringScheduleDAO recurringScheduleDAO;

    public ScheduleService() {
        this(new ScheduleDAO(), new ScheduleClassDAO(), new ClassEntityDAO(), new ClassCourseDAO(), new ClassroomDAO(), new CourseDAO(), new TeacherDAO(), new RecurringScheduleDAO());
    }

    public ScheduleService(ScheduleDAO scheduleDAO, ScheduleClassDAO scheduleClassDAO,
            ClassEntityDAO classEntityDAO) {
        this(scheduleDAO, scheduleClassDAO, classEntityDAO, new ClassCourseDAO(), new ClassroomDAO(), new CourseDAO(), new TeacherDAO(), new RecurringScheduleDAO());
    }

    public ScheduleService(ScheduleDAO scheduleDAO, ScheduleClassDAO scheduleClassDAO,
            ClassEntityDAO classEntityDAO, ClassCourseDAO classCourseDAO, ClassroomDAO classroomDAO, CourseDAO courseDAO,
            TeacherDAO teacherDAO) {
        this(scheduleDAO, scheduleClassDAO, classEntityDAO, classCourseDAO, classroomDAO, courseDAO, teacherDAO, new RecurringScheduleDAO());
    }

    public ScheduleService(ScheduleDAO scheduleDAO, ScheduleClassDAO scheduleClassDAO,
            ClassEntityDAO classEntityDAO, ClassCourseDAO classCourseDAO, ClassroomDAO classroomDAO, CourseDAO courseDAO,
            TeacherDAO teacherDAO, RecurringScheduleDAO recurringScheduleDAO) {
        this.scheduleDAO = scheduleDAO;
        this.scheduleClassDAO = scheduleClassDAO;
        this.classEntityDAO = classEntityDAO;
        this.classCourseDAO = classCourseDAO;
        this.classroomDAO = classroomDAO;
        this.courseDAO = courseDAO;
        this.teacherDAO = teacherDAO;
        this.recurringScheduleDAO = recurringScheduleDAO;
    }

    public Schedule createSchedule(int classroomId, Integer teacherId, int courseId, LocalDate date,
            LocalTime startTime, LocalTime endTime, String status, String visibility, String type,
            int priority, int createdBy, List<Integer> classIds, Integer linkedScheduleId) {
        return createSchedule(classroomId, teacherId, courseId, date, startTime, endTime, status, visibility, type,
                priority, createdBy, classIds, linkedScheduleId, false);
    }

    public Schedule createSchedule(int classroomId, Integer teacherId, int courseId, LocalDate date,
            LocalTime startTime, LocalTime endTime, String status, String visibility, String type,
            int priority, int createdBy, List<Integer> classIds, Integer linkedScheduleId, boolean recurring) {
        validateScheduleCore(classroomId, teacherId, courseId, date, startTime, endTime, priority, createdBy);

        List<Integer> normalizedClassIds = normalizeClassIds(classIds);
        if (normalizedClassIds.isEmpty()) {
            throw new IllegalArgumentException("At least one class id is required");
        }

        String normalizedStatus = normalizeValue(status, "BOOKED");
        String normalizedVisibility = normalizeValue(visibility, "VISIBLE");
        String normalizedType = normalizeScheduleType(type);

        try {
            validateScheduleReferences(classroomId, teacherId, courseId, linkedScheduleId, normalizedClassIds);

            Schedule schedule = new Schedule(
                    classroomId,
                    teacherId,
                    courseId,
                    date,
                    startTime,
                    endTime,
                    normalizedStatus,
                    normalizedVisibility,
                    normalizedType,
                    priority,
                    createdBy
            );
            schedule.setCreatedAt(LocalDateTime.now());
            schedule.setLinkedScheduleId(linkedScheduleId != null && linkedScheduleId > 0 ? linkedScheduleId : null);

            if (!scheduleDAO.createSchedule(schedule)) {
                throw new RuntimeException("Schedule was not created");
            }

            List<Integer> linkedClassIds = new ArrayList<>();
            try {
                for (int classId : normalizedClassIds) {
                    if (!scheduleClassDAO.createScheduleClass(schedule.getId(), classId)) {
                        throw new RuntimeException("Failed to link class " + classId + " to schedule");
                    }
                    linkedClassIds.add(classId);
                }

                if (recurring) {
                    if (normalizedClassIds.size() != 1) {
                        throw new IllegalArgumentException("Recurring schedules require exactly one class id");
                    }

                    createRecurringScheduleInstances(schedule, normalizedClassIds.get(0));
                }
            } catch (Exception e) {
                rollbackCreatedSchedule(schedule.getId(), linkedClassIds);
                throw e;
            }

            return schedule;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create schedule", e);
        }
    }

    public Schedule saveSchedule(int scheduleId, Integer classroomId, Integer teacherId, Integer courseId,
            LocalDate date, LocalTime startTime, LocalTime endTime, String status, String visibility,
            String type, Integer priority, Integer createdBy, List<Integer> classIds,
            Integer linkedScheduleId) {
        if (scheduleId <= 0) {
            throw new IllegalArgumentException("Invalid schedule id");
        }

        try {
            Schedule existing = scheduleDAO.getScheduleById(scheduleId);
            if (existing == null) {
                throw new ScheduleNotFoundException("Schedule not found with id: " + scheduleId);
            }

            int resolvedClassroomId = classroomId != null ? classroomId : existing.getClassroomId();
            Integer resolvedTeacherId = teacherId != null ? teacherId : existing.getTeacherId();
            int resolvedCourseId = courseId != null ? courseId : existing.getCourseId();
            LocalDate resolvedDate = date != null ? date : existing.getDate();
            LocalTime resolvedStartTime = startTime != null ? startTime : existing.getStartTime();
            LocalTime resolvedEndTime = endTime != null ? endTime : existing.getEndTime();
            String resolvedStatus = normalizeValue(status, existing.getStatus());
            String resolvedVisibility = normalizeValue(visibility, existing.getVisibility());
            String resolvedType = normalizeScheduleType(type, existing.getType());
            int resolvedPriority = priority != null ? priority : existing.getPriority();
            int resolvedCreatedBy = createdBy != null ? createdBy : existing.getCreatedBy();
            Integer resolvedLinkedScheduleId = linkedScheduleId != null ? linkedScheduleId : existing.getLinkedScheduleId();
            List<Integer> resolvedClassIds = normalizeClassIds(classIds);
            if (resolvedClassIds.isEmpty()) {
                resolvedClassIds = scheduleClassDAO.getClassIdsByScheduleId(scheduleId);
            }

            validateScheduleCore(
                    resolvedClassroomId,
                    resolvedTeacherId,
                    resolvedCourseId,
                    resolvedDate,
                    resolvedStartTime,
                    resolvedEndTime,
                    resolvedPriority,
                    resolvedCreatedBy);

            if (resolvedClassIds.isEmpty()) {
                throw new IllegalArgumentException("At least one class id is required");
            }

            validateScheduleReferences(resolvedClassroomId, resolvedTeacherId, resolvedCourseId, resolvedLinkedScheduleId,
                    resolvedClassIds);

            existing.setClassroomId(resolvedClassroomId);
            existing.setTeacherId(resolvedTeacherId);
            existing.setCourseId(resolvedCourseId);
            existing.setDate(resolvedDate);
            existing.setStartTime(resolvedStartTime);
            existing.setEndTime(resolvedEndTime);
            existing.setStatus(resolvedStatus);
            existing.setVisibility(resolvedVisibility);
            existing.setType(resolvedType);
            existing.setPriority(resolvedPriority);
            existing.setCreatedBy(resolvedCreatedBy);
            existing.setLinkedScheduleId(resolvedLinkedScheduleId != null && resolvedLinkedScheduleId > 0 ? resolvedLinkedScheduleId : null);

            if (!scheduleDAO.updateSchedule(existing)) {
                throw new RuntimeException("Schedule was not updated");
            }

            List<Integer> previousClassIds = scheduleClassDAO.getClassIdsByScheduleId(scheduleId);
            scheduleClassDAO.deleteByScheduleId(scheduleId);
            List<Integer> appliedClassIds = new ArrayList<>();
            try {
                for (int classId : resolvedClassIds) {
                    if (!scheduleClassDAO.createScheduleClass(scheduleId, classId)) {
                        throw new RuntimeException("Failed to link class " + classId + " to schedule");
                    }
                    appliedClassIds.add(classId);
                }
            } catch (Exception e) {
                rollbackScheduleClassLinks(scheduleId, appliedClassIds, previousClassIds);
                throw e;
            }

            return existing;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save schedule", e);
        }
    }

    public void deleteSchedule(int scheduleId) throws ScheduleNotFoundException {
        if (scheduleId <= 0) {
            throw new IllegalArgumentException("Invalid schedule id");
        }

        try {
            Schedule existing = scheduleDAO.getScheduleById(scheduleId);
            if (existing == null) {
                throw new ScheduleNotFoundException("Schedule not found with id: " + scheduleId);
            }

            scheduleClassDAO.deleteByScheduleId(scheduleId);
            if (!scheduleDAO.deleteSchedule(scheduleId)) {
                throw new RuntimeException("Schedule was not deleted");
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete schedule", e);
        }
    }

    public List<Schedule> getAllSchedules() {
        try{
            List<Schedule> schedulesViewList = scheduleDAO.getAllSchedules();
            return schedulesViewList;
        } catch (SQLException e){
            throw new RuntimeException("Failed to retrieve schedules",e);
        }
    }

    public List<Map<String, Object>> getAllScheduleViews() {
        try {
            return buildScheduleViews(scheduleDAO.getAllSchedules());
        } catch (SQLException e) {
            throw new RuntimeException("Failed to retrieve schedules", e);
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

    public List<Map<String, Object>> getScheduleViewsForClass(int classId) {
        validateClassId(classId);

        try {
            List<Map<String, Object>> schedules = new ArrayList<>();
            for (int scheduleId : scheduleClassDAO.getScheduleIdsByClassId(classId)) {
                Schedule schedule = scheduleDAO.getScheduleById(scheduleId);
                if (schedule != null) {
                    schedules.add(buildScheduleView(schedule));
                }
            }
            return schedules;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get class schedule views", e);
        }
    }

    public List<Map<String, Object>> getScheduleViewsForTeacher(int teacherId) {
        validateTeacherId(teacherId);

        try {
            List<Map<String, Object>> schedules = new ArrayList<>();
            for (Schedule schedule : scheduleDAO.getAllSchedules()) {
                Integer assignedTeacherId = schedule.getTeacherId();
                if (assignedTeacherId != null && assignedTeacherId == teacherId) {
                    schedules.add(buildScheduleView(schedule));
                }
            }
            return schedules;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get teacher schedule views", e);
        }
    }

    public List<Map<String, Object>> getScheduleViewsForRoom(int roomId) {
        if (roomId < 0) {
            throw new IllegalArgumentException("Invalid room id");
        }

        try {
            List<Map<String, Object>> schedules = new ArrayList<>();
            for (Schedule schedule : scheduleDAO.getAllSchedules()) {
                if (schedule.getClassroomId() == roomId) {
                    schedules.add(buildScheduleView(schedule));
                }
            }
            return schedules;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get room schedule views", e);
        }
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

    private List<Map<String, Object>> buildScheduleViews(Collection<Schedule> schedules) {
        List<Map<String, Object>> views = new ArrayList<>();
        for (Schedule schedule : schedules) {
            views.add(buildScheduleView(schedule));
        }
        return views;
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

    private void validateScheduleCore(int classroomId, Integer teacherId, int courseId, LocalDate date,
            LocalTime startTime, LocalTime endTime, int priority, int createdBy) {
        if (classroomId <= 0) {
            throw new IllegalArgumentException("Invalid classroom id");
        }

        if (teacherId != null && teacherId <= 0) {
            throw new IllegalArgumentException("Invalid teacher id");
        }

        if (courseId <= 0) {
            throw new IllegalArgumentException("Invalid course id");
        }

        if (date == null || startTime == null || endTime == null) {
            throw new IllegalArgumentException("Date, start time, and end time are required");
        }

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (priority < 0) {
            throw new IllegalArgumentException("Priority cannot be negative");
        }

        if (createdBy <= 0) {
            throw new IllegalArgumentException("Creator id must be positive");
        }
    }

    private void validateScheduleReferences(int classroomId, Integer teacherId, int courseId,
            Integer linkedScheduleId, List<Integer> classIds) throws Exception {
        if (!classroomDAO.classroomExists(classroomId)) {
            throw new IllegalArgumentException("Classroom not found with id: " + classroomId);
        }

        if (!courseDAO.courseExists(courseId)) {
            throw new IllegalArgumentException("Course not found with id: " + courseId);
        }

        if (teacherId != null && !teacherDAO.teacherExists(teacherId)) {
            throw new IllegalArgumentException("Teacher not found with id: " + teacherId);
        }

        if (linkedScheduleId != null && linkedScheduleId > 0 && !scheduleDAO.scheduleExists(linkedScheduleId)) {
            throw new IllegalArgumentException("Linked schedule not found with id: " + linkedScheduleId);
        }

        for (int classId : classIds) {
            if (!classEntityDAO.classExists(classId)) {
                throw new IllegalArgumentException("Class not found with id: " + classId);
            }

            if (!classCourseDAO.classHasCourse(classId, courseId)) {
                throw new IllegalArgumentException("Course not assigned to class with id: " + classId);
            }
        }
    }

    private List<Integer> normalizeClassIds(List<Integer> classIds) {
        List<Integer> normalized = new ArrayList<>();
        if (classIds == null) {
            return normalized;
        }

        for (Integer classId : new LinkedHashSet<>(classIds)) {
            if (classId == null || classId <= 0) {
                throw new IllegalArgumentException("Invalid class id");
            }
            normalized.add(classId);
        }

        return normalized;
    }

    private String normalizeValue(String value, String defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        return value.trim().toUpperCase();
    }

    private String normalizeScheduleType(String value) {
        return normalizeScheduleType(value, "DEFAULT");
    }

    private String normalizeScheduleType(String value, String defaultValue) {
        String normalized = value == null || value.trim().isEmpty()
                ? defaultValue.trim().toUpperCase()
                : value.trim().toUpperCase();
        if (!ALLOWED_SCHEDULE_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("Invalid schedule type");
        }
        return normalized;
    }

    private void rollbackCreatedSchedule(int scheduleId, List<Integer> classIds) {
        for (int classId : classIds) {
            try {
                scheduleClassDAO.deleteScheduleClass(scheduleId, classId);
            } catch (Exception ignored) {
                // Best-effort rollback only.
            }
        }

        try {
            scheduleDAO.deleteSchedule(scheduleId);
        } catch (Exception ignored) {
            // Best-effort rollback only.
        }
    }

    private void createRecurringScheduleInstances(Schedule schedule, int classId) throws Exception {
        if (schedule.getTeacherId() == null) {
            throw new IllegalArgumentException("Recurring schedules require a teacher");
        }

        ClassEntity classEntity = classEntityDAO.getById(classId);
        if (classEntity == null) {
            throw new ClassNotFoundException("Class not found with id: " + classId);
        }

        LocalDate classEndDate = LocalDate.parse(classEntity.getEndDate());
        LocalDate nextDate = schedule.getDate().plusWeeks(1);
        if (nextDate.isAfter(classEndDate)) {
            return;
        }

        List<Integer> recurringScheduleIds = new ArrayList<>();
        try {
            while (!nextDate.isAfter(classEndDate)) {
                Schedule recurringSchedule = new Schedule(
                        schedule.getClassroomId(),
                        schedule.getTeacherId(),
                        schedule.getCourseId(),
                        nextDate,
                        schedule.getStartTime(),
                        schedule.getEndTime(),
                        schedule.getStatus(),
                        schedule.getVisibility(),
                        schedule.getType(),
                        schedule.getPriority(),
                        schedule.getCreatedBy());
                recurringSchedule.setCreatedAt(schedule.getCreatedAt());
                recurringSchedule.setLinkedScheduleId(schedule.getLinkedScheduleId());

                if (!scheduleDAO.createSchedule(recurringSchedule)) {
                    throw new RuntimeException("Failed to create recurring schedule on " + nextDate);
                }

                recurringScheduleIds.add(recurringSchedule.getId());

                if (!scheduleClassDAO.createScheduleClass(recurringSchedule.getId(), classId)) {
                    throw new RuntimeException("Failed to link recurring class " + classId + " to schedule");
                }

                nextDate = nextDate.plusWeeks(1);
            }

            RecurringSchedule recurringRule = new RecurringSchedule(
                    schedule.getTeacherId(),
                    schedule.getClassroomId(),
                    schedule.getCourseId(),
                    schedule.getDate().getDayOfWeek().getValue() - 1,
                    schedule.getStartTime(),
                    schedule.getEndTime(),
                    schedule.getDate().plusWeeks(1),
                    classEndDate);

            if (!recurringScheduleDAO.createSchedule(recurringRule)) {
                throw new RuntimeException("Failed to create recurring schedule rule");
            }
        } catch (Exception e) {
            for (int recurringScheduleId : recurringScheduleIds) {
                rollbackCreatedSchedule(recurringScheduleId, List.of(classId));
            }
            throw e;
        }
    }

    private void rollbackScheduleClassLinks(int scheduleId, List<Integer> appliedClassIds, List<Integer> previousClassIds) {
        for (int classId : appliedClassIds) {
            try {
                scheduleClassDAO.deleteScheduleClass(scheduleId, classId);
            } catch (Exception ignored) {
                // Best-effort rollback only.
            }
        }

        for (int classId : previousClassIds) {
            try {
                scheduleClassDAO.createScheduleClass(scheduleId, classId);
            } catch (Exception ignored) {
                // Best-effort rollback only.
            }
        }
    }
}
