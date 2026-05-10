package sms.exception;

public class InvalidRoomException extends SMSException {
    public InvalidRoomException() {
        super();
    }

    public InvalidRoomException(String message) {
        super(message);
    }

    public InvalidRoomException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidRoomException(Throwable cause) {
        super(cause);
    }
}
