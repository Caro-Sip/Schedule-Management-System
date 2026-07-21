-- Seed Data file based on user request

-- 4 Class Monitors
INSERT INTO users (name, email, password_hash, role) VALUES 
('Omar Idris', 'omar.idris@school.local', '12345', 'MONITOR'),
('Mei Lin', 'mei.lin@school.local', '12345', 'MONITOR'),
('Alex Jordan', 'alex.jordan@school.local', '12345', 'MONITOR'),
('Monitor SE Y2', 'monitor.se@school.local', '12345', 'MONITOR');

-- 4 Teachers / Professors
INSERT INTO users (name, email, password_hash, role) VALUES 
('Hok Tin', 'hok.tin@school.local', '12345', 'TEACHER'),
('Seak Leng', 'seak.leng@school.local', '12345', 'TEACHER'),
('Phauk Sokkhey', 'phauk.sokkhey@school.local', '12345', 'TEACHER'),
('Nop Phearum', 'nop.phearum@school.local', '12345', 'TEACHER');

INSERT INTO teachers (user_id, department) VALUES 
((SELECT id FROM users WHERE email='hok.tin@school.local'), 'Computer Science'),
((SELECT id FROM users WHERE email='seak.leng@school.local'), 'Mathematics'),
((SELECT id FROM users WHERE email='phauk.sokkhey@school.local'), 'Physics'),
((SELECT id FROM users WHERE email='nop.phearum@school.local'), 'Chemistry');

-- 10 Classrooms
INSERT INTO classrooms (name, building, capacity) VALUES 
('Room 101', 'Building A', 30),
('Room 102', 'Building A', 30),
('Room 103', 'Building A', 40),
('Room 104', 'Building A', 40),
('Room 201', 'Building B', 50),
('Room 202', 'Building B', 50),
('Room 203', 'Building B', 60),
('Room 204', 'Building B', 60),
('Lab 1', 'Science Building', 25),
('Lab 2', 'Science Building', 25);

-- 4 Classes
-- 2 start today (2026-07-21) and end in November this year (e.g. 2026-11-30)
-- 2 start whenever (e.g. 2026-08-01 to 2026-12-15)
INSERT INTO classes (name, year, semester, start_date, end_date, created_by) VALUES 
('CS101', 2026, 1, '2026-07-21', '2026-11-30', 1),
('MATH101', 2026, 1, '2026-07-21', '2026-11-30', 1),
('PHY101', 2026, 1, '2026-08-01', '2026-12-15', 1),
('CHEM101', 2026, 1, '2026-08-01', '2026-12-15', 1);
