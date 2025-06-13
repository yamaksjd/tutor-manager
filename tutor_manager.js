window.addEventListener("load", () => {
    const form = document.getElementById("sessionForm");
    
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

    renderStudentList()
    renderTutorList()
    renderSubjectSelection()
    // Define tutor rates - change later 
  
    
    form.addEventListener("submit", (e) => {
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
        id: Date.now(),
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
      students = students.filter((s) => s.id !== idStudent);
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

    addStudentContainer.addEventListener("submit", (e) => {
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
      const id = ++idCounter
      const student = {id, name, parent, contact, notes};
      students.push(student);
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

      studentToEdit.name = name;
      studentToEdit.parent = parent;
      studentToEdit.conatact = contact;
      studentToEdit.notes = notes;

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

    function renderTutorList() {
      const listContainer = document.getElementById("tutor-list");
      listContainer.innerHTML = " ";

      tutors.forEach((tutor) => {
        const li = document.createElement("li");
        li.setAttribute("data-id", tutor.id);
        const tutorName = document.createElement("span");
        tutorName.textContent = `${tutor.name} - $${tutor.rate}/hr`;
        tutorName.classList.add("tutor-name");
        const tutorActions = document.createElement("div");
        tutorActions.classList.add("tutor-actions");
        const deleteIcon = createIcon("trash-outline", "deleteIcon");
        const editIcon = createIcon("create-outline", "editIcon");
        
        deleteIcon.addEventListener("click", (e) => {
          const tutorId = tutor.id;
          deleteTutor(tutorId);
          e.stopPropagation();
          console.log("You deleted "+ tutor.name);
        });
        
        editIcon.addEventListener("click", (e) => {
          const tutorId = tutor.id;
          e.stopPropagation();
          editTutor(tutorId);
          console.log("You edited "+ tutor.name);
        });
        
        tutorActions.appendChild(deleteIcon);
        tutorActions.appendChild(editIcon);
        li.appendChild(tutorName);
        li.appendChild(tutorActions);
        li.addEventListener("click", () => {
          const tutorId = tutor.id;
          showTutorDetails(tutorId);
        });
        listContainer.appendChild(li);
      });
    }
    // Add Tutor functionality
    const addTutorButton = document.getElementById("addTutorBtn");
    const addTutorForm = document.getElementById("newTutorForm");
    const addTutorContainer = document.getElementById("add-tutor-form");
    const tutorListContainer = document.getElementById("tutor-list");
    const cancelAddTutorBtn = document.getElementById("cancelAddTutor");

    addTutorButton.addEventListener("click", () => {
      tutorListContainer.classList.add("hidden");
      addTutorContainer.classList.remove("hidden");
      addTutorButton.style.display = "none";
    });

    cancelAddTutorBtn.addEventListener("click", () => {
      addTutorContainer.classList.add("hidden");        
      tutorListContainer.classList.remove("hidden");
      addTutorButton.style.display = "block";
    });    

    addTutorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("tutorNameAdd").value;
      const contact = document.getElementById("tutorContactAdd").value;
      const rate = parseFloat(document.getElementById("tutorRateAdd").value);
      const notes = document.getElementById("tutorNotesAdd").value;

      if(!name || !contact || isNaN(rate) || !notes) {
        alert("Please fill in all of the requirements in the form");
        return;
      }

      if(rate <= 0) {
        alert("Hourly rate must be greater than 0");
        return;
      }

      // Increment counter before using it for the new tutor
      idCounter++;
      const tutor = {
        id: idCounter,
        name,
        contact,
        rate,
        notes
      };
      tutors.push(tutor);
      console.log("You added " + name);

      renderTutorList();
      updateDropDown();

      //reset and hide form
      addTutorForm.reset();     
      addTutorContainer.classList.add("hidden");
      tutorListContainer.classList.remove("hidden");
      addTutorButton.style.display = "block";
    });

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

    function deleteTutor(tutorId) {
      tutors = tutors.filter((t) => t.id !== tutorId);
      renderTutorList();
      updateDropDown();   
    }

    function editTutor(tutorId) {
      const tutorToEdit = tutors.find((t) => t.id === tutorId);
      const tutorListContainer = document.getElementById("tutor-list");
      const editTutorContainer = document.getElementById("edit-tutor-form");

      tutorListContainer.classList.add("hidden");
      editTutorContainer.classList.remove("hidden");
      addTutorButton.style.display = "none";

      // Pre-fill the form with tutor details
      const name = document.getElementById("tutorNameEdit");
      const contact = document.getElementById("tutorContactEdit");
      const rate = document.getElementById("tutorRateEdit");
      const notes = document.getElementById("tutorNotesEdit");

      name.value = tutorToEdit.name;
      contact.value = tutorToEdit.contact;
      rate.value = tutorToEdit.rate;
      notes.value = tutorToEdit.notes;

      const editTutorForm = document.getElementById("editTutorForm");
      editTutorForm.addEventListener("submit", (e) => {
        updateTutor(tutorToEdit);
        e.preventDefault();
      });
    }

    function updateTutor(tutorToEdit) {
      const name = document.getElementById("tutorNameEdit").value;
      const contact = document.getElementById("tutorContactEdit").value;
      const rate = parseFloat(document.getElementById("tutorRateEdit").value);
      const notes = document.getElementById("tutorNotesEdit").value;

      tutorToEdit.name = name;
      tutorToEdit.contact = contact;
      tutorToEdit.rate = rate;
      tutorToEdit.notes = notes;
      tutorToEdit.subjects = selectedSubjects;

      const editTutorForm = document.getElementById("editTutorForm");
      const editTutorContainer = document.getElementById("edit-tutor-form");
      const tutorListContainer = document.getElementById("tutor-list");

      renderTutorList();
      updateDropDown();
      editTutorForm.reset();     
      editTutorContainer.classList.add("hidden");
      tutorListContainer.classList.remove("hidden");
      addTutorButton.style.display = "block";
    }

    document.getElementById("cancelEditTutor").addEventListener("click", () => {
      const editTutorContainer = document.getElementById("edit-tutor-form");        
      const tutorListContainer = document.getElementById("tutor-list");
      editTutorContainer.classList.add("hidden");        
      tutorListContainer.classList.remove("hidden");
      addTutorButton.style.display = "block";
    });

    function showTutorDetails(tutorId) {
      const view = document.getElementById("tutor-details");
      view.innerHTML = "";
      const tutorToViewDetails = tutors.find((t) => t.id === tutorId);
      
      // Check if tutor has any sessions
      const tutorSessions = sessions.filter((session) => session.tutor === tutorToViewDetails.name);
      
      const subjectsListHTML = tutorToViewDetails.subjects ? tutorToViewDetails.subjects.map(subject => 
        `<li>
          ${subject}
          <ion-icon name="close-outline" class="delete-subject" data-subject="${subject}"></ion-icon>
        </li>`
      ).join('') : '';

      if (tutorSessions.length === 0) {
        view.innerHTML = `
          <h3>${tutorToViewDetails.name}'s Details</h3>
          <br></br>
          <p><strong>Contact:</strong> ${tutorToViewDetails.contact}</p>
          <p><strong>Rate:</strong> $${tutorToViewDetails.rate}/hr</p>
          <p><strong>Notes:</strong> ${tutorToViewDetails.notes}</p>
          <div class="subjects-section">
            <h4>Subjects</h4>
            <ul id="subjects-list-${tutorToViewDetails.id}" class="subjects-list">
              ${subjectsListHTML}
            </ul>
            <div class="add-subject-form">
              <input type="text" id="new-subject-${tutorToViewDetails.id}" placeholder="Add new subject">
              <button id="add-subject-btn-${tutorToViewDetails.id}">Add Subject</button>
            </div>
          </div>
          <br></br>
          <button id="back-to-tutors">Back to Tutors List</button>
          <br></br>

          <div class="section">
            <h3>${tutorToViewDetails.name}´s sessions</h3>
            <br></br>
            <p>No sessions found!</p>
          </div>
        `;
      } else {
        view.innerHTML = `
          <h3>${tutorToViewDetails.name}'s Details</h3>
          <br></br>
          <p><strong>Contact:</strong> ${tutorToViewDetails.contact}</p>
          <p><strong>Rate:</strong> $${tutorToViewDetails.rate}/hr</p>
          <p><strong>Notes:</strong> ${tutorToViewDetails.notes}</p>
          <div class="subjects-section">
            <h4>Subjects</h4>
            <ul id="subjects-list-${tutorToViewDetails.id}" class="subjects-list">
              ${subjectsListHTML}
            </ul>
            <div class="add-subject-form">
              <input type="text" id="new-subject-${tutorToViewDetails.id}" placeholder="Add new subject">
              <button id="add-subject-btn-${tutorToViewDetails.id}">Add Subject</button>
            </div>
          </div>
          <button id="back-to-tutors">Back to Tutors List</button>
          <br></br>

          <div class="section">
            <h3>${tutorToViewDetails.name}´s sessions</h3>
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
              <tbody id="sessionTable${tutorToViewDetails.name}">
                <!-- JS will populate rows here -->
              </tbody>
            </table>

            <div class="summary">
              <p><strong>Total Hours:</strong> <span id="totalHours${tutorToViewDetails.name}">0</span></p>
              <div id="totals">
                <p><strong>Total Amount:</strong> $<span id="totalAmount${tutorToViewDetails.name}">0.00</span></p>
                <p><strong>Received Amount:</strong> $<span id="totalReceived${tutorToViewDetails.name}">0.00</span></p>
                <p><strong>Not Received Amount:</strong> $<span id="totalNotReceived${tutorToViewDetails.name}">0.00</span></p>
              </div>
            </div>
          </div>
        `;

        // Initialize totals for this tutor
        let tutorTotal = 0;
        let tutorReceived = 0;
        let tutorNotReceived = 0;
        let tutorHours = 0;

        // Render each session and calculate totals
        const tableElement = document.getElementById(`sessionTable${tutorToViewDetails.name}`);
        tutorSessions.forEach((session) => {
          if (session.status === "occurred") {
            tutorTotal += session.total;
            tutorHours += session.duration;
            if (session.paid) {
              tutorReceived += session.total;
            } else {
              tutorNotReceived += session.total;
            }
          }
          renderSession(session, tableElement);
        });

        // Update tutor's summary totals
        document.getElementById(`totalHours${tutorToViewDetails.name}`).textContent = tutorHours;
        document.getElementById(`totalAmount${tutorToViewDetails.name}`).textContent = tutorTotal.toFixed(2);
        document.getElementById(`totalReceived${tutorToViewDetails.name}`).textContent = tutorReceived.toFixed(2);
        document.getElementById(`totalNotReceived${tutorToViewDetails.name}`).textContent = tutorNotReceived.toFixed(2);
      }

      // Add event listeners for subject management
      const addSubjectBtn = document.getElementById(`add-subject-btn-${tutorToViewDetails.id}`);
      const newSubjectInput = document.getElementById(`new-subject-${tutorToViewDetails.id}`);
      
      addSubjectBtn.addEventListener("click", () => {
        const newSubject = newSubjectInput.value.trim().toLowerCase();
        if (!newSubject) {
          alert("Please enter a subject name");
          return;
        }
        
        if (!tutorToViewDetails.subjects) {
          tutorToViewDetails.subjects = [];
        }
        
        if (tutorToViewDetails.subjects.includes(newSubject)) {
          alert("This subject is already in the list");
          return;
        }
        
        tutorToViewDetails.subjects.push(newSubject);
        newSubjectInput.value = "";
        showTutorDetails(tutorId); // Refresh the view
      });

      // Add event listeners for subject deletion
      document.querySelectorAll('.delete-subject').forEach(deleteBtn => {
        deleteBtn.addEventListener("click", (e) => {
          const subjectToDelete = e.target.getAttribute('data-subject');
          tutorToViewDetails.subjects = tutorToViewDetails.subjects.filter(s => s !== subjectToDelete);
          showTutorDetails(tutorId); // Refresh the view
        });
      });

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
      
      // putting data column
      const dateUI = document.createElement("td");
      dateUI.textContent = session.date;
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

      // adding student column
      const studentUI = document.createElement("td");
      studentUI.textContent = session.student;
      newTableRow.appendChild(studentUI);

      // adding tutor column
      const tutorUI = document.createElement("td");
      tutorUI.textContent = session.tutor;
      newTableRow.appendChild(tutorUI);

      // adding subject column
      const subjectUI = document.createElement("td");
      subjectUI.textContent = session.subject;
      newTableRow.appendChild(subjectUI);

      //adding duration column
      const durationUI = document.createElement("td");
      durationUI.textContent = session.duration;
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
  