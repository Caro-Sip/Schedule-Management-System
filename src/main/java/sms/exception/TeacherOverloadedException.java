package sms.exception;

public class TeacherOverloadedException extends SMSException {
    public TeacherOverloadedException() {
        super();
    }

    public TeacherOverloadedException(String message) {
        super(message);
    }

    public TeacherOverloadedException(String message, Throwable cause) {
        super(message, cause);
    }

    public TeacherOverloadedException(Throwable cause) {
        super(cause);
    }
}
