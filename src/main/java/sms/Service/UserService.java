package sms.Service;

import sms.DAO.UserDAO;
import sms.Objects.User;
import sms.DAO.TeacherDAO;
import sms.Objects.Teacher;

import java.util.List;
import java.time.LocalDateTime;

import sms.DAO.ClassStudentDAO;
import sms.Objects.ClassStudent;

public class UserService {
	private final UserDAO userDAO;
	private final TeacherDAO teacherDAO;
	private final ClassStudentDAO classStudentDAO;

	public UserService() {
		this(new UserDAO(), new TeacherDAO(), new ClassStudentDAO());
	}

	public UserService(UserDAO userDAO) {
		this(userDAO, new TeacherDAO(), new ClassStudentDAO());
	}

	public UserService(UserDAO userDAO, TeacherDAO teacherDAO, ClassStudentDAO classStudentDAO) {
		this.userDAO = userDAO;
		this.teacherDAO = teacherDAO;
		this.classStudentDAO = classStudentDAO;
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

		attachDepartment(user);
		attachClassId(user);
		return user;
	}

	public List<User> getAllUsers() {
		try {
			List<User> users = userDAO.getAllUsers();
			for (User user : users) {
				attachDepartment(user);
				attachClassId(user);
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
			attachClassId(user);
			return user;
		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			throw new RuntimeException("Failed to retrieve user", e);
		}
	}

	private void attachClassId(User user) {
		if ("MONITOR".equalsIgnoreCase(user.getRole()) || "GUEST".equalsIgnoreCase(user.getRole())) {
			Integer classId = classStudentDAO.getClassIdByUserId(user.getId());
			user.setClassId(classId);
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
		syncClassAssignment(created.getId(), normalizedRole, classId);
		attachDepartment(created);
		attachClassId(created);
		return created;
	}

	private void syncClassAssignment(int userId, String role, Integer classId) {
		classStudentDAO.deleteByUserId(userId);
		if (("MONITOR".equalsIgnoreCase(role) || "GUEST".equalsIgnoreCase(role)) && classId != null) {
			classStudentDAO.createUser(new ClassStudent(classId, userId));
		}
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
		syncClassAssignment(id, normalizedRole, classId);

		User updated = userDAO.getUserById(id);
		if (updated == null) {
			throw new RuntimeException("Updated user could not be loaded");
		}
		attachDepartment(updated);
		attachClassId(updated);
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
			case "guest", "student" -> "GUEST";
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
				user.setDepartment(teacher.getDepartment());
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
