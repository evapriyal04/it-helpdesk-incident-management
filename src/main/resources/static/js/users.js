// Only admins can manage users
const currentUser = requireLogin(["ADMIN"]);

// The support team box is only needed for IT agents
function toggleTeam() {
    const role = document.getElementById("role").value;
    const group = document.getElementById("teamGroup");

    if (role === "IT_AGENT") {
        group.classList.remove("hidden");
    } else {
        group.classList.add("hidden");
        document.getElementById("supportTeam").value = "";
    }
}

function clearErrors() {
    document.getElementById("fullNameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
    document.getElementById("roleError").textContent = "";
    document.getElementById("teamError").textContent = "";
    hideMessage("message");
}

// Form validation: returns true only when every field is correct
function validateForm(fullName, email, password, role, team) {
    let valid = true;

    if (fullName.trim() === "") {
        document.getElementById("fullNameError").textContent = "Full name is required";
        valid = false;
    }

    // A simple email pattern: some text, an @, some text, a dot, some text
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() === "") {
        document.getElementById("emailError").textContent = "Email is required";
        valid = false;
    } else if (!emailPattern.test(email.trim())) {
        document.getElementById("emailError").textContent = "Enter a valid email address";
        valid = false;
    }

    if (password.length < 6) {
        document.getElementById("passwordError").textContent = "Password must be at least 6 characters";
        valid = false;
    }

    if (role === "") {
        document.getElementById("roleError").textContent = "Please select a role";
        valid = false;
    }

    if (role === "IT_AGENT" && team === "") {
        document.getElementById("teamError").textContent = "IT agents must belong to a support team";
        valid = false;
    }

    return valid;
}

function handleSubmit(event) {
    event.preventDefault();
    clearErrors();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const team = document.getElementById("supportTeam").value;

    if (!validateForm(fullName, email, password, role, team)) {
        return;
    }

    // This object becomes the JSON for the User entity in Spring Boot
    const user = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role
    };

    if (role === "IT_AGENT") {
        user.supportTeam = team;
    }

    createUser(
        user,
        function (saved) {
            showMessage("message", saved.fullName + " was created as " + formatLabel(saved.role) + ".", "success");
            document.getElementById("userForm").reset();
            toggleTeam();
            loadUsers();
        },
        function (errorMessage) {
            showMessage("message", errorMessage, "error");
        }
    );
}

function loadUsers() {
    getUsers(
        function (users) {
            document.getElementById("countPill").textContent = users.length + " users";

            const body = document.getElementById("userBody");
            if (users.length === 0) {
                body.innerHTML = '<tr><td colspan="4">No users yet.</td></tr>';
                return;
            }

            let html = "";
            for (let i = 0; i < users.length; i++) {
                const u = users[i];

                let team = "-";
                if (u.supportTeam !== null) {
                    team = formatLabel(u.supportTeam);
                }

                html += "<tr>";
                html += "<td><strong>" + escapeHtml(u.fullName) + "</strong></td>";
                html += "<td>" + escapeHtml(u.email) + "</td>";
                html += '<td><span class="badge badge-' + u.role.toLowerCase() + '">' + formatLabel(u.role) + "</span></td>";
                html += "<td>" + team + "</td>";
                html += "</tr>";
            }
            body.innerHTML = html;
        },
        function (errorMessage) {
            showMessage("message", errorMessage, "error");
        }
    );
}

if (currentUser !== null) {
    document.getElementById("role").addEventListener("change", toggleTeam);
    document.getElementById("userForm").addEventListener("submit", handleSubmit);
    loadUsers();
}