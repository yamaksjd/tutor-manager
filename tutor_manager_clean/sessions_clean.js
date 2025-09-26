
import {
  loadAllSessions, sessions as store,
  addSession, updateSession, deleteSession
} from './firestore_sync_clean.js';
import * as Students from './students_clean.js';
import * as Tutors from './tutors_clean.js';

export const state = { sessions: [] };

export async function init() {
 await loadAllSessions();
  state.sessions = store.map(normalize);
  return state.sessions;
}
// ---- helpers ----
// Turn a raw session doc (from Firestore) into a "pretty" object the table expects.
function normalize(raw) {
  // 1) Figure out the start and end Date objects.
  // Try multiple places because old docs might use different fields/types.
  var start =
    firstNonNullDate(raw.startAt, raw.startTime) ||
    mergeDateAndTime(raw.date, raw.startTime);

  var end =
    firstNonNullDate(raw.endAt, raw.endTime) ||
    mergeDateAndTime(raw.date, raw.endTime);

  // 2) Work out student/tutor IDs and names (support both new IDs and old name-only docs).
  var studentId = raw.studentId ? raw.studentId : null;
  var tutorId   = raw.tutorId   ? raw.tutorId   : null;

  var studentName = findName(Students.list || Students.state?.list, studentId);
  if (!studentName && typeof raw.student === 'string') studentName = raw.student;
  if (!studentName) studentName = '—';

  var tutorName = findName(Tutors.list || Tutors.state?.list, tutorId);
  if (!tutorName && typeof raw.tutor === 'string') tutorName = raw.tutor;
  if (!tutorName) tutorName = '—';

  // 3) Duration (hours). If not stored, compute from start/end.
  var durationHours = 0;
  if (typeof raw.duration === 'number') {
    durationHours = raw.duration;
  } else if (start && end) {
    var minutes = Math.round((end - start) / 60000);
    durationHours = minutes / 60;
  }

  // 4) Money and status fields with safe defaults.
  var total = 0;
  if (typeof raw.total === 'number') {
    total = raw.total;
  } else if (typeof raw.total === 'string' && raw.total.trim() !== '') {
    total = parseFloat(raw.total);
    if (isNaN(total)) total = 0;
  }
  var paid = Boolean(raw.paid);
  var status = raw.status ? raw.status : "hasn't occurred yet";

  // 5) Build the final object the table wants (strings for date/time).
  var result = {
    id: raw.id,
    studentId: studentId,
    tutorId: tutorId,
    studentName: studentName,
    tutorName: tutorName,
    subject: (raw.subject != null ? raw.subject : '—'),
    date: (start ? formatDateYYYYMMDD(start) : '—'),
    startTime: (start ? formatTimeHHMM(start) : '—'),
    endTime: (end ? formatTimeHHMM(end)
                  : computeEndTimeDB((start ? formatTimeHHMM(start) : '00:00'), durationHours)),
    duration: durationHours,
    paid: paid,
    status: status,
    total: total
  };

  return result;
}

// Return the first value that can be converted to a JS Date.
// Tries: Firestore Timestamp -> Date, JS Date -> Date. Anything else returns null.
function firstNonNullDate(value1, value2) {
  var d;

  d = toJsDate(value1);
  if (d) return d;

  d = toJsDate(value2);
  if (d) return d;

  return null;
}

// Convert Firestore Timestamp or JS Date to JS Date. Otherwise return null.
function toJsDate(value) {
  // Firestore Timestamp has a .toDate() function
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  // Already a JS Date
  if (value instanceof Date) {
    return value;
  }
  return null;
}

// Combine a "date" value and a "time" value into one JS Date.
// - dateVal can be Timestamp, Date, or "YYYY-MM-DD"
// - timeVal can be Timestamp, Date, or "HH:MM"
function mergeDateAndTime(dateVal, timeVal) {
  if (!dateVal || !timeVal) return null;

  // Get a base date (Y, M, D) from dateVal
  var baseDate = toJsDate(dateVal);
  if (!baseDate && typeof dateVal === 'string') {
    var parts = dateVal.split('-');
    if (parts.length === 3) {
      var y = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      var d = parseInt(parts[2], 10);
      baseDate = new Date(y, m - 1, d, 0, 0);
    }
  }
  if (!baseDate) return null;

  // Get hours/minutes from timeVal
  var H = 0, M = 0;
  var timeAsDate = toJsDate(timeVal);
  if (timeAsDate) {
    H = timeAsDate.getHours();
    M = timeAsDate.getMinutes();
  } else if (typeof timeVal === 'string' && timeVal.indexOf(':') !== -1) {
    var hm = timeVal.split(':');
    H = parseInt(hm[0], 10) || 0;
    M = parseInt(hm[1], 10) || 0;
  } else {
    return null;
  }

  // Build the final Date using base date + H:M
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    H,
    M
  );
}

// Format a Date as "YYYY-MM-DD"
function formatDateYYYYMMDD(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

// Format a Date as "HH:MM"
function formatTimeHHMM(d) {
  var H = String(d.getHours()).padStart(2, '0');
  var M = String(d.getMinutes()).padStart(2, '0');
  return H + ':' + M;
}

// Find a person's name by id in a list like [{id, name}, ...]
function findName(list, id) {
  if (!Array.isArray(list) || !id) return null;
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item && item.id === id) return item.name || null;
  }
  return null;
}

// Given start time string "HH:MM" and duration in hours (number),
// return the end time string "HH:MM". (Wraps past midnight if needed.)
function computeEndTimeDB(startHHMM, durationHours) {
  if (!startHHMM || typeof durationHours !== 'number') return '00:00';

  var parts = startHHMM.split(':');
  var h = parseInt(parts[0], 10) || 0;
  var m = parseInt(parts[1], 10) || 0;

  var startMinutes = h * 60 + m;
  var durationMinutes = Math.round(durationHours * 60);
  var endMinutes = startMinutes + durationMinutes;

  var endH = Math.floor(endMinutes / 60) % 24; // wrap after 24h
  var endM = endMinutes % 60;

  return String(endH).padStart(2, '0') + ':' + String(endM).padStart(2, '0');
}
// ---------- end helpers ----------

// Table rows HTML (tbody content)
export function rowsHTML(sessions) {
  return sessions.map(s => `
    <tr data-id="${s.id}">
      <td>${s.date}</td>
      <td>${s.startTime}</td>
      <td>${s.endTime}</td>
      <td>${s.studentName}</td>
      <td>${s.tutorName}</td>
      <td>${s.subject ?? '—'}</td>
      <td>${s.duration} hours</td>
      <td>${s.paid ? 'Received' : 'Not Received'}</td>
      <td>${s.status}</td>
      <td>${fmtMoney(s.total)}</td>
      <td>
        <button class="btn-icon edit"   data-action="edit"   data-id="${s.id}" title="Edit session"   aria-label="Edit session">
          <ion-icon name="create-outline"></ion-icon>
        </button>
        <button class="btn-icon delete" data-action="delete" data-id="${s.id}" title="Delete session" aria-label="Delete session">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </td>
    </tr>
  `).join('');
}

export function computeEndTime(startTime, durationHours) {
  // startTime = "HH:MM", durationHours = number (can be decimal like 1.5)
  const [h, m] = startTime.split(':').map(Number);
  const start = h * 60 + m;  // convert start time to minutes
  const durationMinutes = Math.round(durationHours * 60);  // convert hours to minutes
  const end = start + durationMinutes;
  const eh = Math.floor(end / 60) % 24;  // get hours, wrap after midnight
  const em = end % 60;  // get remaining minutes
  return `${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`;
}

function fmtMoney(n) {
  const v = Number(n ?? 0);
  return isFinite(v) ? v.toFixed(2) : '0.00';
}

// Sum totals for the summary panel (ignore cancelled sessions)
export function summarize(list) {
  let hours = 0, total = 0, received = 0, notReceived = 0;

  for (const s of list) {
    if (s.status === 'cancelled') continue;  // don't count cancelled
    const h = Number(s.duration) || 0;
    const amt = Number(s.total) || 0;

    hours  += h;
    total  += amt;
    if (s.paid) received += amt; else notReceived += amt;
  }

  // keep clean 2-decimals for money (hours can be fractional)
  const round2 = n => Math.round((n || 0) * 100) / 100;
  return {
    hours: round2(hours),
    total: round2(total),
    received: round2(received),
    notReceived: round2(notReceived),
  };
}


export { addSession, updateSession, deleteSession };

