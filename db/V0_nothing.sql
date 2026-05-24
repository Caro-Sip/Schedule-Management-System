-- UNUSED_SQL_FILE: SKIP
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

DROP TABLE IF EXISTS schedule_history;
DROP TABLE IF EXISTS recurring_schedule;
DROP TABLE IF EXISTS schedule_classes;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS classrooms;
DROP TABLE IF EXISTS class_students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL CHECK(role IN ('ADMIN', 'TEACHER', 'MONITOR', 'STUDENT'))
);

CREATE TABLE classes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	year INTEGER NOT NULL,
	created_by INTEGER REFERENCES users(id)
);

CREATE TABLE class_students (
	class_id INTEGER REFERENCES classes(id),
	user_id INTEGER REFERENCES users(id),
	PRIMARY KEY (class_id, user_id)
);

CREATE TABLE classrooms (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	building TEXT,
	capacity INTEGER
);

CREATE TABLE teachers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER UNIQUE REFERENCES users(id),
	department TEXT
);

CREATE TABLE courses (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	code TEXT UNIQUE NOT NULL,
	total_hours INTEGER NOT NULL
);

CREATE TABLE schedule (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	classroom_id INTEGER REFERENCES classrooms(id),
	teacher_id INTEGER REFERENCES teachers(id),
	course_id INTEGER REFERENCES courses(id),
	date DATE NOT NULL,
	start_time TIME NOT NULL,
	end_time TIME NOT NULL,
	status TEXT NOT NULL DEFAULT 'BOOKED' CHECK(status IN ('BOOKED','CANCELLED','ABSENT','MAKEUP','GREYED')),
	visibility TEXT NOT NULL DEFAULT 'VISIBLE' CHECK(visibility IN ('VISIBLE','INVISIBLE')),
	type TEXT NOT NULL DEFAULT 'DEFAULT' CHECK(type IN ('DEFAULT','MAKEUP','OVERRIDE','LECTURE')),
	priority INTEGER NOT NULL DEFAULT 0,
	created_by INTEGER REFERENCES users(id),
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	greyed_at DATETIME,
	linked_schedule_id INTEGER REFERENCES schedule(id)
);

CREATE TABLE schedule_classes (
	schedule_id INTEGER REFERENCES schedule(id),
	class_id INTEGER REFERENCES classes(id),
	PRIMARY KEY (schedule_id, class_id)
);

CREATE TABLE recurring_schedule (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	teacher_id INTEGER REFERENCES teachers(id),
	classroom_id INTEGER REFERENCES classrooms(id),
	course_id INTEGER REFERENCES courses(id),
	day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
	start_time TIME NOT NULL,
	end_time TIME NOT NULL,
	effective_from DATE NOT NULL,
	effective_until DATE
);

CREATE TABLE schedule_history (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	schedule_id INTEGER REFERENCES schedule(id),
	action TEXT NOT NULL CHECK(action IN ('CREATE','UPDATE','DELETE','FLAG','RESTORE')),
	changed_by INTEGER REFERENCES users(id),
	timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
	note TEXT
);

INSERT INTO users (id, name, email, password_hash, role) VALUES
	(1, 'Amina Rahman', 'admin@school.local', 'hash_admin_001', 'ADMIN'),
	(2, 'Dr. Leon Parker', 'leon.parker@school.local', 'hash_teacher_001', 'TEACHER'),
	(3, 'Maya Chen', 'maya.chen@school.local', 'hash_teacher_002', 'TEACHER'),
	(4, 'Omar Idris', 'omar.idris@school.local', 'hash_monitor_001', 'MONITOR'),
	(5, 'Sara Khan', 'sara.khan@school.local', 'hash_student_001', 'STUDENT'),
	(6, 'Noah Williams', 'noah.williams@school.local', 'hash_student_002', 'STUDENT'),
	(7, 'Lina Gomez', 'lina.gomez@school.local', 'hash_student_003', 'STUDENT'),
	(8, 'Ethan Brown', 'ethan.brown@school.local', 'hash_student_004', 'STUDENT'),
	(9, 'Priya Patel', 'priya.patel@school.local', 'hash_student_005', 'STUDENT'),
	(10, 'Daniel Nguyen', 'daniel.nguyen@school.local', 'hash_student_006', 'STUDENT');

INSERT INTO classes (id, name, year, created_by) VALUES
	(1, 'CS-Y2-A', 2, 1),
	(2, 'CS-Y2-B', 2, 1),
	(3, 'IT-Y1-A', 1, 1);

INSERT INTO class_students (class_id, user_id) VALUES
	(1, 5),
	(1, 6),
	(1, 7),
	(2, 8),
	(2, 9),
	(2, 10),
	(3, 5),
	(3, 8);

INSERT INTO classrooms (id, name, building, capacity) VALUES
	(1, 'Room 101', 'Main Block', 40),
	(2, 'Room 202', 'Main Block', 32),
	(3, 'Lab A', 'Science Wing', 24),
	(4, 'Auditorium', 'Central Hall', 120);

INSERT INTO teachers (id, user_id, department) VALUES
	(1, 2, 'Computer Science'),
	(2, 3, 'Information Technology');

INSERT INTO courses (id, name, code, total_hours) VALUES
	(1, 'Database Systems', 'CS201', 45),
	(2, 'Web Development', 'CS202', 60),
	(3, 'Operating Systems', 'CS203', 45),
	(4, 'Programming Fundamentals', 'IT101', 60);

INSERT INTO schedule (
	id, classroom_id, teacher_id, course_id, date, start_time, end_time,
	status, visibility, type, priority, created_by, created_at, greyed_at, linked_schedule_id
) VALUES
	(1, 1, 1, 1, '2026-05-04', '09:00', '10:30', 'BOOKED', 'VISIBLE', 'LECTURE', 1, 1, '2026-05-01 08:00:00', NULL, NULL),
	(2, 3, 1, 2, '2026-05-04', '11:00', '12:30', 'BOOKED', 'VISIBLE', 'DEFAULT', 1, 1, '2026-05-01 08:05:00', NULL, NULL),
	(3, 2, 2, 4, '2026-05-05', '13:00', '14:30', 'BOOKED', 'VISIBLE', 'LECTURE', 1, 1, '2026-05-01 08:10:00', NULL, NULL),
	(4, 1, 1, 1, '2026-05-06', '09:00', '10:30', 'MAKEUP', 'VISIBLE', 'MAKEUP', 2, 1, '2026-05-01 08:20:00', NULL, 1),
	(5, 4, 2, 3, '2026-05-07', '08:30', '10:00', 'GREYED', 'INVISIBLE', 'OVERRIDE', 3, 1, '2026-05-01 08:30:00', '2026-05-01 08:30:00', NULL);

INSERT INTO schedule_classes (schedule_id, class_id) VALUES
	(1, 1),
	(1, 2),
	(2, 1),
	(3, 3),
	(4, 1),
	(5, 2),
	(5, 3);

INSERT INTO recurring_schedule (
	id, teacher_id, classroom_id, course_id, day_of_week,
	start_time, end_time, effective_from, effective_until
) VALUES
	(1, 1, 1, 1, 1, '09:00', '10:30', '2026-05-04', '2026-08-31'),
	(2, 1, 3, 2, 1, '11:00', '12:30', '2026-05-04', '2026-08-31'),
	(3, 2, 2, 4, 2, '13:00', '14:30', '2026-05-05', '2026-08-31');

INSERT INTO schedule_history (
	id, schedule_id, action, changed_by, timestamp, note
) VALUES
	(1, 1, 'CREATE', 1, '2026-05-01 08:00:00', 'Initial schedule created for CS-Y2-A and CS-Y2-B'),
	(2, 2, 'CREATE', 1, '2026-05-01 08:05:00', 'Added Web Development lecture in the lab'),
	(3, 4, 'CREATE', 1, '2026-05-01 08:20:00', 'Makeup class linked to schedule 1'),
	(4, 5, 'FLAG', 1, '2026-05-01 08:30:00', 'Room marked invisible for maintenance');

COMMIT;