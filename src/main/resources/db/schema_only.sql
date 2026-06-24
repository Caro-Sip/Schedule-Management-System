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

-- Insert a single default admin account for setting up the clean project
INSERT INTO users (id, name, email, password_hash, role, last_modified) VALUES
    (1, 'System Admin', 'admin@school.local', 'admin123', 'ADMIN', '2026-06-25T01:00:00');

COMMIT;
