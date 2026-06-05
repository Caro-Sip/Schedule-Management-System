package sms.Service;

import java.util.List;

import sms.DAO.ClassroomDAO;
import sms.Objects.Classroom;
import sms.exception.InvalidRoomException;
import sms.exception.RoomNotFoundException;

public class RoomService {
    private final ClassroomDAO classroomDAO;

    public RoomService() {
        this(new ClassroomDAO());
    }

    public RoomService(ClassroomDAO classroomDAO) {
        this.classroomDAO = classroomDAO;
    }

    public Classroom createRoom(String name, String building) throws InvalidRoomException {
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

            return classroom;
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

    public Classroom getRoomByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Room name cannot be empty");
        }

        try {
            return classroomDAO.getClassroomByName(name.trim());
        } catch (java.sql.SQLException e) {
            throw new RuntimeException("Failed to retrieve room by name", e);
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
            Classroom existing = classroomDAO.getClassroomById(room.getId());
            if (existing != null && room.getCapacity() == null) {
                room.setCapacity(existing.getCapacity());
            }

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

    private String normalizeBuilding(String building) {
        if (building == null) {
            return null;
        }

        String trimmed = building.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
