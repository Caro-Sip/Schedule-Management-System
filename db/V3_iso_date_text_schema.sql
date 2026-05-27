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
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'TEACHER', 'MONITOR', 'STUDENT')),
    last_modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL CHECK(semester IN (1, 2)),
    start_date TEXT NOT NULL CHECK(date(start_date) IS NOT NULL),
    end_date TEXT NOT NULL CHECK(date(end_date) IS NOT NULL),
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
    building TEXT
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
    date TEXT NOT NULL CHECK(date(date) IS NOT NULL),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'BOOKED' CHECK(status IN ('BOOKED','CANCELLED','ABSENT','MAKEUP','GREYED')),
    visibility TEXT NOT NULL DEFAULT 'VISIBLE' CHECK(visibility IN ('VISIBLE','INVISIBLE')),
    type TEXT NOT NULL DEFAULT 'DEFAULT' CHECK(type IN ('DEFAULT','MAKEUP','OVERRIDE','LECTURE')),
    priority INTEGER NOT NULL DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    greyed_at TEXT,
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
    effective_from TEXT NOT NULL CHECK(date(effective_from) IS NOT NULL),
    effective_until TEXT CHECK(effective_until IS NULL OR date(effective_until) IS NOT NULL)
);

CREATE TABLE schedule_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER REFERENCES schedule(id),
    action TEXT NOT NULL CHECK(action IN ('CREATE','UPDATE','DELETE','FLAG','RESTORE')),
    changed_by INTEGER REFERENCES users(id),
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

INSERT INTO users (id, name, email, password_hash, role, last_modified) VALUES
    (1, 'Amina Rahman', 'admin@school.local', 'hash_admin_001', 'ADMIN', '2026-05-15T10:22:00'),
    (2, 'Hok Tin', 'hok.tin@school.local', 'hash_teacher_001', 'TEACHER', '2026-05-16T08:40:00'),
    (3, 'Seak Leng', 'seak.leng@school.local', 'hash_teacher_002', 'TEACHER', '2026-05-14T14:05:00'),
    (4, 'Phauk Sokkhey', 'phauk.sokkhey@school.local', 'hash_teacher_003', 'TEACHER', '2026-05-13T11:10:00'),
    (5, 'Nop Phearum', 'nop.phearum@school.local', 'hash_teacher_004', 'TEACHER', '2026-05-12T09:30:00'),
    (6, 'Hen Rathpisey', 'hen.rathpisey@school.local', 'hash_teacher_005', 'TEACHER', '2026-05-11T16:50:00'),
    (7, 'Srang Sarot', 'srang.sarot@school.local', 'hash_teacher_006', 'TEACHER', '2026-05-10T11:15:00'),
    (8, 'Has Sothea', 'has.sothea@school.local', 'hash_teacher_007', 'TEACHER', '2026-05-09T17:45:00'),
    (9, 'Omar Idris', 'omar.idris@school.local', 'hash_monitor_001', 'MONITOR', '2026-05-08T13:20:00'),
    (10, 'Sara Khan', 'sara.khan@school.local', 'hash_student_001', 'STUDENT', '2026-05-07T09:30:00'),
    (11, 'Noah Williams', 'noah.williams@school.local', 'hash_student_002', 'STUDENT', '2026-05-06T10:30:00'),
    (12, 'Lina Gomez', 'lina.gomez@school.local', 'hash_student_003', 'STUDENT', '2026-05-05T12:00:00'),
    (13, 'Ethan Brown', 'ethan.brown@school.local', 'hash_student_004', 'STUDENT', '2026-05-04T14:15:00'),
    (14, 'Priya Patel', 'priya.patel@school.local', 'hash_student_005', 'STUDENT', '2026-05-03T15:45:00'),
    (15, 'Daniel Nguyen', 'daniel.nguyen@school.local', 'hash_student_006', 'STUDENT', '2026-05-02T17:10:00'),
    (16, 'Mei Lin', 'mei.lin@school.local', 'hash_monitor_002', 'MONITOR', '2026-05-01T09:10:00'),
    (17, 'Alex Jordan', 'alex.jordan@school.local', 'hash_monitor_003', 'MONITOR', '2026-05-01T09:15:00');

INSERT INTO teachers (id, user_id, department) VALUES
    (1, 2, 'GIC'),
    (2, 3, 'GIC'),
    (3, 4, 'AMS'),
    (4, 5, 'GIC'),
    (5, 6, 'GIC'),
    (6, 7, 'GIM'),
    (7, 8, 'AMS');

INSERT INTO classes (id, name, year, semester, start_date, end_date, created_by) VALUES
    (1, 'CS-Y2-A', 2, 2, '2026-02-01', '2026-06-30', 1),
    (2, 'CS-Y2-B', 2, 2, '2026-02-01', '2026-06-30', 1),
    (3, 'IT-Y1-A', 1, 2, '2026-02-01', '2026-06-30', 1),
    (4, 'SE-Y3-A', 3, 2, '2026-02-01', '2026-06-30', 1),
    (5, 'DS-Y1-B', 1, 2, '2026-02-01', '2026-06-30', 1);

INSERT INTO class_students (class_id, user_id) VALUES
    (1, 5),
    (1, 6),
    (1, 7),
    (2, 8),
    (2, 9),
    (2, 10),
    (3, 5),
    (3, 8),
    (4, 16),
    (5, 17);

INSERT INTO classrooms (name, building) VALUES
    ('A401', 'Building A'),
    ('A402', 'Building A'),
    ('A417', 'Building A'),
    ('A420', 'Building A'),
    ('J602', 'Building J'),
    ('J603', 'Building J'),
    ('J604', 'Building J');

INSERT INTO courses (id, name, code, total_hours) VALUES
    (1, 'Database Systems', 'CS201', 45),
    (2, 'Web Development', 'CS202', 60),
    (3, 'Operating Systems', 'CS203', 45),
    (4, 'Programming Fundamentals', 'IT101', 60);

INSERT INTO schedule (
    id, classroom_id, teacher_id, course_id, date, start_time, end_time,
    status, visibility, type, priority, created_by, created_at, greyed_at, linked_schedule_id
) VALUES
    (1, 1, 1, 1, '2026-05-04', '09:00', '11:00', 'BOOKED', 'VISIBLE', 'LECTURE', 1, 1, '2026-05-01 08:00:00', NULL, NULL),
    (2, 2, 2, 2, '2026-05-04', '11:00', '13:00', 'BOOKED', 'VISIBLE', 'DEFAULT', 1, 1, '2026-05-01 08:05:00', NULL, NULL),
    (3, 3, 3, 4, '2026-05-05', '13:00', '15:00', 'BOOKED', 'VISIBLE', 'LECTURE', 1, 1, '2026-05-01 08:10:00', NULL, NULL),
    (4, 1, 1, 1, '2026-05-06', '09:00', '11:00', 'MAKEUP', 'VISIBLE', 'MAKEUP', 2, 1, '2026-05-01 08:20:00', NULL, 1),
    (5, 4, 4, 3, '2026-05-07', '08:00', '10:00', 'GREYED', 'INVISIBLE', 'OVERRIDE', 3, 1, '2026-05-01 08:30:00', '2026-05-01 08:30:00', NULL);

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
    (1, 1, 1, 1, 1, '09:00', '11:00', '2026-05-04', '2026-08-31'),
    (2, 2, 2, 2, 1, '11:00', '13:00', '2026-05-04', '2026-08-31'),
    (3, 3, 3, 4, 2, '13:00', '15:00', '2026-05-05', '2026-08-31');

INSERT INTO schedule_history (
    id, schedule_id, action, changed_by, timestamp, note
) VALUES
    (1, 1, 'CREATE', 1, '2026-05-01 08:00:00', 'Initial schedule created for CS-Y2-A and CS-Y2-B'),
    (2, 2, 'CREATE', 1, '2026-05-01 08:05:00', 'Added Web Development lecture in the lab'),
    (3, 4, 'CREATE', 1, '2026-05-01 08:20:00', 'Makeup class linked to schedule 1'),
    (4, 5, 'FLAG', 1, '2026-05-01 08:30:00', 'Room marked invisible for maintenance');

COMMIT;