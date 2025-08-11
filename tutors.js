import { tutors, sessions } from './firestore_sync.js';
import { addTutor, updateTutor, deleteTutor } from './firestore_sync.js';
import { createIcon, updateDropDown } from './utils.js';
import { renderSession } from './sessions.js';


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
          deleteTutorFrontend(tutorId);
          e.stopPropagation();
          console.log("You deleted "+ tutor.name);
        });
        
        editIcon.addEventListener("click", (e) => {
          const tutorId = tutor.id;
          e.stopPropagation();
          editTutorFrontend(tutorId);
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


        function deleteTutorFrontend(tutorId) {
              deleteTutor(tutorId);
              renderTutorList();
              updateDropDown();   
            }
        
        function editTutorFrontend(tutorId) {
            const tutorToEdit = tutors.find((t) => t.id === tutorId);
            const tutorListContainer = document.getElementById("tutor-list");
            const editTutorContainer = document.getElementById("edit-tutor-form");
            const cancelEditTutorBtn = document.getElementById("cancelEditStudent")
    
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
            editTutorForm.onsubmit = (e) => {
            updateTutorFrontend(tutorToEdit);
            e.preventDefault();
            };

            cancelEditTutorBtn.onclick = () => {
                handleCancelEditTutor
            }
            
            function handleCancelEditTutor() {
            addTutorButton = document.getElementById("add-tutor-button");
              const editTutorContainer = document.getElementById("edit-tutor-form");
              const tutorListContainer = document.getElementById("tutor-list");
              editTutorContainer.classList.add("hidden");        
              tutorListContainer.classList.remove("hidden");
              addTutorButton.style.display = "block";
            };
        
        }
    
        function updateTutorFrontend(tutorToEdit) {
            const name = document.getElementById("tutorNameEdit").value;
            const contact = document.getElementById("tutorContactEdit").value;
            const rate = parseFloat(document.getElementById("tutorRateEdit").value);
            const notes = document.getElementById("tutorNotesEdit").value;
            const updated = { name, contact, rate, notes };
            updateTutor(tutorToEdit.id, updated);
            renderTutorList();
            updateDropDown();
            editTutorForm.reset();     
            editTutorContainer.classList.add("hidden");
            tutorListContainer.classList.remove("hidden");
            addTutorButton.style.display = "block";
        }

        
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
            }

              // Add event listeners for subject management
      
    const addSubjectBtn = document.getElementById(`add-subject-btn-${tutorToViewDetails.id}`);
      addSubjectBtn.addEventListener("click", () => {
        const newSubjectInput = document.getElementById(`new-subject-${tutorToViewDetails.id}`);

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

          export {renderTutorList, showTutorDetails, renderSubjectSelection, handleCancelEditTutor};