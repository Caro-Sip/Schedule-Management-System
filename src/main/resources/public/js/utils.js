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
