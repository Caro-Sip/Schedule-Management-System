const START_HOUR = 7;
const END_HOUR = 17;
const HOUR_HEIGHT = 56;

const state = {
  role: "guest",
  view: "class",
  weekOffset: 0,
  userName: "Guest",
  authToken: null,
  currentUser: null,
  currentTeacherId: null,
  defaultCourseId: null,
  selectedClassId: null,
  selectedRoomId: null,
  selectedTeacherId: null,
  userScheduleOrigin: null,
};

const eventsByView = {
  class: [],
  teacher: [],
  room: [],
};

const userDirectory = [];

const classDirectory = [];
const classroomDirectory = [];
const courseDirectory = [];
const teacherDirectory = [];
const teacherDepartmentDirectory = [];

const roomDirectory = [
  {
    id: "R-101",
    name: "Room 101",
    building: "Building A",
    floor: "1",
    lastModified: "2026-05-14T13:05:00",
  },
  {
    id: "R-202",
    name: "Room 202",
    building: "Building B",
    floor: "2",
    lastModified: "2026-05-12T10:30:00",
  },
  {
    id: "R-303",
    name: "Room 303",
    building: "Building C",
    floor: "3",
    lastModified: "2026-05-10T16:15:00",
  },
];

const roleLabels = {
  admin: "Admin",
  professor: "Professor",
  "class-monitor": "Class monitor",
  guest: "Student",
};

let pendingBooking = null;
let editingUserId = null;
let editingClassId = null;
let editingRoomId = null;
let editingCourseId = null;
let courseModalClassId = null;

const auditLog = [];
