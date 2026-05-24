function getRoleLabel(role) {
  return roleLabels[role] || role;
}

function isTeacherRole(role) {
  return role === "professor";
}

function isAdminRole(role) {
  return role === "admin";
}

function createEventId() {
  return `event-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function minutesFromStart(time) {
  const [hour, minutes] = time.split(":").map(Number);
  return (hour - START_HOUR) * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function parseTimeInput(value) {
  if (!value) {
    return null;
  }
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatHour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${period}`;
}

function formatClockTime(timeValue) {
  const total = parseTimeInput(timeValue);
  if (total === null) {
    return timeValue;
  }
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatBookingTimeRange(start, end) {
  return `${formatClockTime(start)} - ${formatClockTime(end)}`;
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeRoomText(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeClassText(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeCourseCode(value) {
  const normalized = normalizeRoomText(value).toUpperCase();
  return normalized ? `SUBJ-${normalized.slice(0, 24)}` : "";
}

function getBookingClassrooms() {
  return classroomDirectory && classroomDirectory.length > 0 ? classroomDirectory : roomDirectory;
}

function getBookingClasses() {
  return classDirectory || [];
}

function parseRoomInput(value) {
  const normalized = (value || "").trim();
  const match = normalized.match(/([A-Za-z])\s*[-·]??\s*(\d{1,4})/);
  if (match) {
    return {
      buildingLetter: match[1].toUpperCase(),
      roomNumber: match[2],
    };
  }

  const digits = normalized.match(/(\d{1,4})/);
  return {
    buildingLetter: "",
    roomNumber: digits ? digits[1] : "",
  };
}

function resolveClassroomFromInput(value, availableClassrooms) {
  const query = normalizeRoomText(value);
  if (!query) {
    return null;
  }

  const { buildingLetter, roomNumber } = parseRoomInput(value);
  const classrooms = availableClassrooms || classroomDirectory || [];

  return (
    classrooms.find((classroom) => {
      const candidates = [
        classroom.id,
        classroom.name,
        classroom.building,
        getRoomShortLabel(classroom),
        getRoomDisplayLabel(classroom),
      ]
        .filter(Boolean)
        .map((candidate) => normalizeRoomText(candidate));

      const buildingMatches =
        buildingLetter &&
        normalizeRoomText(classroom.building || "").includes(normalizeRoomText(buildingLetter));
      const roomMatches =
        roomNumber &&
        normalizeRoomText(classroom.name || classroom.id || "").includes(normalizeRoomText(roomNumber));

      return (
        candidates.some(
          (candidate) =>
            candidate === query || candidate.includes(query) || query.includes(candidate)
        ) ||
        (buildingMatches && roomMatches)
      );
    }) || null
  );
}

function getClassDisplayLabel(classItem) {
  if (!classItem) {
    return "";
  }

  return `${classItem.name || `Class ${classItem.id}`} · ID ${classItem.id}`;
}

function resolveClassFromInput(value, availableClasses) {
  const normalizedInput = normalizeClassText(value);
  if (!normalizedInput) {
    return null;
  }

  const classes = availableClasses || classDirectory || [];
  return (
    classes.find((classItem) => {
      const candidates = [classItem.id, classItem.name, getClassDisplayLabel(classItem)]
        .filter(Boolean)
        .map((candidate) => normalizeClassText(candidate));

      return candidates.some(
        (candidate) =>
          candidate === normalizedInput ||
          candidate.includes(normalizedInput) ||
          normalizedInput.includes(candidate)
      );
    }) || null
  );
}

async function resolveCourseIdFromSubject(subject) {
  const subjectText = (subject || "").trim();
  if (!subjectText) {
    return null;
  }

  const normalizedSubject = normalizeRoomText(subjectText);
  const courseCode = normalizeCourseCode(subjectText);
  const existing = (courseDirectory || []).find(
    (course) =>
      normalizeRoomText(course.name) === normalizedSubject ||
      normalizeRoomText(course.code) === normalizeRoomText(courseCode)
  );

  if (existing) {
    return existing.id;
  }

  if (typeof createCourseApi !== "function") {
    throw new Error("Course API is not available");
  }

  const created = await createCourseApi({
    name: subjectText,
    code: courseCode,
    totalHours: 45,
  });

  if (created) {
    const normalized = normalizeCoursePayload(created);
    courseDirectory.push(normalized);
    return normalized.id;
  }

  return null;
}

function getRoomShortLabel(room) {
  if (!room) {
    return "";
  }

  const buildingMatch = (room.building || "").match(/([A-Z])$/i);
  const buildingLetter = buildingMatch ? buildingMatch[1].toUpperCase() : "";
  const roomNumberMatch = (room.name || room.id || "").match(/(\d+)$/);
  const roomNumber = roomNumberMatch ? roomNumberMatch[1] : "";

  return [buildingLetter, roomNumber].filter(Boolean).join(" ");
}

function getRoomDisplayLabel(room) {
  if (!room) {
    return "";
  }

  const shortLabel = getRoomShortLabel(room);
  return shortLabel ? `${shortLabel} · ${room.name || room.id}` : room.name || room.id || "";
}

function getRoomFloorLabel(room) {
  if (!room) {
    return "";
  }

  if (room.floor) {
    return `Floor ${room.floor}`;
  }

  const roomNumberMatch = (room.name || room.id || "").match(/(\d{3,4})$/);
  if (!roomNumberMatch) {
    return "";
  }

  const roomNumber = roomNumberMatch[1];
  const floorDigit = roomNumber.length >= 3 ? roomNumber[0] : "";
  return floorDigit ? `Floor ${floorDigit}` : "";
}

// Return the usual slot [startMinutes, endMinutes] that contains the given absolute minutes
// absoluteMinutes is minutes after midnight (e.g., 7:30 => 450)
function getUsualSlotForMinutes(absoluteMinutes) {
  const slots = [
    [7 * 60, 9 * 60],
    [9 * 60, 11 * 60],
    [11 * 60, 13 * 60],
    [13 * 60, 15 * 60],
    [15 * 60, 17 * 60],
  ];
  for (let i = 0; i < slots.length; i += 1) {
    const [s, e] = slots[i];
    if (absoluteMinutes >= s && absoluteMinutes < e) {
      return [s, e];
    }
  }
  // if before first slot, return first slot; if after last, return last slot
  if (absoluteMinutes < slots[0][0]) {
    return slots[0];
  }
  return slots[slots.length - 1];
}
