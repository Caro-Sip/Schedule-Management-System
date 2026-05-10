package sms.exception;

public class TeacherNotFoundException extends SMSException {
    public TeacherNotFoundException() {
        super();
    }

    public TeacherNotFoundException(String message) {
        super(message);
    }

    public TeacherNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeacherNotFoundException(Throwable cause) {
        super(cause);
    }
}
