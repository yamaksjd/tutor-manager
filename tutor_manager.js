window.addEventListener("load", () => {
    const form = document.getElementById("sessionForm");
  
    // Define tutor rates
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
        total
      };
  
      console.log("Session created:", session);
  
      // Next step: append this to the table & update totals
    });
  });
  