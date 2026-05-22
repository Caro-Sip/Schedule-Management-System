const START_HOUR = 6;
const END_HOUR = 18;
const HOUR_HEIGHT = 56;

const state = {
  role: "guest",
  view: "class",
  weekOffset: 0,
  userName: "Guest",
  selectedClassId: null,
  selectedRoomId: null,
};

const eventsByView = {
  class: [],
  teacher: [],
  room: [],
};

const userDirectory = [
  {
    id: "U-1024",
    name: "Ariana Patel",
    role: "admin",
    department: "Registrar",
    password: "changeme",
    lastModified: "2026-05-15T10:22:00",
  },
  {
    id: "U-1088",
    name: "Miguel Santos",
    role: "professor",
    department: "Engineering",
    password: "changeme",
    lastModified: "2026-05-16T08:40:00",
  },
  {
    id: "U-1125",
    name: "Hana Lee",
    role: "class-monitor",
    department: "Engineering",
    password: "changeme",
    lastModified: "2026-05-14T14:05:00",
  },
  {
    id: "U-1203",
    name: "Priya Nair",
    role: "guest",
    department: "Science",
    password: "changeme",
    lastModified: "2026-05-12T09:30:00",
  },
  {
    id: "U-1266",
    name: "Omar Khalid",
    role: "professor",
    department: "Mathematics",
    password: "changeme",
    lastModified: "2026-05-11T16:50:00",
  },
  {
    id: "U-1310",
    name: "Zoe Chen",
    role: "admin",
    department: "Student Affairs",
    password: "changeme",
    lastModified: "2026-05-10T11:15:00",
  },
  {
    id: "U-1349",
    name: "Leo Martinez",
    role: "guest",
    department: "Arts",
    password: "changeme",
    lastModified: "2026-05-09T17:45:00",
  },
  {
    id: "U-1392",
    name: "Sofia Ibrahim",
    role: "class-monitor",
    department: "Science",
    password: "changeme",
    lastModified: "2026-05-08T13:20:00",
  },
];

const classDirectory = [];

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

const auditLog = [];
