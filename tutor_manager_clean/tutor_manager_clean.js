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

    // Render lists of students and tutors
    DOM.html('student-list', Students.listHTML(Students.state.list));
    DOM.html('tutor-list',   Tutors.listHTML(Tutors.state.list));

    // Initialize sessions and set up calendar
    //Sessions.setupCalendar();
    }
