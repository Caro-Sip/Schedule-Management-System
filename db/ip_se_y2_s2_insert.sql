-- =============================================================
-- INSERT: IP-SE-Y2-S2 class, courses, classroom, and schedule
-- Assumes existing seed data from V4_class_courses.sql
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
-- 5. RECURRING SCHEDULE
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
-- effective_from = first occurrence date in the semester
-- Teacher IDs: Hok Tin=1, Seak Leng=2, Phauk Sokkhey=3,
--              Nop Phearum=4, Hen Rathpisey=5, Srang Sarot=6
-- Classroom IDs: A401=1, A402=2, A417=3, A420=4,
--                J602=5, J603=6, J604=7, A109=8
-- -------------------------------------------------------------

INSERT INTO recurring_schedule
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
    (2, 3, 7,  5, '07:00', '09:00', '2026-03-06', '2026-06-27'),  -- DSA Practical,  Seak Leng,     A417
    (3, 2, 10, 5, '13:00', '15:00', '2026-03-06', '2026-06-27'),  -- LAS Tutorial,   Phauk Sokkhey, A402
    (1, 4, 5,  5, '15:00', '17:00', '2026-03-06', '2026-06-27');  -- OOP Practical,  Hok Tin,       A420

-- -------------------------------------------------------------
-- 6. SCHEDULE (first-week representative sessions)
-- Using the first occurrence week: 2026-03-02 to 2026-03-06
-- All BOOKED, VISIBLE, priority=1, created_by=1
-- Types: Lecture=LECTURE, Practical=PRACTICAL, Tutorial=TUTORIAL
-- -------------------------------------------------------------

INSERT INTO schedule (
    classroom_id, teacher_id, course_id, date, start_time, end_time,
    status, visibility, type, priority, created_by, created_at
) VALUES
    -- MONDAY 2026-03-02
    (5, 1, 5,  '2026-03-02', '13:00', '15:00', 'BOOKED', 'VISIBLE', 'LECTURE',    1, 1, '2026-02-20 09:00:00'),  -- OOP Lecture
    (2, 6, 6,  '2026-03-02', '15:00', '17:00', 'BOOKED', 'VISIBLE', 'PRACTICAL',  1, 1, '2026-02-20 09:00:00'),  -- SP4 Practical

    -- TUESDAY 2026-03-03
    (8, 2, 7,  '2026-03-03', '09:00', '11:00', 'BOOKED', 'VISIBLE', 'LECTURE',    1, 1, '2026-02-20 09:00:00'),  -- DSA Lecture
    (6, 5, 8,  '2026-03-03', '13:00', '15:00', 'BOOKED', 'VISIBLE', 'LECTURE',    1, 1, '2026-02-20 09:00:00'),  -- OS Lecture

    -- WEDNESDAY 2026-03-04
    (1, 4, 9,  '2026-03-04', '07:00', '09:00', 'BOOKED', 'VISIBLE', 'LECTURE',    1, 1, '2026-02-20 09:00:00'),  -- IDB Lecture
    (3, 3, 10, '2026-03-04', '09:00', '10:00', 'BOOKED', 'VISIBLE', 'PRACTICAL',  1, 1, '2026-02-20 09:00:00'),  -- LAS Practical

    -- THURSDAY 2026-03-05
    (1, 3, 10, '2026-03-05', '07:00', '09:00', 'BOOKED', 'VISIBLE', 'LECTURE',    1, 1, '2026-02-20 09:00:00'),  -- LAS Lecture
    (4, 4, 9,  '2026-03-05', '13:00', '15:00', 'BOOKED', 'VISIBLE', 'PRACTICAL',  1, 1, '2026-02-20 09:00:00'),  -- IDB Practical
    (2, 5, 8,  '2026-03-05', '15:00', '17:00', 'BOOKED', 'VISIBLE', 'PRACTICAL',  1, 1, '2026-02-20 09:00:00'),  -- OS Practical

    -- FRIDAY 2026-03-06
    (3, 2, 7,  '2026-03-06', '07:00', '09:00', 'BOOKED', 'VISIBLE', 'PRACTICAL',  1, 1, '2026-02-20 09:00:00'),  -- DSA Practical
    (2, 3, 10, '2026-03-06', '13:00', '15:00', 'BOOKED', 'VISIBLE', 'TUTORIAL',   1, 1, '2026-02-20 09:00:00'),  -- LAS Tutorial
    (4, 1, 5,  '2026-03-06', '15:00', '17:00', 'BOOKED', 'VISIBLE', 'PRACTICAL',  1, 1, '2026-02-20 09:00:00');  -- OOP Practical

-- -------------------------------------------------------------
-- 7. SCHEDULE–CLASS MAPPING (link all 12 sessions to class 6)
-- Schedule IDs continue from existing max (5), so new ones = 6–17
-- -------------------------------------------------------------

INSERT INTO schedule_classes (schedule_id, class_id)
SELECT s.id, 6
FROM schedule s
WHERE s.date BETWEEN '2026-03-02' AND '2026-03-06'
  AND s.created_at = '2026-02-20 09:00:00';

-- -------------------------------------------------------------
-- 8. SCHEDULE HISTORY (audit log for the batch creation)
-- -------------------------------------------------------------

INSERT INTO schedule_history (schedule_id, action, changed_by, timestamp, note)
SELECT s.id, 'CREATE', 1, '2026-02-20 09:00:00',
    'Initial schedule created for IP-SE-Y2-S2'
FROM schedule s
WHERE s.date BETWEEN '2026-03-02' AND '2026-03-06'
  AND s.created_at = '2026-02-20 09:00:00';

COMMIT;
