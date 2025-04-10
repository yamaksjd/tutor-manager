window.addEventListener("load", () => {
    const form = getElementById("sessionForm")
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const student = document.getElementById("student-selection").value
        const date = document.getElementById("date").value
        const duration = document.getElementById("duration").value

        if(!student || !date || !duration) {
            alert("Please fill out all of the requirements in the form")
            return;
        }
        console.log("Form submitted! " + student +" "+ date + " "+ duration)
    })
})