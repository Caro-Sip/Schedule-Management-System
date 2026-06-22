const START_HOUR = 7;
const END_HOUR = 17;
let HOUR_HEIGHT = 56;

const state = {
  role: "guest",
  view: "class",
  weekOffset: 0,
  userName: "Guest",
  authToken: null,
  currentUser: null,
  currentTeacherId: null,
  defaultCourseId: null,
  smartOverlayTeacherId: null,
  smartOverlayClassIds: [],
  selectedClassId: null,
  selectedRoomId: null,
  selectedTeacherId: null,
  userScheduleOrigin: null,
  smartOverlayEnabled: false,
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
const teacherCourseDirectory = [];



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
let courseModalSearchTerm = "";

const auditLog = [];
