package sms.exception;

public class InvalidTimeSlotException extends SMSException {
    public InvalidTimeSlotException() {
        super();
    }

    public InvalidTimeSlotException(String message) {
        super(message);
    }

    public InvalidTimeSlotException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidTimeSlotException(Throwable cause) {
        super(cause);
    }
}
