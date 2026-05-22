package sms.Service;

import sms.DAO.UserDAO;
import sms.Objects.User;

public class UserService {
	private final UserDAO userDAO;

	public UserService() {
		this(new UserDAO());
	}

	public UserService(UserDAO userDAO) {
		this.userDAO = userDAO;
	}

	public User login(String email, String password) {
		if (email == null || email.trim().isEmpty()) {
			throw new IllegalArgumentException("Email cannot be empty");
		}

		if (password == null || password.trim().isEmpty()) {
			throw new IllegalArgumentException("Password cannot be empty");
		}

		User user = userDAO.getUserByEmail(email.trim());
		if (user == null) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		String storedHash = user.getPasswordHash();
		String inputHash;
		try {
			inputHash = PasswordUtils.hashPassword(password);
		} catch (java.security.NoSuchAlgorithmException e) {
			throw new RuntimeException("Password hashing failed", e);
		}
		if (!inputHash.equals(storedHash) && !password.equals(storedHash)) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		return user;
	}

	public User continueAsGuest() {
		User guest = new User();
		guest.setId(0);
		guest.setName("Guest");
		guest.setEmail("guest@local");
		guest.setRole("GUEST");
		return guest;
	}
}
