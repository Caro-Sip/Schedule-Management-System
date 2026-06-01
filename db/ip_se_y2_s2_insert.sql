-- =============================================================
-- INSERT: IP-SE-Y2-S2 class, courses, classroom, and schedule
-- Assumes existing seed data from V4_class_courses.sql
-- Uses WITH RECURSIVE to generate all weekly schedule occurrences
-- =============================================================

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- -------------------------------------------------------------
-- 1. NEW CLASSROOM: A109 (Building A) — not in existing data
-- -------------------------------------------------------------

INSERT INTO classrooms (name, building) VALUES
    ('A109', 'Building A');
-- A109 will get id = 8

-- -------------------------------------------------------------
-- 2. NEW COURSES
-- Existing: id 1–4. New courses get ids 5–10.
-- -------------------------------------------------------------

INSERT INTO courses (id, name, code, total_hours) VALUES
    (5,  'OOP in Java',                    'OOP',  45),
    (6,  'Seminar and Project IV',          'SP4',  30),
    (7,  'Data Structure and Algorithm',    'DSA',  45),
    (8,  'Operating System',               'OS',   45),
    (9,  'Introduction to Database',        'IDB',  45),
    (10, 'Linear Algebra and Statistics',   'LAS',  45);

-- -------------------------------------------------------------
-- 3. NEW CLASS: IP-SE-Y2-S2
-- year=2, semester=2, created_by=1 (admin Amina Rahman)
-- -------------------------------------------------------------

INSERT INTO classes (id, name, year, semester, start_date, end_date, created_by) VALUES
    (6, 'IP-SE-Y2-S2', 2, 2, '2026-03-02', '2026-06-27', 1);

-- -------------------------------------------------------------
-- 4a. NEW CLASS MONITOR USER FOR IP-SE-Y2-S2
-- user id=19 (kept separate from the IP-AI seed's monitor user)
-- -------------------------------------------------------------

INSERT INTO users (id, name, email, password_hash, role, last_modified) VALUES
    (19, 'Monitor SE', 'monitor.se@school.local', '12345', 'MONITOR', '2026-05-31T09:00:00');

INSERT INTO class_students (class_id, user_id) VALUES
    (6, 19);

-- -------------------------------------------------------------
-- 4. CLASS–COURSES MAPPING
-- -------------------------------------------------------------

INSERT INTO class_courses (class_id, course_id) VALUES
    (6, 5),  -- OOP
    (6, 6),  -- SP4
    (6, 7),  -- DSA
    (6, 8),  -- OS
    (6, 9),  -- IDB
    (6, 10); -- LAS

-- -------------------------------------------------------------
-- 5. RECURRING SCHEDULE (templates)
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
-- effective_from = first occurrence date in the semester
-- Teacher IDs: Hok Tin=1, Seak Leng=2, Phauk Sokkhey=3,
--              Nop Phearum=4, Hen Rathpisey=5, Srang Sarot=6
-- Classroom IDs: A401=1, A402=2, A417=3, A420=4,
--                J602=5, J603=6, J604=7, A109=8
-- Type: LECTURE, PRACTICAL, TUTORIAL
-- -------------------------------------------------------------

DROP TABLE IF EXISTS temp._seed_recurring;
CREATE TEMP TABLE _seed_recurring (
    teacher_id INTEGER,
    classroom_id INTEGER,
    course_id INTEGER,
    day_of_week INTEGER,
    start_time TIME,
    end_time TIME,
    effective_from TEXT,
    effective_until TEXT
);

INSERT INTO _seed_recurring
    (teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until)
VALUES
    -- MONDAY (day_of_week = 1), first Monday = 2026-03-02
    (1, 5, 5,  1, '13:00', '15:00', '2026-03-02', '2026-06-27'),  -- OOP Lecture,    Hok Tin,       J602
    (6, 2, 6,  1, '15:00', '17:00', '2026-03-02', '2026-06-27'),  -- SP4 Practical,  Srang Sarot,   A402

    -- TUESDAY (day_of_week = 2), first Tuesday = 2026-03-03
    (2, 8, 7,  2, '09:00', '11:00', '2026-03-03', '2026-06-27'),  -- DSA Lecture,    Seak Leng,     A109
    (5, 6, 8,  2, '13:00', '15:00', '2026-03-03', '2026-06-27'),  -- OS Lecture,     Hen Rathpisey, J603

    -- WEDNESDAY (day_of_week = 3), first Wednesday = 2026-03-04
    (4, 1, 9,  3, '07:00', '09:00', '2026-03-04', '2026-06-27'),  -- IDB Lecture,    Nop Phearum,   A401
    (3, 3, 10, 3, '09:00', '10:00', '2026-03-04', '2026-06-27'),  -- LAS Practical,  Phauk Sokkhey, A417

    -- THURSDAY (day_of_week = 4), first Thursday = 2026-03-05
    (3, 1, 10, 4, '07:00', '09:00', '2026-03-05', '2026-06-27'),  -- LAS Lecture,    Phauk Sokkhey, A401
    (4, 4, 9,  4, '13:00', '15:00', '2026-03-05', '2026-06-27'),  -- IDB Practical,  Nop Phearum,   A420
    (5, 2, 8,  4, '15:00', '17:00', '2026-03-05', '2026-06-27'),  -- OS Practical,   Hen Rathpisey, A402

    -- FRIDAY (day_of_week = 5), first Friday = 2026-03-06
    (2, 3, 7,  5, '09:00', '11:00', '2026-03-06', '2026-06-27'),  -- DSA Practical,  Seak Leng,     A417
    (3, 2, 10, 5, '13:00', '15:00', '2026-03-06', '2026-06-27'),  -- LAS Tutorial,   Phauk Sokkhey, A402
    (1, 4, 5,  5, '15:00', '17:00', '2026-03-06', '2026-06-27');  -- OOP Practical,  Hok Tin,       A420

INSERT INTO recurring_schedule
    (teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until)
SELECT
    teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until
FROM _seed_recurring;

-- -------------------------------------------------------------
-- 6. SCHEDULE (auto-generated weekly occurrences)
-- Uses WITH RECURSIVE to expand recurring_schedule into
-- individual schedule rows for each week until effective_until.
-- All BOOKED, VISIBLE, priority=1, created_by=1
-- Type inference: infer from course pattern (hardcoded below)
-- created_at = '2026-02-20 09:00:00' for batch identification
-- -------------------------------------------------------------

WITH RECURSIVE schedule_gen AS (
    -- Base case: start from first occurrence (effective_from)
    SELECT
        NULL as recurring_id,
        rs.classroom_id,
        rs.teacher_id,
        rs.course_id,
        rs.day_of_week,
        rs.effective_from as gen_date,
        rs.start_time,
        rs.end_time,
        rs.effective_until,
        -- Infer type from (course_id, session time pattern):
        -- Lectures typically 09:00-11:00 or 13:00-15:00 (2hr)
        -- Practicals typically 15:00-17:00 or scattered times
        -- Tutorials shorter (10:00 duration)
        CASE 
            WHEN rs.course_id = 5 AND rs.start_time = '13:00' THEN 'LECTURE'
            WHEN rs.course_id = 6 AND rs.start_time = '15:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 7 AND rs.day_of_week = 2 AND rs.start_time = '09:00' THEN 'LECTURE'
            WHEN rs.course_id = 7 AND rs.day_of_week = 5 AND rs.start_time = '09:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 8 AND rs.start_time = '13:00' THEN 'LECTURE'
            WHEN rs.course_id = 8 AND rs.start_time = '15:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 9 AND rs.start_time = '07:00' THEN 'LECTURE'
            WHEN rs.course_id = 9 AND rs.start_time = '13:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 10 AND rs.start_time = '07:00' THEN 'LECTURE'
            WHEN rs.course_id = 10 AND rs.start_time = '09:00' THEN 'PRACTICAL'
            WHEN rs.course_id = 10 AND (rs.start_time = '13:00' OR rs.start_time = '15:00') THEN 'TUTORIAL'
            ELSE 'LECTURE'
        END as inferred_type
    FROM _seed_recurring rs

    UNION ALL

    -- Recursive case: advance by 7 days, stop at effective_until
    SELECT
        recurring_id,
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
    '2026-02-20 09:00:00' as created_at
FROM schedule_gen;

-- -------------------------------------------------------------
-- 7. SCHEDULE–CLASS MAPPING (link all generated sessions to class 6)
-- Query by created_at timestamp to identify the batch
-- -------------------------------------------------------------

INSERT INTO schedule_classes (schedule_id, class_id)
SELECT s.id, 6
FROM schedule s
WHERE s.date BETWEEN '2026-03-02' AND '2026-06-27'
  AND s.created_at = '2026-02-20 09:00:00';

-- -------------------------------------------------------------
-- 8. SCHEDULE HISTORY (audit log for the batch creation)
-- -------------------------------------------------------------

INSERT INTO schedule_history (schedule_id, action, changed_by, timestamp, note)
SELECT s.id, 'CREATE', 1, '2026-02-20 09:00:00',
    'Initial schedule created for IP-SE-Y2-S2'
FROM schedule s
WHERE s.date BETWEEN '2026-03-02' AND '2026-06-27'
  AND s.created_at = '2026-02-20 09:00:00';

COMMIT;
