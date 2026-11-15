const currentUser = requireLogin(null);

// All tickets from the backend are kept in this array.
// The filters work on this array, so we do not call the server for every filter change.
let allTickets = [];

// Employees and admins can create tickets, IT agents cannot
function showCreateButton() {
    if (currentUser !== null && currentUser.role !== "IT_AGENT") {
        document.getElementById("createAction").innerHTML =
            '<a class="btn" href="create-ticket.html">Create Ticket</a>';
    }
}

// Draws the table rows for the list we pass in
function renderTable(list) {
    const body = document.getElementById("ticketBody");

    document.getElementById("countPill").textContent = list.length + " of " + allTickets.length + " tickets";

    if (list.length === 0) {
        body.innerHTML = '<tr><td colspan="9">No tickets found.</td></tr>';
        return;
    }

    let html = "";
    for (let i = 0; i < list.length; i++) {
        const t = list[i];

        let assigned = "Unassigned";
        if (t.assignedToName !== null) {
            assigned = escapeHtml(t.assignedToName);
        }

        html += "<tr>";
        html += "<td><strong>" + escapeHtml(t.ticketNumber) + "</strong></td>";
        html += "<td>" + escapeHtml(t.title) + "</td>";
        html += "<td>" + formatLabel(t.category) + "</td>";
        html += '<td><span class="badge badge-' + t.priority.toLowerCase() + '">' + formatLabel(t.priority) + "</span></td>";
        html += '<td><span class="badge badge-' + t.status.toLowerCase() + '">' + formatLabel(t.status) + "</span></td>";
        html += "<td>" + escapeHtml(t.createdByName) + "</td>";
        html += "<td>" + assigned + "</td>";
        html += "<td>" + formatDate(t.createdAt) + "</td>";
        html += '<td><a class="btn btn-outline btn-small" href="ticket-details.html?id=' + t.id + '">View</a></td>';
        html += "</tr>";
    }
    body.innerHTML = html;
}

// Keeps only the tickets that match the three dropdowns
function applyFilters() {
    const status = document.getElementById("statusFilter").value;
    const priority = document.getElementById("priorityFilter").value;
    const category = document.getElementById("categoryFilter").value;

    const result = [];
    for (let i = 0; i < allTickets.length; i++) {
        const t = allTickets[i];

        if (status !== "" && t.status !== status) {
            continue;
        }
        if (priority !== "" && t.priority !== priority) {
            continue;
        }
        if (category !== "" && t.category !== category) {
            continue;
        }
        result.push(t);
    }

    renderTable(result);
}

function loadTickets() {
    hideMessage("message");
    getTickets(
        function (tickets) {
            // Newest ticket first
            tickets.reverse();
            allTickets = tickets;
            applyFilters();
        },
        function (errorMessage) {
            showMessage("message", errorMessage, "error");
        }
    );
}

// Search uses the backend endpoint: GET /api/tickets/search?ticketNumber=...
function handleSearch() {
    const text = document.getElementById("searchInput").value.trim().toUpperCase();
    hideMessage("message");

    if (text === "") {
        loadTickets();
        return;
    }

    searchTicket(
        text,
        function (ticket) {
            allTickets = [ticket];
            applyFilters();
        },
        function (errorMessage) {
            allTickets = [];
            applyFilters();
            showMessage("message", errorMessage, "error");
        }
    );
}

function handleClear() {
    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "";
    document.getElementById("priorityFilter").value = "";
    document.getElementById("categoryFilter").value = "";
    loadTickets();
}

if (currentUser !== null) {
    showCreateButton();

    document.getElementById("searchBtn").addEventListener("click", handleSearch);
    document.getElementById("clearBtn").addEventListener("click", handleClear);
    document.getElementById("statusFilter").addEventListener("change", applyFilters);
    document.getElementById("priorityFilter").addEventListener("change", applyFilters);
    document.getElementById("categoryFilter").addEventListener("change", applyFilters);
    document.getElementById("searchInput").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

    loadTickets();
}