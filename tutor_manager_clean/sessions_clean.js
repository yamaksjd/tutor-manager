/*
Form vs table mismatch. The form asks for start time + duration, but the table shows Start Time + End Time. That’s fine—just compute endTime = startTime + duration in JS when saving. (Make sure rounding handles 0.25h steps cleanly.) 


*/

// sessions_clean.js
export const state = { sessions: [] };

export async function init() {
  // seed with 1 example session (will pull from Firestore later)
  state.sessions = [
    {
      id: 'sess1',
      studentId: 's1', studentName: 'Alice Santos',
      tutorId: 't1',   tutorName:   'Carla Duarte',
      subject: 'Math',
      date: '2025-08-20',
      startTime: '15:00',
      endTime: '16:00',
      duration: 60,
      total: 20.00,
      status: "hasn't occurred yet",
      paid: false
    }
  ];
  return state.sessions;
}

// Table rows HTML (tbody content)
export function rowsHTML(sessions) {
  return sessions.map(s => `
    <tr data-id="${s.id}">
      <td>${s.date}</td>
      <td>${s.studentName}</td>
      <td>${s.tutorName}</td>
      <td>${s.subject ?? '—'}</td>
      <td>${s.startTime}–${s.endTime}</td>
      <td>${fmtMoney(s.total)}</td>
      <td>${s.status}</td>
    </tr>
  `).join('');
}

export function computeEndTime(startTime, durationMinutes) {
  // startTime = "HH:MM", durationMinutes = number
  const [h, m] = startTime.split(':').map(Number);
  const start = h * 60 + m;
  const end = start + durationMinutes;
  const eh = Math.floor(end / 60) % 24;  // v1: wrap after midnight; you can forbid crossing midnight later
  const em = end % 60;
  return `${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`;
}

function fmtMoney(n) {
  const v = Number(n ?? 0);
  return isFinite(v) ? v.toFixed(2) : '0.00';
}
