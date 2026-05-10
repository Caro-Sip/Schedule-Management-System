package sms.exception;

public class SMSException extends Exception {
    public SMSException() {
        super();
    }

    public SMSException(String message) {
        super(message);
    }

    public SMSException(String message, Throwable cause) {
        super(message, cause);
    }

    public SMSException(Throwable cause) {
        super(cause);
    }
}
