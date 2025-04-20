window.addEventListener("load", () => {
    const form = document.getElementById("sessionForm");
    //creation of array to store sessions - change to localStorage() later
    let sessions = [];

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
        totalReceivedEl.textContent = (receivedcurrentAmount + session.total).toFixed(2); 
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
      // get totals from DOM
      const totalAmountEl = document.getElementById("totalAmount");
      const totalReceivedEl = document.getElementById("totalReceived");
      const totalNotReceivedEl = document.getElementById("totalNotReceived");

      // define current values
      const total = parseFloat(totalAmountEl.textContent);
      const totalReceived = parseFloat(totalReceivedEl.textContent)
      const totalNotReceived = parseFloat(totalNotReceivedEl.textContent)

      //loop through array for summing totals 
      for(i=0; i<sessions.length; i++) {
        total += sessions[i].total;
        if(sessions[i].paid === true) {
          totalReceived += sessions[i].total;
        } else {
          totalNotReceived += sessions[i].total;
        }

        //update in the DOM
        totalAmountEl.textContent = (total).toFixed(2);
        totalReceivedEl.textContent = (totalReceived).toFixed(2); 
        totalNotReceivedEl.textContent = (totalNotReceived).toFixed(2); 

      }
    }
  });
  