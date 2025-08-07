import {students, sessions} from 'firestore_sync.js';
import{addStudent, updateStudent, deleteStudent } from 'firestore_sync.js';
import {updateDropDown, createIcon} from 'utils.js';
import {renderSession} from 'sessions.js';

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
          deleteStudentFrontend(idStudent);
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

    function deleteStudentFrontend(idStudent) {
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
        updateStudentFrontend(studentToEdit)
        e.preventDefault();
      })
    }

    function updateStudentFrontend(studentToEdit) {
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

    export { renderStudentList, deleteStudentFrontend, editStudent, showStudentDetails, renderStudentSessions };