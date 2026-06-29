package sms.Service;

import sms.DAO.UserDAO;
import sms.Objects.User;
import sms.DAO.TeacherDAO;
import sms.Objects.Teacher;
import sms.DAO.ClassStudentDAO;
import sms.Objects.ClassStudent;

import java.util.List;
import java.time.LocalDateTime;

public class UserService {
	private final UserDAO userDAO;
	private final TeacherDAO teacherDAO;

	public UserService() {
		this(new UserDAO(), new TeacherDAO());
	}

	public UserService(UserDAO userDAO) {
		this(userDAO, new TeacherDAO());
	}

	public UserService(UserDAO userDAO, TeacherDAO teacherDAO) {
		this.userDAO = userDAO;
		this.teacherDAO = teacherDAO;
	}

	public User login(String email, String password) {
		if (email == null || email.trim().isEmpty()) {
			throw new IllegalArgumentException("Email cannot be empty");
		}

		if (password == null || password.trim().isEmpty()) {
			throw new IllegalArgumentException("Password cannot be empty");
		}

		String normalizedEmail = normalizeEmail(email);
		String inputPassword = password.trim();
		User user = userDAO.getUserByEmail(normalizedEmail);
		if (user == null) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		String storedHash = user.getPasswordHash();
		String inputHash;
		try {
			inputHash = PasswordUtils.hashPassword(inputPassword);
		} catch (java.security.NoSuchAlgorithmException e) {
			throw new RuntimeException("Password hashing failed", e);
		}
		if (!inputHash.equals(storedHash) && !inputPassword.equals(storedHash)) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		return user;
	}

	public List<User> getAllUsers() {
		try {
			List<User> users = userDAO.getAllUsers();
			for (User user : users) {
				attachDepartment(user);
			}
			return users;
		} catch (Exception e) {
			throw new RuntimeException("Failed to retrieve users", e);
		}
	}

	public User getUser(int id) {
		if (id <= 0) {
			throw new IllegalArgumentException("User id must be positive");
		}

		try {
			User user = userDAO.getUserById(id);
			if (user == null) {
				throw new IllegalArgumentException("User not found with id " + id);
			}
			attachDepartment(user);
			return user;
		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			throw new RuntimeException("Failed to retrieve user", e);
		}
	}

	public User createUser(String name, String email, String password, String role, String department, Integer classId) {
		String normalizedName = normalizeName(name);
		String normalizedEmail = normalizeEmail(email);
		String normalizedRole = normalizeRole(role);
		String passwordHash = hashPassword(password);
		String normalizedDepartment = normalizeDepartment(department, normalizedRole);

		if (userDAO.getUserByEmail(normalizedEmail) != null) {
			throw new IllegalArgumentException("Email already exists");
		}

		User user = new User(
			normalizedName,
			normalizedEmail,
			passwordHash,
			normalizedRole,
			LocalDateTime.now().toString()
		);

		if (!userDAO.createUser(user)) {
			throw new RuntimeException("User was not created");
		}

		User created = userDAO.getUserByEmail(normalizedEmail);
		if (created == null) {
			throw new RuntimeException("Created user could not be loaded");
		}
		syncTeacherDepartment(created.getId(), normalizedRole, normalizedDepartment);
		syncClassStudent(created.getId(), normalizedRole, classId);
		attachDepartment(created);
		return created;
	}

	public User updateUser(int id, String name, String email, String password, String role, String department, Integer classId) {
		if (id <= 0) {
			throw new IllegalArgumentException("User id must be positive");
		}

		User existing = getUser(id);
		String normalizedName = normalizeName(name);
		String normalizedEmail = normalizeEmail(email);
		String normalizedRole = normalizeRole(role);
		String normalizedDepartment = normalizeDepartment(department, normalizedRole);
		String passwordHash = existing.getPasswordHash();

		if (password != null && !password.trim().isEmpty()) {
			passwordHash = hashPassword(password);
		}

		User emailOwner = userDAO.getUserByEmail(normalizedEmail);
		if (emailOwner != null && emailOwner.getId() != id) {
			throw new IllegalArgumentException("Email already exists");
		}

		User updatedUser = new User(
			id,
			normalizedName,
			normalizedEmail,
			passwordHash,
			normalizedRole,
			LocalDateTime.now().toString()
		);

		if (!userDAO.updateUser(updatedUser)) {
			throw new RuntimeException("User was not updated");
		}

		syncTeacherDepartment(id, normalizedRole, normalizedDepartment);
		syncClassStudent(id, normalizedRole, classId);

		User updated = userDAO.getUserById(id);
		if (updated == null) {
			throw new RuntimeException("Updated user could not be loaded");
		}
		attachDepartment(updated);
		return updated;
	}

	public void deleteUser(int id) {
		if (id <= 0) {
			throw new IllegalArgumentException("User id must be positive");
		}

		User existing = getUser(id);
		deleteTeacherRecordIfPresent(existing.getId());

		if (!userDAO.deleteUser(id)) {
			throw new IllegalArgumentException("User not found with id " + id);
		}
	}

	public User continueAsGuest() {
		User guest = new User();
		guest.setId(0);
		guest.setName("Guest");
		guest.setEmail("guest@local");
		guest.setRole("GUEST");
		return guest;
	}

	private String normalizeName(String name) {
		if (name == null || name.trim().isEmpty()) {
			throw new IllegalArgumentException("Name cannot be empty");
		}
		return name.trim();
	}

	private String normalizeEmail(String email) {
		if (email == null || email.trim().isEmpty()) {
			throw new IllegalArgumentException("Email cannot be empty");
		}
		return email.trim().toLowerCase();
	}

	private String normalizeDepartment(String department, String role) {
		if (!isTeacherRole(role)) {
			return null;
		}

		if (department == null || department.trim().isEmpty()) {
			throw new IllegalArgumentException("Department cannot be empty");
		}
		return department.trim();
	}

	private String normalizeRole(String role) {
		if (role == null || role.trim().isEmpty()) {
			throw new IllegalArgumentException("Role cannot be empty");
		}

		return switch (role.trim().toLowerCase()) {
			case "admin" -> "ADMIN";
			case "professor", "teacher" -> "TEACHER";
			case "class-monitor", "monitor" -> "MONITOR";
			case "guest", "student" -> "STUDENT";
			default -> throw new IllegalArgumentException("Role is invalid");
		};
	}

	private String hashPassword(String password) {
		if (password == null || password.trim().isEmpty()) {
			throw new IllegalArgumentException("Password cannot be empty");
		}

		try {
			return PasswordUtils.hashPassword(password);
		} catch (java.security.NoSuchAlgorithmException e) {
			throw new RuntimeException("Password hashing failed", e);
		}
	}

	private boolean isTeacherRole(String role) {
		return "TEACHER".equals(role);
	}

	private void attachDepartment(User user) {
		if (user == null) {
			return;
		}

		if (!isTeacherRole(user.getRole())) {
			return;
		}

		try {
			Teacher teacher = teacherDAO.getByUserId(user.getId());
			if (teacher != null) {
				teacher.getDepartment();
			}
		} catch (Exception e) {
			throw new RuntimeException("Failed to load teacher department", e);
		}
	}

	private void syncTeacherDepartment(int userId, String role, String department) {
		try {
			Teacher existingTeacher = teacherDAO.getByUserId(userId);
			if (!isTeacherRole(role)) {
				if (existingTeacher != null) {
					teacherDAO.deleteTeacher(existingTeacher.getId());
				}
				return;
			}

			if (existingTeacher == null) {
				teacherDAO.createTeacher(new Teacher(userId, department));
				return;
			}

			existingTeacher.setDepartment(department);
			teacherDAO.updateTeacher(existingTeacher);
		} catch (Exception e) {
			throw new RuntimeException("Failed to sync teacher department", e);
		}
	}

	private void syncClassStudent(int userId, String role, Integer classId) {
		try {
			ClassStudentDAO classStudentDAO = new ClassStudentDAO();
			classStudentDAO.deleteByUserId(userId);
			if (("MONITOR".equals(role) || "STUDENT".equals(role)) && classId != null && classId > 0) {
				classStudentDAO.createUser(new ClassStudent(classId, userId));
			}
		} catch (Exception e) {
			throw new RuntimeException("Failed to sync class student", e);
		}
	}

	private void deleteTeacherRecordIfPresent(int userId) {
		try {
			Teacher teacher = teacherDAO.getByUserId(userId);
			if (teacher != null) {
				teacherDAO.deleteTeacher(teacher.getId());
			}
		} catch (Exception e) {
			throw new RuntimeException("Failed to delete teacher record", e);
		}
	}
}
