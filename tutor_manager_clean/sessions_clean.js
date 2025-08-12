
import {
  loadAllSessions, sessions as store,
  addSession, updateSession, deleteSession
} from './firestore_sync_clean.js';

export const state = { sessions: [] };

export async function init() {
 await loadAllSessions();
  state.sessions = store;
  return state.sessions;
}

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

