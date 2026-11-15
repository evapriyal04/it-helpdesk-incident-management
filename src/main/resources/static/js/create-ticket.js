// Only employees and admins can create tickets
const currentUser = requireLogin(["EMPLOYEE", "ADMIN"]);

function clearErrors() {
    document.getElementById("titleError").textContent = "";
    document.getElementById("descriptionError").textContent = "";
    document.getElementById("categoryError").textContent = "";
    document.getElementById("priorityError").textContent = "";
    hideMessage("message");
}

// Form validation: returns true only when every field is filled in
function validateForm(title, description, category, priority) {
    let valid = true;

    if (title.trim() === "") {
        document.getElementById("titleError").textContent = "Title is required";
        valid = false;
    } else if (title.trim().length < 5) {
        document.getElementById("titleError").textContent = "Title must be at least 5 characters";
        valid = false;
    }

    if (description.trim() === "") {
        document.getElementById("descriptionError").textContent = "Description is required";
        valid = false;
    }

    if (category === "") {
        document.getElementById("categoryError").textContent = "Please select a category";
        valid = false;
    }

    if (priority === "") {
        document.getElementById("priorityError").textContent = "Please select a priority";
        valid = false;
    }

    return valid;
}

function handleSubmit(event) {
    event.preventDefault();
    clearErrors();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const priority = document.getElementById("priority").value;

    if (!validateForm(title, description, category, priority)) {
        return;
    }

    // This object becomes the JSON that matches the TicketRequest DTO in Spring Boot
    const ticket = {
        title: title.trim(),
        description: description.trim(),
        category: category,
        priority: priority,
        createdById: currentUser.id
    };

    createTicket(
        ticket,
        function (saved) {
            showMessage("message", "Ticket " + saved.ticketNumber + " was created successfully.", "success");
            document.getElementById("ticketForm").reset();
        },
        function (errorMessage) {
            showMessage("message", errorMessage, "error");
        }
    );
}

if (currentUser !== null) {
    document.getElementById("ticketForm").addEventListener("submit", handleSubmit);
}