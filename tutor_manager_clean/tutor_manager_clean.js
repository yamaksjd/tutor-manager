/*
Subject select UX. Consider disabling #subject-selection until a tutor is chosen; then populate from that tutor’s subjects. (Pure JS fix.) 

Section toggles. Your CSS rotates the chevron when .section-header has .active. Don’t forget to add/remove that class in JS when expanding/collapsing. 

Views/sub-views: Your CSS makes .view visible when not .hidden, and sub-views show when not .hidden. That means #home-view will show by default (good), and inside Students/Tutors the list panes will become visible once the parent view is shown. No change needed—just be consistent in JS when toggling hidden. 
*/

import { DOM } from './dom.js';
import * as Sessions from './sessions_clean.js';
import * as Students from './students_clean.js';
import * as Tutors from './tutors_clean.js';

window.addEventListener("load", start);

async function start() {
    // Initialize students and tutors
    await Students.init();
    await Tutors.init();
    await Sessions.init();
    
    // Set up event listeners for the sidebar navigation
    DOM.on("nav-home", "click", () => DOM.show("home-view"));
    DOM.on("nav-students", "click", () => DOM.show("students-view"));
    DOM.on("nav-tutors", "click", () => DOM.show("tutors-view"));

    // Show the home view by default
    DOM.show("home-view");

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
    DOM.html('sessionTableBody', Sessions.rowsHTML(Sessions.state.sessions));

    // Render lists of students and tutors
    DOM.html('student-list', Students.listHTML(Students.state.list));
    DOM.html('tutor-list',   Tutors.listHTML(Tutors.state.list));

    // Initialize sessions and set up calendar
    //Sessions.setupCalendar();
    }
