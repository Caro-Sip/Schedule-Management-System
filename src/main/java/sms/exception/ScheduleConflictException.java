package sms.exception;

public class ScheduleConflictException extends SMSException {
    public ScheduleConflictException() {
        super();
    }

    public ScheduleConflictException(String message) {
        super(message);
    }

    public ScheduleConflictException(String message, Throwable cause) {
        super(message, cause);
    }

    public ScheduleConflictException(Throwable cause) {
        super(cause);
    }
}
