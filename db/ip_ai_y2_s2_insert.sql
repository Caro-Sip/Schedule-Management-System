-- =============================================================
-- INSERT: IP-AI-Y2-S2 class, courses, classroom, and schedule
-- Assumes V4_class_courses.sql AND ip_se_y2_s2_insert.sql
-- have already been applied (courses 5–10, classrooms up to id=8,
-- classes up to id=6, teachers up to id=7 are all present).
-- Uses WITH RECURSIVE to generate all weekly schedule occurrences
-- =============================================================

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- -------------------------------------------------------------
-- REFERENCE MAP (from prior inserts — DO NOT re-insert these)
-- -------------------------------------------------------------
-- Teachers:  Hok Tin=1, Seak Leng=2, Phauk Sokkhey=3,
--            Nop Phearum=4, Hen Rathpisey=5, Srang Sarot=6, Has Sothea=7
-- Classrooms: A401=1, A402=2, A417=3, A420=4,
--             J602=5, J603=6, J604=7, A109=8
-- Courses:   DB Systems=1, Web Dev=2, OS=3, Prog Fund=4,
--            OOP=5, SP4=6, DSA=7, OS(new)=8, IDB=9, LAS=10

-- -------------------------------------------------------------
-- 1. NEW USER + TEACHER: PICH Reatrey
-- user id=18, teacher id=8
-- -------------------------------------------------------------

INSERT INTO users (id, name, email, password_hash, role, last_modified) VALUES
    (18, 'Pich Reatrey', 'pich.reatrey@school.local', 'hash_teacher_008', 'TEACHER', '2026-05-29T09:00:00');

INSERT INTO teachers (id, user_id, department) VALUES
    (8, 18, 'GIC');

-- -------------------------------------------------------------
-- 2. NEW CLASSROOMS
-- J609 is listed as an alternative for one session (Tue Unix lecture).
-- Note: SP6 Monday/Tuesday rows originally had "Room A-" (truncated).
-- We now use NULL to indicate TBC.
-- -------------------------------------------------------------

INSERT INTO classrooms (name, building) VALUES
    ('J609', 'Building J');
-- J609 gets id = 9

-- -------------------------------------------------------------
-- 3. NEW COURSES
-- LAS=10, DSA=7, IDB=9 already exist from ip_se_y2_s2_insert.sql
-- New: Cyber Security Concept, Seminar and Project VI, Unix and C Programming
-- -------------------------------------------------------------

INSERT INTO courses (id, name, code, total_hours) VALUES
    (11, 'Cyber Security Concept',   'CSC', 45),
    (12, 'Seminar and Project VI',   'SP6', 30),
    (13, 'Unix and C Programming',   'UCP', 45);

-- -------------------------------------------------------------
-- 4. NEW CLASS: IP-AI-Y2-S2
-- year=2, semester=2, id=7, created_by=1 (admin)
-- -------------------------------------------------------------

INSERT INTO classes (id, name, year, semester, start_date, end_date, created_by) VALUES
    (7, 'IP-AI-Y2-S2', 2, 2, '2026-03-02', '2026-06-27', 1);

-- -------------------------------------------------------------
-- 5. CLASS–COURSES MAPPING
-- Courses this class takes: CSC, SP6, DSA, LAS, IDB, UCP
-- -------------------------------------------------------------

INSERT INTO class_courses (class_id, course_id) VALUES
    (7, 11),  -- Cyber Security Concept
    (7, 12),  -- Seminar and Project VI
    (7, 7),   -- Data Structure and Algorithm (shared with SE)
    (7, 10),  -- Linear Algebra and Statistics (shared with SE)
    (7, 9),   -- Introduction to Database (shared with SE)
    (7, 13);  -- Unix and C Programming

-- -------------------------------------------------------------
-- 5b. TEACHER–COURSES MAPPING FOR IP-AI-Y2-S2 (class_id=7)
-- -------------------------------------------------------------

INSERT INTO teacher_courses (teacher_id, course_id, class_id, hours_taught) VALUES
    (6, 12, 7, 0), -- Srang Sarot teaches SP6 to Class 7
    (8, 11, 7, 0), -- Pich Reatrey teaches CSC to Class 7
    (3, 10, 7, 0), -- Phauk Sokkhey teaches LAS to Class 7
    (2, 7,  7, 0), -- Seak Leng teaches DSA to Class 7
    (2, 13, 7, 0), -- Seak Leng teaches UCP to Class 7
    (4, 9,  7, 0); -- Nop Phearum teaches IDB to Class 7

-- -------------------------------------------------------------
-- 6. RECURRING SCHEDULE (templates)
-- day_of_week: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
-- Normalized time blocks:
--   07:00–09:00, 09:00–11:00, 13:00–15:00, 15:00–17:00
-- Note: SP6 Monday 07–09 and Tuesday 07–09 have classroom_id = NULL (TBC)
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
    -- MONDAY (1)
    (6,    NULL, 12,  1, '07:00', '09:00', '2026-03-02', '2026-06-27'),  -- SP6  Project,   Srang Sarot,   Room TBC
    (8,    1,    11,  1, '09:00', '11:00', '2026-03-02', '2026-06-27'),  -- CSC  Lecture,   Pich Reatrey,  A401
    (3,    1,    10,  1, '13:00', '15:00', '2026-03-02', '2026-06-27'),  -- LAS  Tutorial,  Phauk Sokkhey, A401
    (8,    5,    11,  1, '15:00', '17:00', '2026-03-02', '2026-06-27'),  -- CSC  Practical, Pich Reatrey,  J602

    -- TUESDAY (2)
    (6,    NULL, 12,  2, '07:00', '09:00', '2026-03-03', '2026-06-27'),  -- SP6  Project,   Srang Sarot,   Room TBC
    (2,    8,    7,   2, '09:00', '11:00', '2026-03-03', '2026-06-27'),  -- DSA  Lecture,   Seak Leng,     A109
    (6,    3,    12,  2, '13:00', '15:00', '2026-03-03', '2026-06-27'),  -- SP6  Project,   Srang Sarot,   A417
    (2,    8,    13,  2, '15:00', '17:00', '2026-03-03', '2026-06-27'),  -- UCP  Lecture,   Seak Leng,     A109

    -- WEDNESDAY (3)
    (4,    1,    9,   3, '07:00', '09:00', '2026-03-04', '2026-06-27'),  -- IDB  Lecture,   Nop Phearum,   A401
    (4,    5,    9,   3, '15:00', '17:00', '2026-03-04', '2026-06-27'),  -- IDB  Practical, Nop Phearum,   J602

    -- THURSDAY (4)
    (3,    1,    10,  4, '07:00', '09:00', '2026-03-05', '2026-06-27'),  -- LAS  Lecture,   Phauk Sokkhey, A401
    (3,    3,    10,  4, '09:00', '11:00', '2026-03-05', '2026-06-27'),  -- LAS  Practical, Phauk Sokkhey, A417
    (4,    5,    9,   4, '15:00', '17:00', '2026-03-05', '2026-06-27'),  -- IDB  Practical, Nop Phearum,   J602

    -- FRIDAY (5)
    (3,    1,    10,  5, '09:00', '11:00', '2026-03-06', '2026-06-27'),  -- LAS  Lecture,   Phauk Sokkhey, A401
    (2,    3,    7,   5, '13:00', '15:00', '2026-03-06', '2026-06-27'),  -- DSA  Practical, Seak Leng,     A417
    (2,    3,    13,  5, '15:00', '17:00', '2026-03-06', '2026-06-27');  -- UCP  Practical, Seak Leng,     A417

INSERT INTO recurring_schedule
    (teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until)
SELECT
    teacher_id, classroom_id, course_id, day_of_week, start_time, end_time, effective_from, effective_until
FROM _seed_recurring;

-- -------------------------------------------------------------
-- 7. SCHEDULE (auto-generated weekly occurrences)
-- Uses WITH RECURSIVE to expand recurring_schedule into
-- individual schedule rows for each week until effective_until.
-- All BOOKED, VISIBLE, priority=1, created_by=1
-- Type inference: based on course_id and time pattern
-- created_at = '2026-02-20 09:30:00' for batch identification
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
        -- Infer type from (course_id, time pattern):
        CASE 
            WHEN rs.course_id = 12 THEN 'DEFAULT'  -- SP6 is flexible
            WHEN rs.course_id = 11 AND rs.start_time = '09:00' THEN 'LECTURE'   -- CSC 09:00-11:00
            WHEN rs.course_id = 11 AND rs.start_time = '15:00' THEN 'PRACTICAL' -- CSC 15:00-17:00
            WHEN rs.course_id = 7 AND rs.start_time = '09:00' THEN 'LECTURE'    -- DSA 09:00-11:00
            WHEN rs.course_id = 7 AND rs.start_time = '13:00' THEN 'PRACTICAL'  -- DSA 13:00-15:00
            WHEN rs.course_id = 10 AND rs.start_time = '07:00' THEN 'LECTURE'   -- LAS 07:00-09:00
            WHEN rs.course_id = 10 AND rs.start_time = '09:00' THEN 'PRACTICAL' -- LAS 09:00-11:00
            WHEN rs.course_id = 10 AND rs.start_time = '13:00' THEN 'TUTORIAL'  -- LAS 13:00-15:00
            WHEN rs.course_id = 9 AND rs.start_time = '07:00' THEN 'LECTURE'    -- IDB 07:00-09:00
            WHEN rs.course_id = 9 AND rs.start_time = '15:00' THEN 'PRACTICAL'  -- IDB 15:00-17:00
            WHEN rs.course_id = 13 AND rs.start_time = '15:00' THEN 'PRACTICAL' -- UCP 15:00-17:00
            WHEN rs.course_id = 13 AND rs.start_time = '15:00' THEN 'LECTURE'   -- UCP 15:00-17:00
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
    '2026-02-20 09:30:00' as created_at
FROM schedule_gen;

-- -------------------------------------------------------------
-- 8. SCHEDULE–CLASS MAPPING (link all generated sessions to class 7)
-- Query by created_at timestamp to identify the batch
-- -------------------------------------------------------------

INSERT INTO schedule_classes (schedule_id, class_id)
SELECT s.id, 7
FROM schedule s
WHERE s.date BETWEEN '2026-03-02' AND '2026-06-27'
  AND s.created_at = '2026-02-20 09:30:00';

-- -------------------------------------------------------------
-- 9. SCHEDULE HISTORY (audit log for the batch creation)
-- -------------------------------------------------------------

INSERT INTO schedule_history (schedule_id, action, changed_by, timestamp, note)
SELECT s.id, 'CREATE', 1, '2026-02-20 09:30:00',
    'Initial schedule created for IP-AI-Y2-S2'
FROM schedule s
WHERE s.date BETWEEN '2026-03-02' AND '2026-06-27'
  AND s.created_at = '2026-02-20 09:30:00';

COMMIT;
