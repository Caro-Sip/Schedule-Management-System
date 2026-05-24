package sms.Service;

import java.util.List;

import sms.DAO.ClassroomDAO;
import sms.DAO.ScheduleDAO;
import sms.Objects.Classroom;
import sms.Objects.Schedule;
import sms.Objects.TimeSlot;
import sms.exception.InvalidRoomException;
import sms.exception.RoomNotFoundException;

public class RoomService {
    private final ClassroomDAO classroomDAO;
    private final ScheduleDAO scheduleDAO;

    public RoomService(ClassroomDAO classroomDAO, ScheduleDAO scheduleDAO) {
        this.classroomDAO = classroomDAO;
        this.scheduleDAO = scheduleDAO;
    }

    public void createRoom(String name, String building) throws InvalidRoomException {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        String normalizedBuilding = normalizeBuilding(building);

        try {
            Classroom classroom = new Classroom(name.trim(), normalizedBuilding);
            boolean isCreated = classroomDAO.createClassroom(classroom);

            if (!isCreated) {
                throw new InvalidRoomException("Room was not created");
            }
        } catch (java.sql.SQLException e) {
            throw new InvalidRoomException("Failed to create room", e);
        }
    }

    public Classroom getRoom(int roomId) throws RoomNotFoundException {
        if (roomId < 0) {
            throw new IllegalArgumentException("Invalid room id");
        }

        try {
            Classroom classroom = classroomDAO.getClassroomById(roomId);

            if (classroom == null) {
                throw new RoomNotFoundException("Room not found with id:" + roomId);
            }

            return classroom;
        } catch (java.sql.SQLException e) {
            throw new RoomNotFoundException("Failed to find room", e);
        }
    }

    public List<Classroom> getAllRooms() {
        try {
            return classroomDAO.getAllClassrooms();
        } catch (java.sql.SQLException e) {
            throw new RuntimeException("Failed to retrieve rooms", e);
        }
    }

    public void updateRoom(Classroom room) throws RoomNotFoundException {
        if (room == null) {
            throw new IllegalArgumentException("Room cannot be empty");
        }

        if (room.getId() < 0) {
            throw new IllegalArgumentException("Invalid room id");
        }

        if (room.getName() == null || room.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        room.setBuilding(normalizeBuilding(room.getBuilding()));

        try {
            boolean isUpdated = classroomDAO.updateClassroom(room);

            if (!isUpdated) {
                throw new RoomNotFoundException("Room not found with id:" + room.getId());
            }
        } catch (java.sql.SQLException e) {
            throw new RuntimeException("Failed to update room", e);
        }
    }

    public void deleteRoom(int roomId) throws RoomNotFoundException {
        if (roomId < 0) {
            throw new IllegalArgumentException("Invalid room id");
        }

        try {
            boolean isDeleted = classroomDAO.deleteClassroom(roomId);

            if (!isDeleted) {
                throw new RoomNotFoundException("Room not found with id:" + roomId);
            }
        } catch (java.sql.SQLException e) {
            throw new RuntimeException("Failed to delete room", e);
        }
    }
 
    // TODO implement isRoomAvailable function
    // public boolean isRoomAvailable(int roomId, TimeSlot slot) {
    //     if (roomId < 0) {
    //         throw new IllegalArgumentException("Invalid room id");
    //     }

    //     if (slot == null || slot.getDate() == null || slot.getStartTime() == null || slot.getEndTime() == null) {
    //         throw new IllegalArgumentException("Invalid time slot");
    //     }

    //     try {
    //         if (!classroomDAO.classroomExists(roomId)) {
    //             throw new IllegalArgumentException("Room not found with id:" + roomId);
    //         }
    //     } catch (java.sql.SQLException e) {
    //         throw new RuntimeException("Failed to check room availability", e);
    //     }

    //     for (Schedule schedule : scheduleDAO.getAllSchedules()) {
    //         if (schedule.getClassroomId() != roomId) {
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

    private String normalizeBuilding(String building) {
        if (building == null) {
            return null;
        }

        String trimmed = building.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
