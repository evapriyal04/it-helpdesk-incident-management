const currentUser = requireLogin(null);

// The ticket id comes from the address: ticket-details.html?id=3
const ticketId = new URLSearchParams(window.location.search).get("id");

// Data used by the smart routing panel
let currentTicket = null;     // the ticket being shown
let recommendation = null;    // the routing recommendation from the backend
let allAgents = [];           // every IT agent
let preselected = false;      // so we only pre-select the recommended agent once

// ---------- Small helpers ----------

// IT agents and admins can manage tickets, employees can only view
function isStaff() {
    return currentUser.role === "IT_AGENT" || currentUser.role === "ADMIN";
}

// Shows a message and scrolls up so the user can see it
function notify(text, type) {
    showMessage("message", text, type);
    window.scrollTo(0, 0);
}

function clearFieldErrors() {
    document.getElementById("editTitleError").textContent = "";
    document.getElementById("editDescriptionError").textContent = "";
    document.getElementById("agentError").textContent = "";
    document.getElementById("reasonError").textContent = "";
    document.getElementById("notesError").textContent = "";
    hideMessage("message");
}

// ---------- Showing the ticket ----------

function detailRow(label, valueHtml) {
    return '<div class="detail-row"><span class="detail-label">' + label + '</span><span>' + valueHtml + '</span></div>';
}

function showTicket(t) {
    document.getElementById("pageTitle").textContent = t.ticketNumber;
    document.getElementById("pageSubtitle").textContent = t.title;

    let assigned = "Unassigned";
    if (t.assignedToName !== null) {
        assigned = escapeHtml(t.assignedToName);
    }

    let html = "";
    html += detailRow("Status", '<span class="badge badge-' + t.status.toLowerCase() + '">' + formatLabel(t.status) + '</span>');
    html += detailRow("Priority", '<span class="badge badge-' + t.priority.toLowerCase() + '">' + formatLabel(t.priority) + '</span>');
    html += detailRow("Category", formatLabel(t.category));
    html += detailRow("Created By", escapeHtml(t.createdByName));
    html += detailRow("Assigned To", assigned);
    if (t.assignmentNote !== null && t.assignmentNote !== "") {
        html += detailRow("Assignment Note", escapeHtml(t.assignmentNote));
    }
    html += detailRow("Created", formatDate(t.createdAt));
    html += '<div class="description-box">' + escapeHtml(t.description) + '</div>';

    if (t.resolutionNotes !== null && t.resolutionNotes !== "") {
        html += '<div class="notes-box"><strong>Resolution notes</strong><br>' + escapeHtml(t.resolutionNotes) + '</div>';
    }

    document.getElementById("detailsBody").innerHTML = html;

    // Fill the edit form and the status dropdown with the current values
    document.getElementById("editTitle").value = t.title;
    document.getElementById("editDescription").value = t.description;
    document.getElementById("editCategory").value = t.category;
    document.getElementById("editPriority").value = t.priority;
    document.getElementById("statusSelect").value = t.status;
    toggleNotes();

    // Keep the smart routing panel in step with the ticket
    currentTicket = t;
    updateAssignPanel();
}

function loadTicket() {
    getTicketById(
        ticketId,
        function (ticket) {
            showTicket(ticket);
        },
        function (errorMessage) {
            document.getElementById("pageSubtitle").textContent = "";
            notify(errorMessage, "error");
        }
    );
}

// ---------- Edit details ----------

function handleEdit(event) {
    event.preventDefault();
    clearFieldErrors();

    const title = document.getElementById("editTitle").value.trim();
    const description = document.getElementById("editDescription").value.trim();
    let valid = true;

    if (title === "") {
        document.getElementById("editTitleError").textContent = "Title is required";
        valid = false;
    }
    if (description === "") {
        document.getElementById("editDescriptionError").textContent = "Description is required";
        valid = false;
    }
    if (!valid) {
        return;
    }

    const body = {
        title: title,
        description: description,
        category: document.getElementById("editCategory").value,
        priority: document.getElementById("editPriority").value
    };

    updateTicket(
        ticketId,
        body,
        function (saved) {
            showTicket(saved);
            // The category may have changed, so ask for a fresh recommendation
            loadRecommendation();
            notify("Ticket details updated.", "success");
        },
        function (errorMessage) {
            notify(errorMessage, "error");
        }
    );
}

// ---------- Assign (smart routing) ----------

// "NETWORK_SUPPORT" becomes "Network Support"
function teamLabel(team) {
    if (team === null || team === undefined) {
        return "No team";
    }
    return formatLabel(team);
}

function findAgent(id) {
    for (let i = 0; i < allAgents.length; i++) {
        if (String(allAgents[i].id) === String(id)) {
            return allAgents[i];
        }
    }
    return null;
}

// Fills the dropdown with IT agents, then asks for the recommendation
function loadAgents() {
    getUsers(
        function (users) {
            const select = document.getElementById("agentSelect");
            allAgents = [];

            for (let i = 0; i < users.length; i++) {
                if (users[i].role === "IT_AGENT") {
                    allAgents.push(users[i]);

                    const option = document.createElement("option");
                    option.value = users[i].id;
                    option.textContent = users[i].fullName + " (" + teamLabel(users[i].supportTeam) + ")";
                    select.appendChild(option);
                }
            }

            loadRecommendation();
        },
        function (errorMessage) {
            notify(errorMessage, "error");
        }
    );
}

function loadRecommendation() {
    getRecommendation(
        ticketId,
        function (data) {
            recommendation = data;
            updateAssignPanel();
        },
        function (errorMessage) {
            notify(errorMessage, "error");
        }
    );
}

// Shows the recommendation, pre-selects the recommended agent, and refreshes the warnings
function updateAssignPanel() {
    if (currentTicket === null || recommendation === null) {
        return;
    }

    let html = "<strong>Recommended team: " + escapeHtml(recommendation.teamName) + "</strong>";
    if (recommendation.agents.length === 0) {
        html += "<br>No agents belong to this team yet.";
    } else {
        html += "<br>Available agents: ";
        for (let i = 0; i < recommendation.agents.length; i++) {
            if (i > 0) {
                html += ", ";
            }
            html += escapeHtml(recommendation.agents[i].fullName);
        }
    }
    document.getElementById("recommendationBox").innerHTML = html;

    // Approving the recommendation = the recommended agent is already selected
    if (!preselected && currentTicket.assignedToName === null && recommendation.agents.length > 0) {
        document.getElementById("agentSelect").value = recommendation.agents[0].id;
        preselected = true;
    }

    onAgentChange();
}

// Runs whenever the selected agent changes: shows or hides the warning and the reason box
function onAgentChange() {
    if (currentTicket === null || recommendation === null) {
        return;
    }

    const agentId = document.getElementById("agentSelect").value;
    const warning = document.getElementById("mismatchWarning");
    const overrideGroup = document.getElementById("overrideGroup");
    const reasonGroup = document.getElementById("reasonGroup");

    let mismatch = false;
    if (agentId !== "") {
        const agent = findAgent(agentId);
        if (agent !== null && agent.supportTeam !== recommendation.team) {
            mismatch = true;
            warning.innerHTML = "<strong>Assignment mismatch</strong><br>This ticket belongs to "
                + escapeHtml(recommendation.teamName) + ", but " + escapeHtml(agent.fullName)
                + " belongs to " + escapeHtml(teamLabel(agent.supportTeam))
                + ".<br>Recommended action: assign to " + escapeHtml(recommendation.teamName) + ".";
        }
    }

    if (mismatch) {
        warning.classList.remove("hidden");
        overrideGroup.classList.remove("hidden");
    } else {
        warning.classList.add("hidden");
        overrideGroup.classList.add("hidden");
        document.getElementById("overrideCheck").checked = false;
    }

    // A reason is needed for a mismatch or when the ticket is already assigned (a transfer)
    const alreadyAssigned = currentTicket.assignedToName !== null;
    if (mismatch || alreadyAssigned) {
        reasonGroup.classList.remove("hidden");
    } else {
        reasonGroup.classList.add("hidden");
    }
}

function handleAssign() {
    clearFieldErrors();

    const agentId = document.getElementById("agentSelect").value;
    if (agentId === "") {
        document.getElementById("agentError").textContent = "Please select an agent";
        return;
    }

    const agent = findAgent(agentId);
    let mismatch = false;
    if (recommendation !== null && agent !== null && agent.supportTeam !== recommendation.team) {
        mismatch = true;
    }

    const override = document.getElementById("overrideCheck").checked;
    const reason = document.getElementById("reasonText").value.trim();
    const alreadyAssigned = currentTicket !== null && currentTicket.assignedToName !== null;

    if (mismatch && !override) {
        document.getElementById("agentError").textContent =
            "This agent is in a different team. Tick 'Assign anyway' to override.";
        return;
    }

    if ((mismatch || alreadyAssigned) && reason === "") {
        document.getElementById("reasonError").textContent = "Please give a reason";
        return;
    }

    const body = {
        agentId: Number(agentId),
        reassignmentReason: reason,
        overrideMismatch: override
    };

    assignTicket(
        ticketId,
        body,
        function (saved) {
            document.getElementById("reasonText").value = "";
            document.getElementById("overrideCheck").checked = false;
            showTicket(saved);
            notify("Ticket assigned to " + saved.assignedToName + ".", "success");
        },
        function (errorMessage) {
            notify(errorMessage, "error");
        }
    );
}

// ---------- Status ----------

// Resolution notes are only needed when the status is Resolved
function toggleNotes() {
    const status = document.getElementById("statusSelect").value;
    const group = document.getElementById("notesGroup");

    if (status === "RESOLVED") {
        group.classList.remove("hidden");
    } else {
        group.classList.add("hidden");
    }
}

function handleStatus() {
    clearFieldErrors();
    const status = document.getElementById("statusSelect").value;
    const notes = document.getElementById("resolutionNotes").value.trim();

    if (status === "RESOLVED" && notes === "") {
        document.getElementById("notesError").textContent = "Resolution notes are required";
        return;
    }

    updateTicketStatus(
        ticketId,
        status,
        notes,
        function (saved) {
            showTicket(saved);
            notify("Status updated to " + formatLabel(saved.status) + ".", "success");
        },
        function (errorMessage) {
            notify(errorMessage, "error");
        }
    );
}

// ---------- Delete ----------

function handleDelete() {
    const sure = confirm("Delete this ticket permanently?");
    if (!sure) {
        return;
    }

    deleteTicket(
        ticketId,
        function () {
            window.location.href = "tickets.html";
        },
        function (errorMessage) {
            notify(errorMessage, "error");
        }
    );
}

// ---------- Start ----------

if (currentUser !== null) {
    if (ticketId === null) {
        notify("No ticket selected. Go back to the Tickets page.", "error");
    } else {
        // Hide the management panels from people who are not allowed to use them
        if (!isStaff()) {
            document.getElementById("editCard").classList.add("hidden");
            document.getElementById("assignCard").classList.add("hidden");
            document.getElementById("statusCard").classList.add("hidden");
        }
        if (currentUser.role !== "ADMIN") {
            document.getElementById("deleteCard").classList.add("hidden");
        }

        document.getElementById("editForm").addEventListener("submit", handleEdit);
        document.getElementById("agentSelect").addEventListener("change", onAgentChange);
        document.getElementById("assignBtn").addEventListener("click", handleAssign);
        document.getElementById("statusSelect").addEventListener("change", toggleNotes);
        document.getElementById("statusBtn").addEventListener("click", handleStatus);
        document.getElementById("deleteBtn").addEventListener("click", handleDelete);

        loadTicket();
        if (isStaff()) {
            loadAgents();
        }
    }
}