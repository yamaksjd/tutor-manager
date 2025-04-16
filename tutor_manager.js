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
      const duration = parseFloat(document.getElementById("duration").value);
  
      if (!student || !tutor || !date || !duration) {
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
      const newTableRow = document.createElement("tr");
      const dateUI = document.createElement("td");
      dateUI.textContent = session.date;
      newTableRow.appendChild(dateUI)
      const studentUI = document.createElement("td");
      studentUI.textContent = session.student;
      newTableRow.appendChild(studentUI)
      const durationUI = document.createElement("td");
      durationUI.textContent = session.duration;
      newTableRow.appendChild(durationUI)
      const tutorUI = document.createElement("td");
      tutorUI.textContent = session.tutor;
      newTableRow.appendChild(tutorUI)
      const totalUI = document.createElement("td");
      totalUI.textContent = session.total;
      newTableRow.appendChild(totalUI)
      const paidUI = document.createElement("td");
      paidUI.textContent = session.paid;
      newTableRow.appendChild(paidUI)
      sessionsTable.appendChild(newTableRow)

      // update totals 

      const totalAmountEl = document.getElementById("totalAmount");
      const currentAmount = parseFloat(totalAmountEl.textContent);
      totalAmountEl.textContent = (currentAmount + session.total).toFixed(2); 
      const totalHours = document.getElementById("totalHours");
      const currentHours = parseInt(totalHours.textContent);
      totalHours.textContent = (currentHours + session.duration);
    });
  });
  