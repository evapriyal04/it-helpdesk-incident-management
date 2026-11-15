// Visiting the login page ends any previous session
localStorage.removeItem("helpdeskUser");

let allUsers = [];

function loadUsers() {
    getUsers(
        function (users) {
            allUsers = users;
            const select = document.getElementById("userSelect");
            select.innerHTML = '<option value="">-- Select a user --</option>';

            for (let i = 0; i < users.length; i++) {
                const option = document.createElement("option");
                option.value = users[i].id;
                option.textContent = users[i].fullName + " (" + users[i].role + ")";
                select.appendChild(option);
            }

            if (users.length === 0) {
                showMessage("message", "No users exist yet. Create one in Postman first.", "error");
            }
        },
        function (errorMessage) {
            showMessage("message", errorMessage, "error");
        }
    );
}

function handleLogin(event) {
    event.preventDefault();

    const selectedId = document.getElementById("userSelect").value;
    const errorBox = document.getElementById("userError");

    // Form validation
    if (selectedId === "") {
        errorBox.textContent = "Please select a user";
        return;
    }
    errorBox.textContent = "";

    for (let i = 0; i < allUsers.length; i++) {
        if (String(allUsers[i].id) === selectedId) {
            saveCurrentUser({
                id: allUsers[i].id,
                fullName: allUsers[i].fullName,
                role: allUsers[i].role
            });
            window.location.href = "index.html";
            return;
        }
    }
}

document.getElementById("loginForm").addEventListener("submit", handleLogin);
loadUsers();