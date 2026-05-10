package sms.exception;

public class InvalidTeacherException extends SMSException {
    public InvalidTeacherException() {
        super();
    }

    public InvalidTeacherException(String message) {
        super(message);
    }

    public InvalidTeacherException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidTeacherException(Throwable cause) {
        super(cause);
    }
}
