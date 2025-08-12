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
      duration: 1, // in hours
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
      <td>${s.startTime}</td>
      <td>${s.endTime}</td>
      <td>${s.studentName}</td>
      <td>${s.tutorName}</td>
      <td>${s.subject ?? '—'}</td>
      <td>${s.duration} hours</td>
      <td>${s.paid ? 'Received' : 'Not Received'}</td>
      <td>${fmtMoney(s.total)}</td>
      <td>${s.status}</td>
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
