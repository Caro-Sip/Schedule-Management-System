package sms.exception;

public class InvalidClassException extends SMSException {
    public InvalidClassException() {
        super();
    }

    public InvalidClassException(String message) {
        super(message);
    }

    public InvalidClassException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidClassException(Throwable cause) {
        super(cause);
    }
}
