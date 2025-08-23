/*
Subject select UX. Consider disabling #subject-selection until a tutor is chosen; then populate from that tutor’s subjects. (Pure JS fix.) 

Section toggles. Your CSS rotates the chevron when .section-header has .active. Don’t forget to add/remove that class in JS when expanding/collapsing. 

Views/sub-views: Your CSS makes .view visible when not .hidden, and sub-views show when not .hidden. That means #home-view will show by default (good), and inside Students/Tutors the list panes will become visible once the parent view is shown. No change needed—just be consistent in JS when toggling hidden. 
*/

import { DOM } from './dom.js';
import * as Sessions from './sessions_clean.js';
import * as Students from './students_clean.js';
import * as Tutors from './tutors_clean.js';

// Which sections count as "views"
const VIEWS = ['home-view', 'students-view', 'tutors-view', 'student-details', 'tutor-details'];

function showView(id) {
  // hide all, then show the requested one
  VIEWS.forEach(v => DOM.hide(v));
  DOM.show(id);

  // update the active nav item
  document.querySelectorAll('.sidebar nav li').forEach(li => {
    const liViewId = `${li.dataset.view}-view`; // 'home' -> 'home-view'
    li.classList.toggle('active', liViewId === id);
  });
}

// Bind navigation events
function bindNav() {
  DOM.on('nav-home',     'click', () => showView('home-view'));
  DOM.on('nav-students', 'click', () => showView('students-view'));
  DOM.on('nav-tutors',   'click', () => showView('tutors-view'));
}

// Home view: expand/collapse sections (Add Session, Session History)
function bindHomeToggles() {
  document.querySelectorAll('#home-view .section-header').forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('active'); // rotates chevron if your CSS handles it
      const content = header.nextElementSibling; // the .section-content div
      if (content && content.classList.contains('section-content')) {
        content.classList.toggle('hidden'); // show/hide the body
      }
    });
  });
}

// ---------- Truncation tooltip (for Session History table) ----------
function bindTruncationTooltips() {
  // We bind to the Session History table inside Home view
  const table = document.querySelector('#home-view table');
  if (!table) return;

  let tipEl = null;       // the DOM element for the tooltip
  let currentCell = null; // which cell we're showing

  // Show tooltip only if the cell is single-line & actually clipped
  const isTruncated = (el) => {
    const cs = getComputedStyle(el);
    const isNowrap = cs.whiteSpace === 'nowrap';
    // scrollWidth > clientWidth means some text is hidden
    return isNowrap && el.scrollWidth > el.clientWidth;
  };

  const showTip = (cell) => {
    tipEl = document.createElement('div');
    tipEl.className = 'tooltip-bubble';
    tipEl.textContent = cell.textContent.trim();
    document.body.appendChild(tipEl);
    positionTip(cell);
  };

  const hideTip = () => {
    if (tipEl) tipEl.remove();
    tipEl = null;
    currentCell = null;
  };

  const positionTip = (cell) => {
    if (!tipEl) return;
    const pad = 12; // distance from viewport edges
    const rect = cell.getBoundingClientRect();

    // Default: below the cell, horizontally centered
    let x = rect.left + rect.width / 2;
    let y = rect.bottom + 10;

    // Place values first so we can read size
    tipEl.style.left = x + 'px';
    tipEl.style.top  = y + 'px';
    tipEl.classList.remove('tooltip--above');

    // If it would overflow the bottom, flip above
    if (y + tipEl.offsetHeight + pad > window.innerHeight) {
      y = rect.top - tipEl.offsetHeight - 10;
      tipEl.style.top = y + 'px';
      tipEl.classList.add('tooltip--above');
    }

    // Clamp horizontally inside the viewport
    const half = tipEl.offsetWidth / 2;
    const minX = pad + half;
    const maxX = window.innerWidth - pad - half;
    x = Math.max(minX, Math.min(maxX, x));
    tipEl.style.left = x + 'px';
  };

  // Use capture so it also works for future rows (delegation style)
  table.addEventListener('mouseenter', (e) => {
    const cell = e.target.closest('td, th');
    if (!cell) return;
    if (isTruncated(cell)) {
      currentCell = cell;
      showTip(cell);
    }
  }, true);

  table.addEventListener('mousemove', () => {
    if (currentCell && tipEl) positionTip(currentCell);
  }, true);

  table.addEventListener('mouseleave', (e) => {
    const leftCell = e.target.closest('td, th');
    if (leftCell && leftCell === currentCell) hideTip();
  }, true);

  // If the window resizes/scrolls while a tip is open, reposition or hide
  window.addEventListener('scroll', () => currentCell && tipEl && positionTip(currentCell), { passive: true });
  window.addEventListener('resize', () => currentCell && tipEl && positionTip(currentCell));
}
// ---------- end tooltip ----------


window.addEventListener("load", start);

async function start() {
    // Initialize students and tutors
    await Students.init();
    await Tutors.init();
    await Sessions.init();
    
    bindNav();            // set up the tabs
    bindHomeToggles();    // set up the collapsible sections
    showView('home-view'); // default

    // Populate selects
    DOM.fillSelect('student-selection', Students.state.list, s => s.id, s => s.name, 'Select Student');
    DOM.fillSelect('tutor-selection',   Tutors.state.list,   t => t.id, t => t.name, 'Select Tutor');
    DOM.get('subject-selection').disabled = true;

    // Tutor -> subjects linkage
    DOM.on('tutor-selection', 'change', () => {
        const tutorId = DOM.get('tutor-selection').value;
        const subjects = Tutors.subjectsFor(tutorId);
        DOM.fillSelect('subject-selection', subjects, s => s, s => s, 'Select Subject');
        DOM.get('subject-selection').disabled = subjects.length === 0;
    });

    // Render existing sessions table
    DOM.html('sessionTable', Sessions.rowsHTML(Sessions.state.sessions));
    bindTruncationTooltips();


    // Render lists of students and tutors
    DOM.html('student-list', Students.listHTML(Students.state.list));
    DOM.html('tutor-list',   Tutors.listHTML(Tutors.state.list));

    DOM.on('sessionForm', 'submit', async (e) => {
      e.preventDefault();

      const studentId = DOM.get('student-selection').value;
      const tutorId   = DOM.get('tutor-selection').value;
      const subject   = DOM.get('subject-selection').value;
      const dateStr   = DOM.get('date').value;       // "YYYY-MM-DD"
      const startStr  = DOM.get('startTime').value;  // "HH:MM"
      const durHours  = parseFloat(DOM.get('duration').value);

      if (!studentId || !tutorId || !subject || !dateStr || !startStr || isNaN(durHours)) {
        alert('Please fill the whole form.');
        return;
      }

      // Build start/end as JS Dates in local time
      const [y, m, d] = dateStr.split('-').map(Number);
      const [H, M]    = startStr.split(':').map(Number);
      const startAt   = new Date(y, m - 1, d, H, M);
      const endAt     = new Date(startAt.getTime() + Math.round(durHours * 60) * 60000);

      // Get rate (if stored on tutor) — otherwise default 0
      const tutor = Tutors.state.list.find(t => t.id === tutorId);
      const rate  = Number(tutor?.rate ?? 0);
      const total = Math.round(durHours * rate * 100) / 100;

      const newSession = {
        studentId, tutorId, subject,
        startAt, endAt, duration: durHours,
        rate, total, paid: false,
        status: "hasn't occurred yet"
      };

      // Save to Firestore (it will convert Dates -> Timestamps)
      const id = await Sessions.addSession(newSession);

      // Update UI model with normalized object
      const saved = { id, ...newSession };
      Sessions.state.sessions.push((function normalizeAfterSave(x){
        // small inline normalize; same logic as sessions_clean.js/normalize
        const studentName = Students.state.list.find(s => s.id===x.studentId)?.name || '—';
        const tutorName   = Tutors.state.list.find(t => t.id===x.tutorId)?.name || '—';
        return {
          id, studentId: x.studentId, tutorId: x.tutorId,
          studentName, tutorName, subject: x.subject,
          date: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
          startTime: startStr,
          endTime: Sessions.computeEndTime(startStr, durHours),
          duration: durHours, paid: x.paid, status: x.status, total
        };
      })(saved));

      // Re-render the table
      DOM.html('sessionTable', Sessions.rowsHTML(Sessions.state.sessions));
      // Optionally reset the form
      DOM.get('sessionForm').reset();
      DOM.get('subject-selection').disabled = true;
    });

    // Initialize sessions and set up calendar
    //Sessions.setupCalendar();
    }
