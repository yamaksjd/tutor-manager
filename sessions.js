  import { sessions, students, tutors} from './firestore.sync.js';
  const form = document.getElementById("sessionForm");
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
          // Add session to calendar + render it + 
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

    
    // checkbox functionality
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
    };

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
        };

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

    export { renderSession, showSessionDetails, updateTotals};
    