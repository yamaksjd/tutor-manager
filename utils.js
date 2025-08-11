import { students, tutors } from "./firestore_sync.js";


function createIcon(name, className) {
      const icon = document.createElement("ion-icon");
      icon.classList.add(className);
      icon.setAttribute("name", name);
      return icon
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

// Helper function to handle form visibility
function toggleFormVisibility(show, hide, button, action = 'hide') {
    show.classList.remove('hidden');
    hide.classList.add('hidden');
    button.style.display = action === 'hide' ? 'none' : 'block';
}



export { createIcon, updateDropDown, toggleFormVisibility };
