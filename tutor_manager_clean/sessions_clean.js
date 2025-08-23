
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
function normalize(raw) {
  // Handle Timestamp or Date or string date/time
  const start = tsToDate(raw.startAt) || mergeDateTimeStrings(raw.date, raw.startTime);
  const end   = tsToDate(raw.endAt)   || (raw.endTime ? mergeDateTimeStrings(raw.date, raw.endTime) : null);

  // Accept ids or legacy names
  const studentId = raw.studentId || null;
  const tutorId   = raw.tutorId   || null;

  // If you only have names in old docs, keep them as fallback
  const studentName =
    findName(Students.list, studentId) || (typeof raw.student === 'string' ? raw.student : '—');
  const tutorName =
    findName(Tutors.list, tutorId) || (typeof raw.tutor === 'string' ? raw.tutor : '—');

  const duration = typeof raw.duration === 'number'
    ? raw.duration
    : (start && end ? Math.round((end - start) / 60000) / 60 : 0);

  return {
    id: raw.id,
    studentId, tutorId,
    studentName, tutorName,
    subject: raw.subject ?? '—',
    date: start ? fmtDate(start) : '—',
    startTime: start ? fmtTime(start) : '—',
    endTime: end ? fmtTime(end) : computeEndTimeFromDB(start ? fmtTime(start) : '00:00', duration),
    duration,
    paid: !!raw.paid,
    status: raw.status || "hasn't occurred yet",
    total: Number(raw.total ?? 0),
  };
}

function tsToDate(v) {            // Firestore Timestamp -> Date
  return v && typeof v.toDate === 'function' ? v.toDate() : (v instanceof Date ? v : null);
}
function mergeDateTimeStrings(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y,m,d] = dateStr.split('-').map(Number);
  const [H,M]   = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, H, M);
}
function fmtDate(d) { // YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fmtTime(d) { // HH:MM
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function findName(list, id) {
  if (!id) return null;
  return list.find(x => x.id === id)?.name || null;
}
export function computeEndTimeFromDB(startHHMM, durationHours) {
  const [h, m] = startHHMM.split(':').map(Number);
  const start = h * 60 + m;
  const end   = start + Math.round(durationHours * 60);
  const eh = Math.floor(end / 60) % 24;
  const em = end % 60;
  return `${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`;
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

export { addSession, updateSession, deleteSession };

