PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

DROP TABLE IF EXISTS schedule_history;
DROP TABLE IF EXISTS recurring_schedule;
DROP TABLE IF EXISTS schedule_classes;
DROP TABLE IF EXISTS teacher_courses;
DROP TABLE IF EXISTS class_courses;
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

CREATE TABLE class_courses (
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, course_id)
);

CREATE TABLE teacher_courses (
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    hours_taught INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (teacher_id, course_id, class_id)
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
    type TEXT NOT NULL DEFAULT 'DEFAULT' CHECK(type IN ('DEFAULT','LECTURE','TUTORIAL','PRACTICAL','MAKEUP','OVERRIDE')),
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

-- =============================================================
-- INSERTS: CORE USERS, CLASSES, CLASSROOMS, COURSES
-- =============================================================

INSERT INTO users (id, name, email, password_hash, role, last_modified) VALUES
    (1, 'Amina Rahman', 'admin@school.local', '12345', 'ADMIN', '2026-05-15T10:22:00'),
    (2, 'Hok Tin', 'hok.tin@school.local', '12345', 'TEACHER', '2026-05-16T08:40:00'),
    (3, 'Seak Leng', 'seak.leng@school.local', '12345', 'TEACHER', '2026-05-14T14:05:00'),
    (4, 'Phauk Sokkhey', 'phauk.sokkhey@school.local', '12345', 'TEACHER', '2026-05-13T11:10:00'),
    (5, 'Nop Phearum', 'nop.phearum@school.local', '12345', 'TEACHER', '2026-05-12T09:30:00'),
    (6, 'Hen Rathpisey', 'hen.rathpisey@school.local', '12345', 'TEACHER', '2026-05-11T16:50:00'),
    (7, 'Srang Sarot', 'srang.sarot@school.local', '12345', 'TEACHER', '2026-05-10T11:15:00'),
    (8, 'Has Sothea', 'has.sothea@school.local', '12345', 'TEACHER', '2026-05-09T17:45:00'),
    (9, 'Omar Idris', 'omar.idris@school.local', '12345', 'MONITOR', '2026-05-08T13:20:00'),
    (10, 'Sara Khan', 'sara.khan@school.local', '12345', 'STUDENT', '2026-05-07T09:30:00'),
    (11, 'Noah Williams', 'noah.williams@school.local', '12345', 'STUDENT', '2026-05-06T10:30:00'),
    (12, 'Lina Gomez', 'lina.gomez@school.local', '12345', 'STUDENT', '2026-05-05T12:00:00'),
    (13, 'Ethan Brown', 'ethan.brown@school.local', '12345', 'STUDENT', '2026-05-04T14:15:00'),
    (14, 'Priya Patel', 'priya.patel@school.local', '12345', 'STUDENT', '2026-05-03T15:45:00'),
    (15, 'Daniel Nguyen', 'daniel.nguyen@school.local', '12345', 'STUDENT', '2026-05-02T17:10:00'),
    (16, 'Mei Lin', 'mei.lin@school.local', '12345', 'MONITOR', '2026-05-01T09:10:00'),
    (17, 'Alex Jordan', 'alex.jordan@school.local', '12345', 'MONITOR', '2026-05-01T09:15:00'),
    -- Pich Reatrey (AI Teacher)
    (18, 'Pich Reatrey', 'pich.reatrey@school.local', '12345', 'TEACHER', '2026-05-29T09:00:00'),
    -- Monitor SE Y2
    (19, 'Monitor SE Y2', 'monitor.se@school.local', '12345', 'MONITOR', '2026-05-31T09:00:00'),
    -- Monitor AI Y2
    (20, 'Monitor AI Y2', 'monitor.ai@school.local', '12345', 'MONITOR', '2026-06-25T01:00:00'),
    -- Monitor Y1 A (2026)
    (21, 'Monitor Y1 A', 'monitor.y1a@school.local', '12345', 'MONITOR', '2026-06-25T01:00:00'),
    -- Monitor Y1 B (2026)
    (22, 'Monitor Y1 B', 'monitor.y1b@school.local', '12345', 'MONITOR', '2026-06-25T01:00:00'),
    -- Monitor SE Y3 (2026)
    (23, 'Monitor SE Y3', 'monitor.y3se@school.local', '12345', 'MONITOR', '2026-06-25T01:00:00'),
    -- Monitor AI Y3 (2026)
    (24, 'Monitor AI Y3', 'monitor.y3ai@school.local', '12345', 'MONITOR', '2026-06-25T01:00:00');

INSERT INTO teachers (id, user_id, department) VALUES
    (1, 2, 'GIC'),
    (2, 3, 'GIC'),
    (3, 4, 'AMS'),
    (4, 5, 'GIC'),
    (5, 6, 'GIC'),
    (6, 7, 'GIM'),
    (7, 8, 'AMS'),
    (8, 18, 'GIC');

INSERT INTO classes (id, name, year, semester, start_date, end_date, created_by) VALUES
    (1, 'CS-Y2-A', 2, 2, '2026-02-01', '2026-06-30', 1),
    (2, 'CS-Y2-B', 2, 2, '2026-02-01', '2026-06-30', 1),
    (3, 'IT-Y1-A', 1, 2, '2026-02-01', '2026-06-30', 1),
    (4, 'SE-Y3-A', 3, 2, '2026-02-01', '2026-06-30', 1),
    (5, 'DS-Y1-B', 1, 2, '2026-02-01', '2026-06-30', 1),
    (6, 'IP-SE-Y2-S2 (2026)', 2, 2, '2026-03-02', '2026-06-27', 1),
    (7, 'IP-AI-Y2-S2 (2026)', 2, 2, '2026-03-02', '2026-06-27', 1),
    (8, 'IP-A-Y1-S2 (2026)', 1, 2, '2026-03-02', '2026-07-25', 1),
    (9, 'IP-B-Y1-S2 (2026)', 1, 2, '2026-03-02', '2026-07-25', 1),
    (10, 'IP-SE-Y3-S2 (2026)', 3, 2, '2026-03-02', '2026-06-27', 1),
    (11, 'IP-AI-Y3-S2 (2026)', 3, 2, '2026-03-02', '2026-06-27', 1);

INSERT INTO class_students (class_id, user_id) VALUES
    (1, 5), (1, 6), (1, 7), (2, 8), (2, 9), (2, 10), (3, 5), (3, 8), (4, 16),
    (5, 17), (2, 15), (2, 11), (2, 12), (2, 13), (2, 14),
    -- Monitors
    (6, 19),
    (7, 20),
    (8, 21),
    (9, 22),
    (10, 23),
    (11, 24);

INSERT INTO classrooms (id, name, building, capacity) VALUES
    (1, 'A401', 'Building A', 30),
    (2, 'A402', 'Building A', 40),
    (3, 'A417', 'Building A', 25),
    (4, 'A420', 'Building A', 35),
    (5, 'J602', 'Building J', 50),
    (6, 'J603', 'Building J', 45),
    (7, 'J604', 'Building J', 60),
    -- A109 (from SE)
    (8, 'A109', 'Building A', NULL),
    -- J609 (from AI)
    (9, 'J609', 'Building J', NULL);

INSERT INTO courses (id, name, code, total_hours) VALUES
    (1, 'Database Systems', 'CS201', 45),
    (2, 'Web Development', 'CS202', 60),
    (3, 'Operating Systems', 'CS203', 45),
    (4, 'Programming Fundamentals', 'IT101', 60),
    -- IP-SE-Y2-S2 Courses (5-10)
    (5, 'OOP in Java', 'OOP', 45),
    (6, 'Seminar and Project IV', 'SP4', 30),
    (7, 'Data Structure and Algorithm', 'DSA', 45),
    (8, 'Operating System', 'OS', 45),
    (9, 'Introduction to Database', 'IDB', 45),
    (10, 'Linear Algebra and Statistics', 'LAS', 45),
    -- IP-AI-Y2-S2 Courses (11-13)
    (11, 'Cyber Security Concept', 'CSC', 45),
    (12, 'Seminar and Project VI', 'SP6', 30),
    (13, 'Unix and C Programming', 'UCP', 45);

INSERT INTO class_courses (class_id, course_id) VALUES
    (1, 1), (1, 2), (2, 1), (2, 2), (2, 3), (3, 3), (3, 4), (4, 3), (5, 2),
    -- IP-SE-Y2-S2 (6)
    (6, 5), (6, 6), (6, 7), (6, 8), (6, 9), (6, 10),
    -- IP-AI-Y2-S2 (7)
    (7, 11), (7, 12), (7, 7), (7, 10), (7, 9), (7, 13),
    -- IP-A-Y1-S2 (8)
    (8, 4), (8, 10), (8, 9),
    -- IP-B-Y1-S2 (9)
    (9, 4), (9, 10), (9, 9),
    -- IP-SE-Y3-S2 (10)
    (10, 5), (10, 6), (10, 7), (10, 8),
    -- IP-AI-Y3-S2 (11)
    (11, 11), (11, 12), (11, 13), (11, 7);

INSERT INTO teacher_courses (teacher_id, course_id, class_id, hours_taught) VALUES
    (1, 1, 1, 0), (1, 1, 2, 0), (2, 2, 1, 0), (3, 4, 3, 0), (4, 3, 2, 0), (4, 3, 3, 0),
    -- IP-SE-Y2-S2 (6)
    (1, 5, 6, 0), (6, 6, 6, 0), (2, 7, 6, 0), (5, 8, 6, 0), (4, 9, 6, 0), (3, 10, 6, 0),
    -- IP-AI-Y2-S2 (7)
    (6, 12, 7, 0), (8, 11, 7, 0), (3, 10, 7, 0), (2, 7, 7, 0), (2, 13, 7, 0), (4, 9, 7, 0),
    -- Y1 Teachers
    (1, 4, 8, 0), (3, 10, 8, 0), (4, 9, 8, 0),
    (2, 4, 9, 0), (7, 10, 9, 0), (4, 9, 9, 0),
    -- Y3 Teachers
    (1, 5, 10, 0), (6, 6, 10, 0), (2, 7, 10, 0), (5, 8, 10, 0),
    (8, 11, 11, 0), (6, 12, 11, 0), (2, 13, 11, 0), (2, 7, 11, 0);

-- =============================================================
-- SCHEDULES: INITIAL STATIC SCHEDULES
-- =============================================================

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
    (1, 1), (1, 2), (2, 1), (3, 3), (4, 1), (5, 2), (5, 3);

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

-- =============================================================
-- RECURRING TEMPLATES SEED DATA (ALL CLASSES)
-- =============================================================

DROP TABLE IF EXISTS temp._seed_recurring;
CREATE TEMP TABLE _seed_recurring (
    teacher_id INTEGER,
    classroom_id INTEGER,
    course_id INTEGER,
    day_of_week INTEGER,
    start_time TIME,
    end_time TIME,
    effective_from TEXT,
    effective_until TEXT,
    class_id INTEGER
);

INSERT INTO _seed_recurring
    (teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until, class_id)
VALUES
    -- =========================================================
    -- IP-SE-Y2-S2 (Class ID 6) Templates
    -- =========================================================
    (1, 5, 5,  1, '13:00', '15:00', '2026-03-02', '2026-06-27', 6), -- OOP Lecture
    (6, 2, 6,  1, '15:00', '17:00', '2026-03-02', '2026-06-27', 6), -- SP4 Practical
    (2, 8, 7,  2, '09:00', '11:00', '2026-03-03', '2026-06-27', 6), -- DSA Lecture (Shared)
    (5, 6, 8,  2, '13:00', '15:00', '2026-03-03', '2026-06-27', 6), -- OS Lecture
    (4, 1, 9,  3, '07:00', '09:00', '2026-03-04', '2026-06-27', 6), -- IDB Lecture (Shared)
    (3, 3, 10, 3, '09:00', '10:00', '2026-03-04', '2026-06-27', 6), -- LAS Practical
    (3, 1, 10, 4, '07:00', '09:00', '2026-03-05', '2026-06-27', 6), -- LAS Lecture (Shared)
    (4, 4, 9,  4, '13:00', '15:00', '2026-03-05', '2026-06-27', 6), -- IDB Practical
    (5, 2, 8,  4, '15:00', '17:00', '2026-03-05', '2026-06-27', 6), -- OS Practical
    (2, 3, 7,  5, '09:00', '11:00', '2026-03-06', '2026-06-27', 6), -- DSA Practical
    (3, 2, 10, 5, '13:00', '15:00', '2026-03-06', '2026-06-27', 6), -- LAS Tutorial
    (1, 4, 5,  5, '15:00', '17:00', '2026-03-06', '2026-06-27', 6), -- OOP Practical

    -- =========================================================
    -- IP-AI-Y2-S2 (Class ID 7) Templates
    -- =========================================================
    (6, NULL, 12, 1, '07:00', '09:00', '2026-03-02', '2026-06-27', 7), -- SP6 Project
    (8, 1,    11, 1, '09:00', '11:00', '2026-03-02', '2026-06-27', 7), -- CSC Lecture
    (3, 1,    10, 1, '13:00', '15:00', '2026-03-02', '2026-06-27', 7), -- LAS Tutorial
    (8, 5,    11, 1, '15:00', '17:00', '2026-03-02', '2026-06-27', 7), -- CSC Practical
    (6, NULL, 12, 2, '07:00', '09:00', '2026-03-03', '2026-06-27', 7), -- SP6 Project
    (2, 8,    7,  2, '09:00', '11:00', '2026-03-03', '2026-06-27', 7), -- DSA Lecture (Shared)
    (6, 3,    12, 2, '13:00', '15:00', '2026-03-03', '2026-06-27', 7), -- SP6 Project
    (2, 8,    13, 2, '15:00', '17:00', '2026-03-03', '2026-06-27', 7), -- UCP Lecture
    (4, 1,    9,  3, '07:00', '09:00', '2026-03-04', '2026-06-27', 7), -- IDB Lecture (Shared)
    (4, 5,    9,  3, '15:00', '17:00', '2026-03-04', '2026-06-27', 7), -- IDB Practical
    (3, 1,    10, 4, '07:00', '09:00', '2026-03-05', '2026-06-27', 7), -- LAS Lecture (Shared)
    (3, 3,    10, 4, '09:00', '11:00', '2026-03-05', '2026-06-27', 7), -- LAS Practical
    (4, 5,    9,  4, '15:00', '17:00', '2026-03-05', '2026-06-27', 7), -- IDB Practical
    (3, 1,    10, 5, '09:00', '11:00', '2026-03-06', '2026-06-27', 7), -- LAS Lecture
    (2, 3,    7,  5, '13:00', '15:00', '2026-03-06', '2026-06-27', 7), -- DSA Practical
    (2, 3,    13, 5, '15:00', '17:00', '2026-03-06', '2026-06-27', 7), -- UCP Practical

    -- =========================================================
    -- IP-A-Y1-S2 (Class ID 8) Templates (2026)
    -- =========================================================
    (1, 1, 4,  1, '09:00', '11:00', '2026-03-02', '2026-07-25', 8), -- Prog Fund Lecture
    (3, 1, 10, 2, '13:00', '15:00', '2026-03-03', '2026-07-25', 8), -- LAS Lecture
    (4, 1, 9,  3, '09:00', '11:00', '2026-03-04', '2026-07-25', 8), -- IDB Lecture
    (1, 5, 4,  4, '13:00', '15:00', '2026-03-05', '2026-07-25', 8), -- Prog Fund Practical
    (3, 3, 10, 5, '09:00', '11:00', '2026-03-06', '2026-07-25', 8), -- LAS Practical

    -- =========================================================
    -- IP-B-Y1-S2 (Class ID 9) Templates (2026)
    -- =========================================================
    (7, 2, 10, 1, '13:00', '15:00', '2026-03-02', '2026-07-25', 9), -- LAS Lecture
    (2, 2, 4,  2, '09:00', '11:00', '2026-03-03', '2026-07-25', 9), -- Prog Fund Lecture
    (4, 2, 9,  3, '13:00', '15:00', '2026-03-04', '2026-07-25', 9), -- IDB Lecture
    (2, 6, 4,  4, '09:00', '11:00', '2026-03-05', '2026-07-25', 9), -- Prog Fund Practical
    (7, 4, 10, 5, '13:00', '15:00', '2026-03-06', '2026-07-25', 9), -- LAS Practical

    -- =========================================================
    -- IP-SE-Y3-S2 (Class ID 10) Templates (2026)
    -- =========================================================
    (1, 3, 5, 1, '09:00', '11:00', '2026-03-02', '2026-06-27', 10), -- OOP in Java Lecture
    (2, 3, 7, 2, '13:00', '15:00', '2026-03-03', '2026-06-27', 10), -- DSA Lecture
    (5, 3, 8, 3, '09:00', '11:00', '2026-03-04', '2026-06-27', 10), -- OS Lecture
    (6, 7, 6, 4, '13:00', '15:00', '2026-03-05', '2026-06-27', 10), -- SP4 Practical
    (1, 5, 5, 5, '09:00', '11:00', '2026-03-06', '2026-06-27', 10), -- OOP in Java Practical

    -- =========================================================
    -- IP-AI-Y3-S2 (Class ID 11) Templates (2026)
    -- =========================================================
    (8, 4, 11, 1, '13:00', '15:00', '2026-03-02', '2026-06-27', 11), -- CSC Lecture
    (2, 4, 13, 2, '09:00', '11:00', '2026-03-03', '2026-06-27', 11), -- UCP Lecture
    (2, 4, 7,  3, '13:00', '15:00', '2026-03-04', '2026-06-27', 11), -- DSA Practical
    (6, 9, 12, 4, '09:00', '11:00', '2026-03-05', '2026-06-27', 11), -- SP6 Practical
    (2, 6, 13, 5, '13:00', '15:00', '2026-03-06', '2026-06-27', 11); -- UCP Practical

-- Insert unique templates into the real recurring_schedule table
INSERT INTO recurring_schedule
    (teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until)
SELECT DISTINCT
    teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until
FROM _seed_recurring;

-- =============================================================
-- UNIFIED RECURSIVE SCHEDULE OCCURRENCE GENERATOR
-- =============================================================

WITH RECURSIVE schedule_gen AS (
    SELECT
        rs.classroom_id,
        rs.teacher_id,
        rs.course_id,
        rs.day_of_week,
        rs.effective_from as gen_date,
        rs.start_time,
        rs.end_time,
        rs.effective_until,
        CASE 
            WHEN rs.course_id = 12 THEN 'DEFAULT'
            WHEN rs.course_id = 11 AND rs.start_time = '09:00' THEN 'LECTURE'
            WHEN rs.course_id = 11 AND rs.start_time = '15:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 7 AND rs.start_time = '09:00' THEN 'LECTURE'
            WHEN rs.course_id = 7 AND rs.start_time = '13:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 10 AND rs.start_time = '07:00' THEN 'LECTURE'
            WHEN rs.course_id = 10 AND rs.start_time = '09:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 10 AND rs.start_time = '13:00' THEN 'TUTORIAL'
            WHEN rs.course_id = 9 AND rs.start_time = '07:00' THEN 'LECTURE'
            WHEN rs.course_id = 9 AND rs.start_time = '15:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 13 AND rs.start_time = '15:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 5 AND rs.start_time = '13:00' THEN 'LECTURE'
            WHEN rs.course_id = 6 AND rs.start_time = '15:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 8 AND rs.start_time = '13:00' THEN 'LECTURE'
            WHEN rs.course_id = 8 AND rs.start_time = '15:00' THEN 'PRACTICAL'
            ELSE 'LECTURE'
        END as inferred_type
    FROM (
        SELECT DISTINCT teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until 
        FROM _seed_recurring
    ) rs

    UNION ALL

    SELECT
        classroom_id,
        teacher_id,
        course_id,
        day_of_week,
        date(gen_date, '+7 days') as gen_date,
        start_time,
        end_time,
        effective_until,
        inferred_type
    FROM schedule_gen
    WHERE date(gen_date, '+7 days') <= effective_until
)
INSERT INTO schedule (
    classroom_id, teacher_id, course_id, date, start_time, end_time,
    status, visibility, type, priority, created_by, created_at
)
SELECT
    classroom_id,
    teacher_id,
    course_id,
    gen_date as date,
    start_time,
    end_time,
    'BOOKED' as status,
    'VISIBLE' as visibility,
    inferred_type as type,
    1 as priority,
    1 as created_by,
    '2026-02-25 00:00:00' as created_at
FROM schedule_gen;

-- =============================================================
-- UNIFIED JOIN MAPPING (schedule_classes)
-- Maps each generated unique schedule event to ALL classes attending it.
-- This supports shared lectures cleanly in the join table.
-- =============================================================

INSERT INTO schedule_classes (schedule_id, class_id)
SELECT DISTINCT s.id, r.class_id
FROM schedule s
JOIN _seed_recurring r ON 
    ((s.classroom_id = r.classroom_id) OR (s.classroom_id IS NULL AND r.classroom_id IS NULL)) AND
    s.teacher_id = r.teacher_id AND
    s.course_id = r.course_id AND
    s.start_time = r.start_time AND
    s.end_time = r.end_time AND
    strftime('%w', s.date) = CAST(r.day_of_week AS TEXT)
WHERE s.created_at = '2026-02-25 00:00:00'
  AND s.date BETWEEN r.effective_from AND r.effective_until;

-- =============================================================
-- AUDIT HISTORY LOG FOR THE GENERATED SCHEDULE
-- =============================================================

INSERT INTO schedule_history (schedule_id, action, changed_by, timestamp, note)
SELECT s.id, 'CREATE', 1, '2026-02-25 00:00:00', 'Initial schedule created'
FROM schedule s
WHERE s.created_at = '2026-02-25 00:00:00';

DROP TABLE IF EXISTS temp._seed_recurring;

COMMIT;
