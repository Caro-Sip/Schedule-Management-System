package sms.Service;

import java.util.List;

import sms.Objects.Classroom;
import sms.Objects.TimeSlot;
import sms.exception.InvalidRoomException;
import sms.exception.RoomNotFoundException;

public class RoomService {

    public void createRoom(String name, String building, int capacity) throws InvalidRoomException {
        throw new UnsupportedOperationException("Create room not implemented yet");
    }

    public Classroom getRoom(int roomId) throws RoomNotFoundException {
        throw new UnsupportedOperationException("Get room not implemented yet");
    }

    public List<Classroom> getAllRooms() {
        throw new UnsupportedOperationException("Get all rooms not implemented yet");
    }

    public void updateRoom(Classroom room) throws RoomNotFoundException {
        throw new UnsupportedOperationException("Update room not implemented yet");
    }

    public void deleteRoom(int roomId) throws RoomNotFoundException {
        throw new UnsupportedOperationException("Delete room not implemented yet");
    }

    public List<Classroom> getRoomsByCapacity(int minimumCapacity) {
        throw new UnsupportedOperationException("Get rooms by capacity not implemented yet");
    }

    public boolean isRoomAvailable(int roomId, TimeSlot slot) {
        throw new UnsupportedOperationException("Room availability check not implemented yet");
    }

    public boolean doesRoomHaveEquipment(int roomId, String equipment) {
        throw new UnsupportedOperationException("Room equipment check not implemented yet");
    }
}
