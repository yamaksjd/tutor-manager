window.addEventListener("load", () => {
    const form = document.getElementById("sessionForm");
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
      rate: 20
    },
    {
      id: 1,
      name: "John",
      contact: "john.watson@example.com",
      notes: "prefers to teach physics",
      rate: 25
    },
    {
      id: 1,
      name: "Lina",
      contact: "lina.james@example.com",
      notes: "prefers to teach biology",
      rate: 18
    },]
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
    // Define tutor rates - change later 
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const student = document.getElementById("student-selection").value;
      const tutor = document.getElementById("tutor-selection").value;
      const date = document.getElementById("date").value;
      const durationRaw = document.getElementById("duration").value
      const duration = parseFloat(durationRaw);
      
      console.log("student:", student);
      console.log("tutor:", tutor);
      console.log("date:", date);
      console.log("durationRaw (before parse):", durationRaw);
      console.log("duration (after parse):", duration);
      console.log("isNaN(duration)?", isNaN(duration));

      if (!student || !tutor || !date || isNaN(duration) || duration<=0) {
        alert("Please fill out all of the requirements in the form");
        return;
      }

      const tutorObj = tutors.find((t) => t.name === tutor); 
      
      // Get rate from selected tutor
      const rate = tutorObj.rate;
      const total = duration * rate;
  
      const session = {
        id: Date.now(),
        student,
        tutor,
        date,
        duration,
        rate,
        total, 
        paid: false
      };
      
      //storing session object created in temporary array 
      sessions.push(session);

      //update UI 

      const sessionsTable = document.getElementById("sessionTable") 
      //creating new row
      const newTableRow = document.createElement("tr");

      // putting data column
      const dateUI = document.createElement("td");
      dateUI.textContent = session.date;
      newTableRow.appendChild(dateUI)

      // adding student column
      const studentUI = document.createElement("td");
      studentUI.textContent = session.student;
      newTableRow.appendChild(studentUI)

      //adding tutor column
      const tutorUI = document.createElement("td");
      tutorUI.textContent = session.tutor;
      newTableRow.appendChild(tutorUI)

      //adding duration column
      const durationUI = document.createElement("td");
      durationUI.textContent = session.duration;
      newTableRow.appendChild(durationUI)

      //adding paid column text and checkbox
      const paidUI = document.createElement("td");

      // paid text
      const paidText = document.createElement("span");
      paidText.textContent = session.paid ? "Received" : "Not Received";
      paidText.style.margin = "10px"; 

      //paid checkbox
      paidUI.appendChild(paidText);
      const paidCheckbox = document.createElement("input");
      paidCheckbox.type = "checkbox";
      paidCheckbox.classList.add("sessionTable");

      //setting checkbox state based on session object (false by default)
      paidCheckbox.checked = session.paid;
      paidCheckbox.setAttribute("data-id",session.id);
      paidUI.appendChild(paidCheckbox);
      newTableRow.appendChild(paidUI);

      //making total column (money made in that specific session)
      const totalUI = document.createElement("td");
      totalUI.textContent = session.total;
      newTableRow.appendChild(totalUI);
      sessionsTable.appendChild(newTableRow);

      // update total Amount and Hours

      const totalAmountEl = document.getElementById("totalAmount");
      const currentAmount = parseFloat(totalAmountEl.textContent);
      totalAmountEl.textContent = (currentAmount + session.total).toFixed(2); 
      const totalHours = document.getElementById("totalHours");
      const currentHours = parseFloat(totalHours.textContent);
      totalHours.textContent = (currentHours + session.duration);

      // update total received

      const totalReceivedEl = document.getElementById("totalReceived");
      const receivedcurrentAmount = parseFloat(totalReceivedEl.textContent);
      if(session.paid === true) {
        totalReceivedEl.textContent = (receivedcurrentAmount + session.total).toFixed(2); 
      }

      // update total not received

      const totalNotReceivedEl = document.getElementById("totalNotReceived");
      const notReceivedCurrentAmount = parseFloat(totalNotReceivedEl.textContent);
      if(session.paid === false) {
        totalNotReceivedEl.textContent = (notReceivedCurrentAmount + session.total).toFixed(2); 
      }

    });

    document.getElementById("sessionTable").addEventListener("change", (e) => {
      e.preventDefault();
      if (e.target.type === "checkbox") {
        const sessionId = parseInt(e.target.getAttribute("data-id"));
        const sessionToUpdate = sessions.find((s) => s.id === sessionId);
        sessionToUpdate.paid = e.target.checked;
        const paidText2 = e.target.parentElement.querySelector("span");
        paidText2.textContent = e.target.checked ? "Received" : "Not Received";

        updateTotals();
      }
    });
    
    function updateTotals() {
      // define current values
      let total = 0;
      let totalReceived = 0;
      let totalNotReceived = 0;

      //loop through array for summing totals 
      for(i=0; i<sessions.length; i++) {
        total += sessions[i].total;
        if(sessions[i].paid === true) {
          totalReceived += sessions[i].total;
        } else {
          totalNotReceived += sessions[i].total;
        }

        //update in the DOM
        const totalAmountEl = document.getElementById("totalAmount");
        const totalReceivedEl = document.getElementById("totalReceived");
        const totalNotReceivedEl = document.getElementById("totalNotReceived");

        totalAmountEl.textContent = (total).toFixed(2);
        totalReceivedEl.textContent = (totalReceived).toFixed(2); 
        totalNotReceivedEl.textContent = (totalNotReceived).toFixed(2); 

      }
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
        const studentsArea = document.createElement("div");
        const studentName = document.createElement("span");
        studentName.textContent = student.name;
        studentName.classList.add("student-name");
        const studentActions = document.createElement("div");
        studentActions.classList.add("student-actions");
        const deleteIcon = createIcon("trash-outline", "deleteIcon");
        const editIcon = createIcon("create-outline", "editIcon");
        deleteIcon.addEventListener("click", (e) => {
          let idStudent = student.id;
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
      const view = document.getElementById("student-details")
      view.innerHTML = " "
      const studnetToViewDetails = students.find((s) => s.id === idStudent);
      if (!(sessions.find((session) => session.student === studnetToViewDetails.name))) {
        view.innerHTML = `
          <h3>${studnetToViewDetails.name}'s Details</h3>
          <br></br>
          <p><strong>Parent:</strong>   ${studnetToViewDetails.parent}</p>
          <p><strong>Contact:</strong>   ${studnetToViewDetails.contact}</p>
          <p><strong>Notes:</strong>   ${studnetToViewDetails.notes}</p>
          <br></br>
          <button id="back-to-students">Back to Students List</button>
          <br></br>

          <div class="section">
            <h3>${studnetToViewDetails.name}´s sessions</h3>
            <br></br>
            <p>No sessions found!</p>
          </div>
      `
      } else {
        view.innerHTML = `
          <h3>${studnetToViewDetails.name}'s Details</h3>
          <br></br>
          <p><strong>Parent:</strong>   ${studnetToViewDetails.parent}</p>
          <p><strong>Contact:</strong>   ${studnetToViewDetails.contact}</p>
          <p><strong>Notes:</strong>   ${studnetToViewDetails.notes}</p>
          <button id="back-to-students">Back to Students List</button>
          <br></br>

          <div class="section">
          <h3>${studnetToViewDetails.name}´s sessions</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Tutor</th>
                <th>Duration (hours)</th>
                <th>Payment Status</th>
                <th>Total ($)</th>
              </tr>
            </thead>
            <tbody id="sessionTable${studnetToViewDetails.name}">
              <!-- JS will populate rows here -->
            </tbody>
          </table>

          <div class="summary">
            <p><strong>Total Hours:</strong> <span id="totalHours${studnetToViewDetails.name}">0</span></p>
            <div id="totals">
              <p><strong>Total Amount:</strong> $<span id="totalAmount${studnetToViewDetails.name}">0.00</span></p>
              <p><strong>Received Amount:</strong> $<span id="totalReceived${studnetToViewDetails.name}">0.00</span></p>
              <p><strong>Not Received Amount:</strong> $<span id="totalNotReceived${studnetToViewDetails.name}">0.00</span></p>
            </div>
          </div>
        </div>
      </div>
      `
      studentName = studnetToViewDetails.name;
      renderStudentSessions(studentName);
      }

      showView("student-details")
      document.getElementById("back-to-students").addEventListener("click", () => {
        showView("students-view");
      });
    }
      function renderStudentSessions(studentName) {
        sessions.forEach((session) => {
          if(session.student === studentName) {
      
            const sessionsTable = document.getElementById(`sessionTable${studentName}`) 
            //creating new row
            const newTableRow = document.createElement("tr");

            // putting data column
            const dateUI = document.createElement("td");
            dateUI.textContent = session.date;
            newTableRow.appendChild(dateUI)

            // adding student column
            const studentUI = document.createElement("td");
            studentUI.textContent = session.student;
            newTableRow.appendChild(studentUI)

            //adding tutor column
            const tutorUI = document.createElement("td");
            tutorUI.textContent = session.tutor;
            newTableRow.appendChild(tutorUI)

            //adding duration column
            const durationUI = document.createElement("td");
            durationUI.textContent = session.duration;
            newTableRow.appendChild(durationUI)

            //adding paid column text and checkbox
            const paidUI = document.createElement("td");

            // paid text
            const paidText = document.createElement("span");
            paidText.textContent = session.paid ? "Received" : "Not Received";
            paidText.style.margin = "10px"; 

            //paid checkbox
            paidUI.appendChild(paidText);
            const paidCheckbox = document.createElement("input");
            paidCheckbox.type = "checkbox";

            //setting checkbox state based on session object (false by default)
            paidCheckbox.checked = session.paid;
            paidCheckbox.classList.add("copiedSessionTable")
            paidCheckbox.setAttribute("data-id",session.id);
            paidCheckbox.disabled = true;
            paidUI.appendChild(paidCheckbox);
            newTableRow.appendChild(paidUI);

            //making total column (money made in that specific session)
            const totalUI = document.createElement("td");
            totalUI.textContent = session.total;
            newTableRow.appendChild(totalUI);
            sessionsTable.appendChild(newTableRow);

            // update total Amount and Hours

            const totalAmountEl = document.getElementById(`totalAmount${studentName}`);
            const currentAmount = parseFloat(totalAmountEl.textContent);
            totalAmountEl.textContent = (currentAmount + session.total).toFixed(2); 
            const totalHours = document.getElementById(`totalHours${studentName}`);
            const currentHours = parseFloat(totalHours.textContent);
            totalHours.textContent = (currentHours + session.duration);

            // update total received

            const totalReceivedEl = document.getElementById(`totalReceived${studentName}`);
            const receivedcurrentAmount = parseFloat(totalReceivedEl.textContent);
            if(session.paid === true) {
              totalReceivedEl.textContent = (receivedcurrentAmount + session.total).toFixed(2); 
            }

            // update total not received

            const totalNotReceivedEl = document.getElementById("totalNotReceived");
            const notReceivedCurrentAmount = parseFloat(totalNotReceivedEl.textContent);
            if(session.paid === false) {
              totalNotReceivedEl.textContent = (notReceivedCurrentAmount + session.total).toFixed(2); 
            }
          }
          })
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
          let idTutor = tutor.id;
          deleteTutor(idTutor);
          e.stopPropagation();
          console.log("You deleted "+ tutor.name);
        });
        
        editIcon.addEventListener("click", (e) => {
          let idTutor = tutor.id;
          e.stopPropagation();
          editTutor(idTutor);
          console.log("You edited "+ tutor.name);
        });
        
        tutorActions.appendChild(deleteIcon);
        tutorActions.appendChild(editIcon);
        li.appendChild(tutorName);
        li.appendChild(tutorActions);
        li.addEventListener("click", () => {
          let idTutor = tutor.id;
          showTutorDetails(idTutor);
        });
        listContainer.appendChild(li);
      });
    }

    function deleteTutor(idTutor) {
      tutors = tutors.filter((t) => t.id !== idTutor);
      renderTutorList();
      updateDropDown();   
    }

    function editTutor(idTutor) {
      const tutorToEdit = tutors.find((t) => t.id === idTutor);
      const tutorListContainer = document.getElementById("tutor-list");
      const editTutorContainer = document.getElementById("edit-tutor-form");

      tutorListContainer.classList.add("hidden");
      editTutorContainer.classList.remove("hidden");

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

      const editTutorForm = document.getElementById("editTutorForm");
      const editTutorContainer = document.getElementById("edit-tutor-form");
      const tutorListContainer = document.getElementById("tutor-list");

      renderTutorList();
      updateDropDown();
      editTutorForm.reset();     
      editTutorContainer.classList.add("hidden");
      tutorListContainer.classList.remove("hidden");
    }

    document.getElementById("cancelEditTutor").addEventListener("click", () => {
      const editTutorContainer = document.getElementById("edit-tutor-form");        
      const tutorListContainer = document.getElementById("tutor-list");
      editTutorContainer.classList.add("hidden");        
      tutorListContainer.classList.remove("hidden");
    });

    function showTutorDetails(idTutor) {
      const view = document.getElementById("tutor-details");
      view.innerHTML = "";
      const tutorToViewDetails = tutors.find((t) => t.id === idTutor);
      
      // Check if tutor has any sessions
      const tutorSessions = sessions.filter((session) => session.tutor === tutorToViewDetails.name);
      
      if (tutorSessions.length === 0) {
        view.innerHTML = `
          <h3>${tutorToViewDetails.name}'s Details</h3>
          <br></br>
          <p><strong>Contact:</strong> ${tutorToViewDetails.contact}</p>
          <p><strong>Rate:</strong> $${tutorToViewDetails.rate}/hr</p>
          <p><strong>Notes:</strong> ${tutorToViewDetails.notes}</p>
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
          <button id="back-to-tutors">Back to Tutors List</button>
          <br></br>

          <div class="section">
            <h3>${tutorToViewDetails.name}´s sessions</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Duration (hours)</th>
                  <th>Payment Status</th>
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
        renderTutorSessions(tutorToViewDetails.name);
      }

      showView("tutor-details");
      document.getElementById("back-to-tutors").addEventListener("click", () => {
        showView("tutors-view");
      });
    }

    function renderTutorSessions(tutorName) {
      sessions.forEach((session) => {
        if(session.tutor === tutorName) {
          const sessionsTable = document.getElementById(`sessionTable${tutorName}`);
          //creating new row
          const newTableRow = document.createElement("tr");

          // putting data column
          const dateUI = document.createElement("td");
          dateUI.textContent = session.date;
          newTableRow.appendChild(dateUI);

          // adding student column
          const studentUI = document.createElement("td");
          studentUI.textContent = session.student;
          newTableRow.appendChild(studentUI);

          //adding duration column
          const durationUI = document.createElement("td");
          durationUI.textContent = session.duration;
          newTableRow.appendChild(durationUI);

          //adding paid column text and checkbox
          const paidUI = document.createElement("td");

          // paid text
          const paidText = document.createElement("span");
          paidText.textContent = session.paid ? "Received" : "Not Received";
          paidText.style.margin = "10px"; 

          //paid checkbox
          paidUI.appendChild(paidText);
          const paidCheckbox = document.createElement("input");
          paidCheckbox.type = "checkbox";
          paidCheckbox.classList.add("copiedSessionTable");
          paidCheckbox.checked = session.paid;
          paidCheckbox.setAttribute("data-id", session.id);
          paidCheckbox.disabled = true;
          paidUI.appendChild(paidCheckbox);
          newTableRow.appendChild(paidUI);

          //making total column (money made in that specific session)
          const totalUI = document.createElement("td");
          totalUI.textContent = session.total;
          newTableRow.appendChild(totalUI);
          sessionsTable.appendChild(newTableRow);

          // update total Amount and Hours
          const totalAmountEl = document.getElementById(`totalAmount${tutorName}`);
          const currentAmount = parseFloat(totalAmountEl.textContent);
          totalAmountEl.textContent = (currentAmount + session.total).toFixed(2); 
          
          const totalHours = document.getElementById(`totalHours${tutorName}`);
          const currentHours = parseFloat(totalHours.textContent);
          totalHours.textContent = (currentHours + session.duration);

          // update total received
          const totalReceivedEl = document.getElementById(`totalReceived${tutorName}`);
          const receivedCurrentAmount = parseFloat(totalReceivedEl.textContent);
          if(session.paid === true) {
            totalReceivedEl.textContent = (receivedCurrentAmount + session.total).toFixed(2); 
          }

          // update total not received
          const totalNotReceivedEl = document.getElementById(`totalNotReceived${tutorName}`);
          const notReceivedCurrentAmount = parseFloat(totalNotReceivedEl.textContent);
          if(session.paid === false) {
            totalNotReceivedEl.textContent = (notReceivedCurrentAmount + session.total).toFixed(2); 
          }
        }
      });
    }
  });
  