package sms.exception;

public class ClassNotFoundException extends SMSException {
    public ClassNotFoundException() {
        super();
    }

    public ClassNotFoundException(String message) {
        super(message);
    }

    public ClassNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public ClassNotFoundException(Throwable cause) {
        super(cause);
    }
}
