package sms.Service;

import sms.Objects.User;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.time.Instant;
import java.util.Date;

public class JwtUtils {

    private static final String SECRET =
            System.getenv().getOrDefault(
                    "SMS_JWT_SECRET",
                    "dev-secret-change-me"
            );

    private static final Algorithm algorithm =
            Algorithm.HMAC256(SECRET);

    private static final JWTVerifier verifier =
            JWT.require(algorithm)
                    .withIssuer("sms-api")
                    .build();


    private static final long EXPIRATION_HOURS = 8;

    public static String generateToken(User user) {

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(EXPIRATION_HOURS * 3600);

        return JWT.create()
                .withIssuer("sms-api")
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expiresAt))
                .withClaim("userId", user.getId())
                .withClaim("role", user.getRole())
                .sign(algorithm);
    }

    public static DecodedJWT verifyToken(String token)
            throws JWTVerificationException {

        if (token == null || token.isBlank()) {
            throw new JWTVerificationException("Token is missing");
        }

        return verifier.verify(token);
    }

    public static Integer getUserIdFromToken(DecodedJWT jwt) {

        try {
            return jwt.getClaim("userId").asInt();
        } catch (Exception e) {
            return null;
        }
    }

    public static String getRoleFromToken(DecodedJWT jwt) {

        try {
            return jwt.getClaim("role").asString();
        } catch (Exception e) {
            return null;
        }
    }
}