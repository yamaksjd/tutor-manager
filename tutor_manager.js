
import { 
  students, tutors, sessions,
  loadAllStudents, loadAllTutors, loadAllSessions,
  addStudent, updateStudent, deleteStudent,
  addTutor, updateTutor, deleteTutor,
  addSession, updateSession, deleteSession
} from './firestore_sync.js';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.addEventListener("load", async () => {
 
  
    // Initialize calendar
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: [], // Will be populated dynamically
      editable: true, // Enable drag-and-drop

      /*
      Event drop handler: When a user drags and drops a calendar event (representing a tutoring session) to a new date or time, this function runs. It updates the session’s data and the UI to reflect the new schedule.
      */
      eventDrop: function(info) {
        const sessionId = parseInt(info.event.id);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          // Update session date and time
          const newDate = info.event.start.toISOString().split('T')[0];
          const newStartTime = info.event.start.toTimeString().slice(0, 5);
          
          // Calculate new end time based on duration
          const [startHours, startMinutes] = newStartTime.split(':').map(Number);
          const totalMinutes = startHours * 60 + startMinutes + Math.round(session.duration * 60);
          const endHours = Math.floor(totalMinutes / 60);
          const endMinutes = totalMinutes % 60;
          const newEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

          // Update session object
          session.date = newDate;
          session.startTime = newStartTime;
          session.endTime = newEndTime;

          // Update the event in the calendar
          info.event.setEnd(`${newDate}T${newEndTime}`);

          // Update the session table
          const tableElement = document.getElementById("sessionTable");
          if (tableElement) {
            tableElement.innerHTML = ''; // Clear existing rows
            sessions.forEach(s => renderSession(s, tableElement));
          }

          // Update student and tutor detail views if they're open
          const studentDetails = document.getElementById("student-details");
          const tutorDetails = document.getElementById("tutor-details");
          
          if (!studentDetails.classList.contains('hidden')) {
            const studentName = studentDetails.querySelector('h3').textContent.split("'")[0];
            const studentTable = document.getElementById(`sessionTable${studentName}`);
            if (studentTable) {
              studentTable.innerHTML = '';
              sessions.filter(s => s.student === studentName)
                     .forEach(s => renderSession(s, studentTable));
            }
          }

          if (!tutorDetails.classList.contains('hidden')) {
            const tutorName = tutorDetails.querySelector('h3').textContent.split("'")[0];
            const tutorTable = document.getElementById(`sessionTable${tutorName}`);
            if (tutorTable) {
              tutorTable.innerHTML = '';
              sessions.filter(s => s.tutor === tutorName)
                     .forEach(s => renderSession(s, tutorTable));
            }
          }

          // Update totals
          updateTotals();
        }
      },
      eventClick: function(info) {
        const sessionId = parseInt(info.event.id);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          showSessionDetails(session);
        }
      },
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    });
    calendar.render();
    
    // Make calendar available globally
    window.calendar = calendar;


    // Add toggle functionality for home view sections
    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');
        
        // Toggle active class on header
        header.classList.toggle('active');
        
        // Toggle hidden class on content
        content.classList.toggle('hidden');
        
        // Toggle icon rotation
        if (icon) {
          icon.style.transform = header.classList.contains('active') ? 'rotate(-180deg)' : '';
        }
      });
    });

    //creation of array to store sessions - change to localStorage() later
    //id counter (change this later)
    /*
    let idCounter = 3;
    let sessions = [];
    let tutors = [
      {
      id: 1,
      name: "Maria",
      contact: "maria.james@example.com",
      notes: "prefers to teach math",
      rate: 20,
      subjects: ["math", "science", "english"]
    },
    {
      id: 2,
      name: "John",
      contact: "john.watson@example.com",
      notes: "prefers to teach physics",
      rate: 25,
      subjects: ["physics", "chemistry", "biology"]
    },
    {
      id: 3,
      name: "Lina",
      contact: "lina.james@example.com",
      notes: "prefers to teach biology",
      rate: 18,
      subjects: ["portuguese", "english", "history"]
    }
  ]
    let students = [
      {
        id: 1,
        name:"Alice",
        parent:"Jane Smith",
        contact: "jane.smith@example.com",
        notes:"prefers morning sessions",
      },
      {
        id: 2,
        name:"Bob",
        parent:"Mark Johnson",
        contact: "mark.j@example.com",
        notes:"Needs help with algebra",
      },
      {
        id: 3,
        name:"Charlie",
        parent:"Laura Miller",
        contact: "laura.m@example.com",
        notes:"Has a short attention span",
      }
    ];
    */
    renderStudentList()
    renderTutorList()
    renderSubjectSelection()
    // Define tutor rates - change later 
  
    
    document.getElementById("nav-home").addEventListener("click", () => showView("home-view"))
    document.getElementById("nav-students").addEventListener("click", () => showView("students-view"))
    document.getElementById("nav-tutors").addEventListener("click", () => showView("tutors-view"))

    function showView(viewId) {
      //put all views none
      document.querySelectorAll(".view").forEach((view) => {        
        if(view.id == viewId) {
          if(view.classList.contains("hidden")) {
            view.classList.remove("hidden");
        } 
      } else {
          if(!(view.classList.contains("hidden"))){
            view.classList.add("hidden")
          }
        }
    })

      // remove active class from all the navigation buttons
      document.querySelectorAll(".sidebar nav li").forEach((el) => el.classList.remove("active"));

      //add active class to active tab
      switch(viewId) {
        case "home-view": 
          document.getElementById("nav-home").classList.add("active");
          break;
        case "students-view":
          document.getElementById("nav-students").classList.add("active");
          break;
        case "tutors-view": 
          document.getElementById("nav-tutors").classList.add("active");
          break;
        default: // new thing learned!
          break;
      }

    }


      showView("tutor-details");
      document.getElementById("back-to-tutors").addEventListener("click", () => {
        showView("tutors-view");
      });

    // Add function to update calendar events when session status changes
    function updateCalendarEvent(session) {
      if (window.calendar) {
        const event = window.calendar.getEventById(session.id);
        if (event) {
          event.remove();
        }
        const newEvent = {
          id: session.id,
          title: `${session.student} - ${session.subject} (${session.tutor})`,
          start: `${session.date}T${session.startTime}`,
          end: `${session.date}T${session.endTime}`,
          backgroundColor: session.status === 'cancelled' ? '#ef4444' : 
                         session.status === 'occurred' ? '#10b981' : '#3b82f6',
          borderColor: session.status === 'cancelled' ? '#ef4444' : 
                      session.status === 'occurred' ? '#10b981' : '#3b82f6'
        };
        window.calendar.addEvent(newEvent);
      }
    }
  
})