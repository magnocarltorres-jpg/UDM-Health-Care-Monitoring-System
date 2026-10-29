const CLINIC_TIME_ZONE = "Asia/Manila";
const CLINIC_LOCALE = "en-PH";

function parseDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const dateOnly = typeof value === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(`${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}T12:00:00+08:00`)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatClinicDate(value, options = {}) {
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(date);
}

export function formatClinicTime(value, options = {}) {
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
}

export function formatClinicDateTime(value) {
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(CLINIC_LOCALE, {
    timeZone: CLINIC_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getClinicDateKey(value = new Date()) {
  const date = parseDate(value);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function getClinicDateInputValue() {
  return getClinicDateKey();
}
