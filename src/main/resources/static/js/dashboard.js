// Only IT agents and admins can see the dashboard
const currentUser = requireLogin(["IT_AGENT", "ADMIN"]);

// Fills the cards and draws the three charts from /api/dashboard
function loadDashboard() {
    getDashboard(
        function (data) {
            document.getElementById("totalValue").textContent = data.totalTickets;
            document.getElementById("openValue").textContent = data.openTickets;
            document.getElementById("progressValue").textContent = data.inProgressTickets;
            document.getElementById("resolvedValue").textContent = data.resolvedTickets;

            // Resolution rate = resolved / total, as a percentage
            let rate = 0;
            if (data.totalTickets > 0) {
                rate = Math.round((data.resolvedTickets / data.totalTickets) * 100);
            }
            document.getElementById("resolvedBar").style.width = rate + "%";
            document.getElementById("resolvedRate").textContent = rate + "% resolution rate";

            // Pill next to the title
            const critical = data.ticketsByPriority["CRITICAL"];
            document.getElementById("criticalPill").textContent = critical + " critical tickets";

            drawBars("priorityChart", "priorityLabels",
                ["LOW", "MEDIUM", "HIGH", "CRITICAL"], data.ticketsByPriority, "");

            drawBars("categoryChart", "categoryLabels",
                ["NETWORK", "HARDWARE", "SOFTWARE", "ACCESS"], data.ticketsByCategory, "light");

            // The status counts come as separate numbers, so we put them in one object
            const statusCounts = {
                OPEN: data.openTickets,
                IN_PROGRESS: data.inProgressTickets,
                RESOLVED: data.resolvedTickets
            };
            drawBars("statusChart", "statusLabels",
                ["OPEN", "IN_PROGRESS", "RESOLVED"], statusCounts, "");
        },
        function (errorMessage) {
            showMessage("message", errorMessage, "error");
        }
    );
}

// Shows the 5 newest tickets in the small table
function loadRecentTickets() {
    getTickets(
        function (tickets) {
            // The list comes oldest first, so reverse it to get the newest first
            tickets.reverse();

            const body = document.getElementById("recentBody");
            if (tickets.length === 0) {
                body.innerHTML = '<tr><td colspan="5">No tickets yet.</td></tr>';
                return;
            }

            let limit = 5;
            if (tickets.length < 5) {
                limit = tickets.length;
            }

            let html = "";
            for (let i = 0; i < limit; i++) {
                const t = tickets[i];
                html += "<tr>";
                html += "<td><strong>" + escapeHtml(t.ticketNumber) + "</strong></td>";
                html += "<td>" + escapeHtml(t.title) + "</td>";
                html += '<td><span class="badge badge-' + t.priority.toLowerCase() + '">' + formatLabel(t.priority) + "</span></td>";
                html += '<td><span class="badge badge-' + t.status.toLowerCase() + '">' + formatLabel(t.status) + "</span></td>";
                html += '<td><a class="btn btn-outline btn-small" href="ticket-details.html?id=' + t.id + '">View</a></td>';
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
    loadDashboard();
    loadRecentTickets();
}