package sms.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class PasswordUtils {
    public static String hashPassword(String passwordHash) throws NoSuchAlgorithmException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] password = passwordHash.getBytes();
            digest.update(password);

            byte[] hashedBytes = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte hashedByte : hashedBytes) {
                hexString.append(String.format("%02x", hashedByte));
            }

            return hexString.toString();
        } catch(NoSuchAlgorithmException e){
            throw new RuntimeException("Error", e);
        }
    }

}
