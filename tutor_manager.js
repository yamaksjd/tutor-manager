window.addEventListener("load", () => {
    const form = document.getElementById("sessionForm");
    //creation of array to store sessions - change to localStorage() later
    let sessions = [];
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
    // Define tutor rates - change later 
    const tutorRates = {
      Maria: 20,
      John: 25,
      Lina: 18
    };
  
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

      
      // Get rate from selected tutor
      const rate = tutorRates[tutor];
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
    
    document.getElementById("addStudentBtn").addEventListener(() => {
      
    })
/*
    function editStudent(idStudent) {
      const studentToEdit = students.find((s) => s.id === idStudent);
      studentArea = document.getElementById(`${studentToEdit.name}area`);

    }
*/
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
  });
  