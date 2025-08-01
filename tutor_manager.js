/*
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

*/
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
  
  // Remove duplicate Firestore CRUD logic and local array management
  // Remove local loadStudents, loadTutors, loadSessions
  // Remove any local push/filter logic for students, tutors, sessions
  // Only keep UI and rendering logic, and ensure all add/update/delete operations use the imported Firestore sync functions

  // Remove these duplicate functions:
  // const loadStudents = async () => { ... }
  // const loadTutors = async () => { ... }
  // const loadSessions = async () => { ... }
  // loadStudents();
  // loadTutors();
  // loadSessions();
  // Remove any local array push/filter for students, tutors, sessions

  // All add/update/delete logic for students, tutors, sessions should use the imported Firestore sync functions only

  const form = document.getElementById("sessionForm");
 
  
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

    // Add modal close functionality
    const modal = document.getElementById('sessionModal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });

    // Function to show session details in modal
    function showSessionDetails(session) {
      const modal = document.getElementById('sessionModal');
      
      // Update modal content
      document.getElementById('modalStudent').textContent = session.student;
      document.getElementById('modalTutor').textContent = session.tutor;
      document.getElementById('modalSubject').textContent = session.subject;
      document.getElementById('modalDate').textContent = session.date;
      document.getElementById('modalTime').textContent = `${session.startTime} - ${session.endTime}`;
      document.getElementById('modalDuration').textContent = session.duration;
      document.getElementById('modalStatus').textContent = session.status;
      document.getElementById('modalPayment').textContent = session.status === 'cancelled' ? 'Not Charged' : 
                                                         session.status === 'hasn\'t occurred yet' ? 'Pending' :
                                                         (session.paid ? 'Received' : 'Not Received');
      document.getElementById('modalAmount').textContent = session.total.toFixed(2);

      // Show modal
      modal.classList.remove('hidden');
    }

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
  
    
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const student = document.getElementById("student-selection").value;
      const tutor = document.getElementById("tutor-selection").value;
      const date = document.getElementById("date").value;
      const startTime = document.getElementById("startTime").value;
      const durationRaw = document.getElementById("duration").value;
      const duration = parseFloat(durationRaw);
      const subject = document.getElementById("subject-selection").value;
      
      console.log("student:", student);
      console.log("tutor:", tutor);
      console.log("subject:", subject);
      console.log("date:", date);
      console.log("startTime:", startTime);
      console.log("durationRaw (before parse):", durationRaw);
      console.log("duration (after parse):", duration);
      console.log("isNaN(duration)?", isNaN(duration));

      if (!student || !tutor || !date || !startTime || isNaN(duration) || duration<=0 || !subject) {
        alert("Please fill out all of the requirements in the form");
        return;
      }

      const tutorObj = tutors.find((t) => t.name === tutor); 
      
      // Get rate from selected tutor
      const rate = tutorObj.rate;
      const total = duration * rate;

      // Calculate end time
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const totalMinutes = startHours * 60 + startMinutes + Math.round(duration * 60);
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  
      const session = {
        student,
        tutor,
        date,
        startTime,
        endTime,
        duration,
        rate,
        total, 
        paid: false,
        status: "hasn't occurred yet",
        subject,
      };
      
      // Add session to calendar
      if (window.calendar) {
        const event = {
          id: session.id,
          title: `${student} - ${subject} (${tutor})`,
          start: `${date}T${startTime}`,
          end: `${date}T${endTime}`,
          backgroundColor: session.status === 'cancelled' ? '#ef4444' : 
                         session.status === 'occurred' ? '#10b981' : '#3b82f6',
          borderColor: session.status === 'cancelled' ? '#ef4444' : 
                      session.status === 'occurred' ? '#10b981' : '#3b82f6'
        };
        window.calendar.addEvent(event);
      }
      
      //storing session object created in temporary array 
      sessions.push(session);

      //update UI 
      renderSession(session, document.getElementById("sessionTable"));
      updateTotals();

      // Clear form
      form.reset();
    });

    document.getElementById("sessionTable").addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const sessionId = parseInt(e.target.getAttribute("data-id"));
        const sessionToUpdate = sessions.find((s) => s.id === sessionId);
        if (sessionToUpdate.status === "occurred") {
          sessionToUpdate.paid = e.target.checked;
          const paidText = e.target.parentElement.querySelector("span");
          paidText.textContent = e.target.checked ? "Received" : "Not Received";
          updateTotals();
        }
      }
    });
    
    function updateTotals() {
      let total = 0;
      let totalReceived = 0;
      let totalNotReceived = 0;
      let totalHours = 0;

      //loop through array for summing totals 
      for(let session of sessions) {
        if (session.status === "occurred") {
          total += session.total;
          totalHours += session.duration;
          if(session.paid === true) {
            totalReceived += session.total;
          } else {
            totalNotReceived += session.total;
          }
        }
      }

      //update in the DOM
      const totalAmountEl = document.getElementById("totalAmount");
      const totalReceivedEl = document.getElementById("totalReceived");
      const totalNotReceivedEl = document.getElementById("totalNotReceived");
      const totalHoursEl = document.getElementById("totalHours");

      totalAmountEl.textContent = total.toFixed(2);
      totalReceivedEl.textContent = totalReceived.toFixed(2); 
      totalNotReceivedEl.textContent = totalNotReceived.toFixed(2);
      totalHoursEl.textContent = totalHours;
    }

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

    function createIcon(name, className) {
      const icon = document.createElement("ion-icon");
      icon.classList.add(className);
      icon.setAttribute("name", name);
      return icon
    }

    function renderStudentList() {
      // defining function that puts all of the studnets from the students array in the UI
      const listContainer = document.getElementById("student-list");
      listContainer.innerHTML = " "; 

      students.forEach( (student) => {
        const li = document.createElement("li");
        li.setAttribute("data-id", student.id);
        const studentName = document.createElement("span");
        studentName.textContent = student.name;
        studentName.classList.add("student-name");
        const studentActions = document.createElement("div");
        studentActions.classList.add("student-actions");
        const deleteIcon = createIcon("trash-outline", "deleteIcon");
        const editIcon = createIcon("create-outline", "editIcon");
        deleteIcon.addEventListener("click", (e) => {
          const idStudent = student.id;
          deleteStudent(idStudent);
          e.stopPropagation();
          console.log("You deleted "+ student.name);
        })
        editIcon.addEventListener("click", (e) => {
          let idStudent = student.id;
          e.stopPropagation();
          editStudent(idStudent);
          console.log("You edited "+ student.name);
        })
        studentActions.appendChild(deleteIcon);
        studentActions.appendChild(editIcon);
        li.appendChild(studentName);
        li.appendChild(studentActions);
        li.addEventListener("click", () => {
          let idStudent = student.id;
          showStudentDetails(idStudent);
        })
        listContainer.appendChild(li);
      });
    }

    function deleteStudent(idStudent) {
      deleteStudent(idStudent);
      renderStudentList();
      updateDropDown();   
    }
    const addStudentButton = document.getElementById("addStudentBtn");
    const addStudentForm = document.getElementById("newStudentForm");
    const addStudentContainer = document.getElementById("add-student-form")
    const studentListContainer = document.getElementById("student-list");
    const cancelBtn = document.getElementById("cancelAddStudent");

    addStudentButton.addEventListener("click",()=>{
      studentListContainer.classList.add("hidden");
      addStudentContainer.classList.remove("hidden");
      addStudentButton.style.display = "none";
    })

    cancelBtn.addEventListener("click",()=>{
      addStudentContainer.classList.add("hidden");        
      studentListContainer.classList.remove("hidden");
      addStudentButton.style.display = "block";
    })    

    addStudentContainer.addEventListener("submit", async (e) => {
      e.preventDefault()
      const name = document.getElementById("nameAdd").value;
      const parent = document.getElementById("parentAdd").value;
      const contact = document.getElementById("contactAdd").value;
      const notes = document.getElementById("notesAdd").value;

      if(!name || !parent || !contact || !notes) {
        alert("Please fill in all of the requirements in the form");
        return
      }
      //change Id generation later
      const student = { name, parent, contact, notes };
      await addStudent(student);
      console.log("You added "+ name);

      renderStudentList();
      updateDropDown();

      //reset and hide form
      addStudentForm.reset();     
      addStudentContainer.classList.add("hidden");
      studentListContainer.classList.remove("hidden");
      addStudentButton.style.display = "block";
  })
    
    const cancelEditStudent = document.getElementById("cancelEditStudent");
    const editStudentForm = document.getElementById("editStudentForm");
    const editStudentContainer = document.getElementById("edit-student-form")


    function editStudent(idStudent) {
      const studentToEdit = students.find((s) => s.id === idStudent);
      studentListContainer.classList.add("hidden");
      editStudentContainer.classList.remove("hidden");
      addStudentButton.style.display = "none";

      // put all of the previous details pre filled
      const name = document.getElementById("nameEdit");
      const parent = document.getElementById("parentEdit");
      const contact = document.getElementById("contactEdit");
      const notes = document.getElementById("notesEdit");

      name.value = studentToEdit.name;
      parent.value = studentToEdit.parent;
      contact.value = studentToEdit.contact;
      notes.value = studentToEdit.notes;

      editStudentForm.addEventListener("submit", (e) => {
        updateStudent(studentToEdit)
        e.preventDefault();
      })
    }

    function updateStudent(studentToEdit) {
      const name = document.getElementById("nameEdit").value;
      const parent = document.getElementById("parentEdit").value;
      const contact = document.getElementById("contactEdit").value;
      const notes = document.getElementById("notesEdit").value;
      const updated = { name, parent, contact, notes };
      updateStudent(studentToEdit.id, updated);
      updateDropDown();
      renderStudentList();
      editStudentForm.reset();     
      editStudentContainer.classList.add("hidden");
      studentListContainer.classList.remove("hidden");
      addStudentButton.style.display = "block";
    }

    cancelEditStudent.addEventListener("click", () => {
      editStudentContainer.classList.add("hidden");        
      studentListContainer.classList.remove("hidden");
      addStudentButton.style.display = "block";
    }) 
    
    function updateDropDown() {
    const studentSelection = document.getElementById("student-selection");
    studentSelection.innerHTML = `<option value="">Select Student</option>`;
    students.forEach((s) => {
      const option = document.createElement("option");
      option.setAttribute("value", s.name);
      option.textContent = s.name;
      studentSelection.appendChild(option);
    });
    }
    function showStudentDetails(idStudent) {
      const view = document.getElementById("student-details");
      view.innerHTML = " ";
      const studentToViewDetails = students.find((s) => s.id === idStudent);
      if (!(sessions.find((session) => session.student === studentToViewDetails.name))) {
        view.innerHTML = `
          <h3>${studentToViewDetails.name}'s Details</h3>
          <br></br>
          <p><strong>Parent:</strong> ${studentToViewDetails.parent}</p>
          <p><strong>Contact:</strong> ${studentToViewDetails.contact}</p>
          <p><strong>Notes:</strong> ${studentToViewDetails.notes}</p>
          <br></br>
          <button id="back-to-students">Back to Students List</button>
          <br></br>

          <div class="section">
            <h3>${studentToViewDetails.name}´s sessions</h3>
            <br></br>
            <p>No sessions found!</p>
          </div>
        `;
      } else {
        view.innerHTML = `
          <h3>${studentToViewDetails.name}'s Details</h3>
          <br></br>
          <p><strong>Parent:</strong> ${studentToViewDetails.parent}</p>
          <p><strong>Contact:</strong> ${studentToViewDetails.contact}</p>
          <p><strong>Notes:</strong> ${studentToViewDetails.notes}</p>
          <button id="back-to-students">Back to Students List</button>
          <br></br>

          <div class="section">
            <h3>${studentToViewDetails.name}´s sessions</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Subject</th>
                  <th>Duration (hours)</th>
                  <th>Payment Status</th>
                  <th>Status</th>
                  <th>Total ($)</th>
                </tr>
              </thead>
              <tbody id="sessionTable${studentToViewDetails.name}">
                <!-- JS will populate rows here -->
              </tbody>
            </table>

            <div class="summary">
              <p><strong>Total Hours:</strong> <span id="totalHours${studentToViewDetails.name}">0</span></p>
              <div id="totals">
                <p><strong>Total Amount:</strong> $<span id="totalAmount${studentToViewDetails.name}">0.00</span></p>
                <p><strong>Received Amount:</strong> $<span id="totalReceived${studentToViewDetails.name}">0.00</span></p>
                <p><strong>Not Received Amount:</strong> $<span id="totalNotReceived${studentToViewDetails.name}">0.00</span></p>
              </div>
            </div>
          </div>
        `;

        // Initialize totals for this student
        let studentTotal = 0;
        let studentReceived = 0;
        let studentNotReceived = 0;
        let studentHours = 0;

        // Render each session and calculate totals
        const tableElement = document.getElementById(`sessionTable${studentToViewDetails.name}`);
        sessions.forEach((session) => {
          if (session.student === studentToViewDetails.name) {
            if (session.status === "occurred") {
              studentTotal += session.total;
              studentHours += session.duration;
              if (session.paid) {
                studentReceived += session.total;
              } else {
                studentNotReceived += session.total;
              }
            }
            renderSession(session, tableElement);
          }
        });

        // Update student's summary totals
        document.getElementById(`totalHours${studentToViewDetails.name}`).textContent = studentHours;
        document.getElementById(`totalAmount${studentToViewDetails.name}`).textContent = studentTotal.toFixed(2);
        document.getElementById(`totalReceived${studentToViewDetails.name}`).textContent = studentReceived.toFixed(2);
        document.getElementById(`totalNotReceived${studentToViewDetails.name}`).textContent = studentNotReceived.toFixed(2);
      }

      showView("student-details");
      document.getElementById("back-to-students").addEventListener("click", () => {
        showView("students-view");
      });
    }

    function renderStudentSessions(studentName) {
      const tableElement = document.getElementById(`sessionTable${studentName}`);
      tableElement.innerHTML = ''; // Clear existing content
      
      sessions.forEach((session) => {
        if(session.student === studentName) {
          renderSession(session, tableElement);
        }
      });
    }

    
    

    function updateDropDown() {
      // Update both student and tutor dropdowns
      const studentSelection = document.getElementById("student-selection");
      const tutorSelection = document.getElementById("tutor-selection");
      
      // Update student dropdown
      studentSelection.innerHTML = `<option value="">Select Student</option>`;
      students.forEach((s) => {
        const option = document.createElement("option");
        option.setAttribute("value", s.name);
        option.textContent = s.name;
        studentSelection.appendChild(option);
      });

      // Update tutor dropdown
      tutorSelection.innerHTML = `<option value="">Select Tutor</option>`;
      tutors.forEach((t) => {
        const option = document.createElement("option");
        option.setAttribute("value", t.name);
        option.textContent = t.name;
        tutorSelection.appendChild(option);
      });
    }

    

      showView("tutor-details");
      document.getElementById("back-to-tutors").addEventListener("click", () => {
        showView("tutors-view");
      });
    }

    function renderTutorSessions(tutorName) {
      const tableElement = document.getElementById(`sessionTable${tutorName}`);
      tableElement.innerHTML = ''; // Clear existing content
      
      sessions.forEach((session) => {
        if(session.tutor === tutorName) {
          renderSession(session, tableElement);
        }
      });
    }

    function renderSubjectSelection() {
      const tutorSelect = document.getElementById("tutor-selection");
      const subjectSelect = document.getElementById("subject-selection");

      // Initial state - clear and disable subject selection
      subjectSelect.innerHTML = '<option value="">Select Subject</option>';
      subjectSelect.disabled = true;

      // Add event listener to tutor selection
      tutorSelect.addEventListener("change", () => {
        const selectedTutor = tutorSelect.value;
        
        if (!selectedTutor) {
          // If no tutor is selected, clear and disable subject selection
          subjectSelect.innerHTML = '<option value="">Select Subject</option>';
          subjectSelect.disabled = true;
          return;
        }

        // Find the selected tutor's subjects
        const tutor = tutors.find(t => t.name === selectedTutor);
        if (!tutor || !tutor.subjects || tutor.subjects.length === 0) {
          subjectSelect.innerHTML = '<option value="">No subjects available</option>';
          subjectSelect.disabled = true;
          return;
        }

        // Enable subject selection and populate with tutor's subjects
        subjectSelect.disabled = false;
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        tutor.subjects.forEach(subject => {
          const option = document.createElement("option");
          option.value = subject;
          option.textContent = subject.charAt(0).toUpperCase() + subject.slice(1); // Capitalize first letter
          subjectSelect.appendChild(option);
        });
      });
    }

    function renderSession(session, tableElement) {
      //creating new row
      const newTableRow = document.createElement("tr");
      
      // putting data column with double-click functionality
      const dateUI = document.createElement("td");
      dateUI.textContent = session.date;
      dateUI.classList.add("editable-time");
      dateUI.addEventListener("dblclick", () => {
        const input = document.createElement("input");
        input.type = "date";
        input.value = session.date;
        input.classList.add("time-edit-input");
        
        input.addEventListener("blur", () => {
          const newDate = input.value;
          if (newDate && newDate !== session.date) {
            session.date = newDate;
            dateUI.textContent = session.date;

            // Update calendar event
            if (window.calendar) {
              const event = window.calendar.getEventById(session.id);
              if (event) {
                event.setStart(`${session.date}T${session.startTime}`);
                event.setEnd(`${session.date}T${session.endTime}`);
              }
            }
          } else {
            dateUI.textContent = session.date;
          }
        });
        
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            input.blur();
          }
        });
        
        dateUI.textContent = "";
        dateUI.appendChild(input);
        input.focus();
      });
      newTableRow.appendChild(dateUI);

      // adding start time column with double-click functionality
      const startTimeUI = document.createElement("td");
      startTimeUI.textContent = session.startTime;
      startTimeUI.classList.add("editable-time");
      startTimeUI.addEventListener("dblclick", () => {
        const input = document.createElement("input");
        input.type = "time";
        input.value = session.startTime;
        input.classList.add("time-edit-input");
        
        input.addEventListener("blur", () => {
          const newStartTime = input.value;
          if (newStartTime && newStartTime !== session.startTime) {
            session.startTime = newStartTime;
            
            // Recalculate end time
            const [startHours, startMinutes] = newStartTime.split(':').map(Number);
            const totalMinutes = startHours * 60 + startMinutes + Math.round(session.duration * 60);
            const endHours = Math.floor(totalMinutes / 60);
            const endMinutes = totalMinutes % 60;
            session.endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
            
            // Update the display
            startTimeUI.textContent = session.startTime;
            endTimeUI.textContent = session.endTime;

            // Update calendar event
            if (window.calendar) {
              const event = window.calendar.getEventById(session.id);
              if (event) {
                event.setStart(`${session.date}T${session.startTime}`);
                event.setEnd(`${session.date}T${session.endTime}`);
              }
            }

            // Update totals
            updateTotals();
          } else {
            startTimeUI.textContent = session.startTime;
          }
        });
        
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            input.blur();
          }
        });
        
        startTimeUI.textContent = "";
        startTimeUI.appendChild(input);
        input.focus();
      });
      newTableRow.appendChild(startTimeUI);

      // adding end time column
      const endTimeUI = document.createElement("td");
      endTimeUI.textContent = session.endTime;
      newTableRow.appendChild(endTimeUI);

      // adding student column with double-click functionality
      const studentUI = document.createElement("td");
      studentUI.textContent = session.student;
      studentUI.classList.add("editable-time");
      studentUI.addEventListener("dblclick", () => {
        const select = document.createElement("select");
        select.classList.add("time-edit-input");
        
        // Add all students as options
        students.forEach(student => {
          const option = document.createElement("option");
          option.value = student.name;
          option.textContent = student.name;
          if (student.name === session.student) {
            option.selected = true;
          }
          select.appendChild(option);
        });
        
        select.addEventListener("blur", () => {
          const newStudent = select.value;
          if (newStudent && newStudent !== session.student) {
            session.student = newStudent;
            studentUI.textContent = session.student;

            // Update calendar event title
            if (window.calendar) {
              const event = window.calendar.getEventById(session.id);
              if (event) {
                event.setProp('title', `${session.student} - ${session.subject} (${session.tutor})`);
              }
            }
          } else {
            studentUI.textContent = session.student;
          }
        });
        
        select.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            select.blur();
          }
        });
        
        studentUI.textContent = "";
        studentUI.appendChild(select);
        select.focus();
      });
      newTableRow.appendChild(studentUI);

      // adding tutor column with double-click functionality
      const tutorUI = document.createElement("td");
      tutorUI.textContent = session.tutor;
      tutorUI.classList.add("editable-time");
      tutorUI.addEventListener("dblclick", () => {
        const select = document.createElement("select");
        select.classList.add("time-edit-input");
        
        // Add all tutors as options
        tutors.forEach(tutor => {
          const option = document.createElement("option");
          option.value = tutor.name;
          option.textContent = tutor.name;
          if (tutor.name === session.tutor) {
            option.selected = true;
          }
          select.appendChild(option);
        });
        
        select.addEventListener("blur", () => {
          const newTutor = select.value;
          if (newTutor && newTutor !== session.tutor) {
            const oldTutor = session.tutor;
            session.tutor = newTutor;
            tutorUI.textContent = session.tutor;

            // Update rate and total
            const tutorObj = tutors.find(t => t.name === newTutor);
            if (tutorObj) {
              session.rate = tutorObj.rate;
              session.total = session.duration * tutorObj.rate;
              totalUI.textContent = session.total.toFixed(2);
            }

            // Update calendar event title
            if (window.calendar) {
              const event = window.calendar.getEventById(session.id);
              if (event) {
                event.setProp('title', `${session.student} - ${session.subject} (${session.tutor})`);
              }
            }

            // Update subject if needed
            const tutorSubjects = tutorObj.subjects || [];
            if (!tutorSubjects.includes(session.subject)) {
              session.subject = tutorSubjects[0] || '';
              subjectUI.textContent = session.subject;
            }

            updateTotals();
          } else {
            tutorUI.textContent = session.tutor;
          }
        });
        
        select.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            select.blur();
          }
        });
        
        tutorUI.textContent = "";
        tutorUI.appendChild(select);
        select.focus();
      });
      newTableRow.appendChild(tutorUI);

      // adding subject column with double-click functionality
      const subjectUI = document.createElement("td");
      subjectUI.textContent = session.subject;
      subjectUI.classList.add("editable-time");
      subjectUI.addEventListener("dblclick", () => {
        const select = document.createElement("select");
        select.classList.add("time-edit-input");
        
        // Get current tutor's subjects
        const tutorObj = tutors.find(t => t.name === session.tutor);
        if (tutorObj && tutorObj.subjects) {
          tutorObj.subjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject;
            option.textContent = subject;
            if (subject === session.subject) {
              option.selected = true;
            }
            select.appendChild(option);
          });
        }
        
        select.addEventListener("blur", () => {
          const newSubject = select.value;
          if (newSubject && newSubject !== session.subject) {
            session.subject = newSubject;
            subjectUI.textContent = session.subject;

            // Update calendar event title
            if (window.calendar) {
              const event = window.calendar.getEventById(session.id);
              if (event) {
                event.setProp('title', `${session.student} - ${session.subject} (${session.tutor})`);
              }
            }
          } else {
            subjectUI.textContent = session.subject;
          }
        });
        
        select.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            select.blur();
          }
        });
        
        subjectUI.textContent = "";
        subjectUI.appendChild(select);
        select.focus();
      });
      newTableRow.appendChild(subjectUI);

      //adding duration column
      const durationUI = document.createElement("td");
      durationUI.textContent = session.duration;
      durationUI.classList.add("editable-time");
      durationUI.addEventListener("dblclick", () => {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "0.25";
        input.value = session.duration;
        input.classList.add("time-edit-input");
        
        input.addEventListener("blur", () => {
          const newDuration = parseFloat(input.value);
          if (!isNaN(newDuration) && newDuration > 0 && newDuration !== session.duration) {
            session.duration = newDuration;
            
            // Recalculate end time
            const [startHours, startMinutes] = session.startTime.split(':').map(Number);
            const totalMinutes = startHours * 60 + startMinutes + Math.round(session.duration * 60);
            const endHours = Math.floor(totalMinutes / 60);
            const endMinutes = totalMinutes % 60;
            session.endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
            
            // Update the display
            durationUI.textContent = session.duration;
            endTimeUI.textContent = session.endTime;

            // Update calendar event
            if (window.calendar) {
              const event = window.calendar.getEventById(session.id);
              if (event) {
                event.setEnd(`${session.date}T${session.endTime}`);
              }
            }

            // Update totals
            updateTotals();
          } else {
            durationUI.textContent = session.duration;
          }
        });
        
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            input.blur();
          }
        });
        
        durationUI.textContent = "";
        durationUI.appendChild(input);
        input.focus();
      });
      newTableRow.appendChild(durationUI);

      //adding paid column text and checkbox
      const paidUI = document.createElement("td");

      // paid text
      const paidText = document.createElement("span");
      paidText.textContent = session.status === "cancelled" ? "Not Charged" : 
                            session.status === "hasn't occurred yet" ? "Pending" :
                            (session.paid ? "Received" : "Not Received");
      paidText.style.margin = "10px"; 

      //paid checkbox
      paidUI.appendChild(paidText);
      const paidCheckbox = document.createElement("input");
      paidCheckbox.type = "checkbox";
      paidCheckbox.classList.add("sessionTable");
      paidCheckbox.checked = session.paid;
      paidCheckbox.disabled = session.status !== "occurred";
      paidCheckbox.setAttribute("data-id", session.id);
      paidUI.appendChild(paidCheckbox);
      newTableRow.appendChild(paidUI);

      //making total column (money made in that specific session)
      const totalUI = document.createElement("td");
      totalUI.textContent = session.total;

      // Create status select
      const statusCell = createStatusSelect(session, totalUI, paidText, paidCheckbox);
      newTableRow.appendChild(statusCell);

      newTableRow.appendChild(totalUI);
      tableElement.appendChild(newTableRow);
    }

    function createStatusSelect(session, totalCell, paidText, paidCheckbox) {
      const statusCell = document.createElement("td");
      const statusSelect = document.createElement("select");
      statusSelect.classList.add("status-select");
      
      const options = ["hasn't occurred yet", "occurred", "cancelled"];
      options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        if (session.status === option) {
          optionElement.selected = true;
        }
        statusSelect.appendChild(optionElement);
      });

      statusSelect.addEventListener("change", (e) => {
        session.status = e.target.value;
        if (session.status === "cancelled") {
          session.paid = false;
          session.originalTotal = session.total; // Store original total
          session.total = 0;
          totalCell.textContent = "0";
          paidText.textContent = "Not Charged";
          paidCheckbox.checked = false;
          paidCheckbox.disabled = true;
        } else if (session.status === "hasn't occurred yet") {
          if (session.hasOwnProperty('originalTotal')) {
            session.total = session.originalTotal; // Restore original total
            totalCell.textContent = session.total;
            delete session.originalTotal;
          }
          session.paid = false;
          paidText.textContent = "Pending";
          paidCheckbox.checked = false;
          paidCheckbox.disabled = true;
        } else { // occurred
          if (session.hasOwnProperty('originalTotal')) {
            session.total = session.originalTotal; // Restore original total
            totalCell.textContent = session.total;
            delete session.originalTotal;
          }
          paidText.textContent = session.paid ? "Received" : "Not Received";
          paidCheckbox.disabled = false;
        }
        updateTotals();
        updateCalendarEvent(session); // Update calendar when status changes
      });

      statusCell.appendChild(statusSelect);
      return statusCell;
    }

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
  });
  
  