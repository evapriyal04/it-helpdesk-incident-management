// ---------- Login session (kept in the browser's localStorage) ----------
function getCurrentUser() {
    const text = localStorage.getItem("helpdeskUser");
    if (text === null) {
        return null;
    }
    return JSON.parse(text);
}

function saveCurrentUser(user) {
    localStorage.setItem("helpdeskUser", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("helpdeskUser");
    window.location.href = "login.html";
}

// Call at the top of a page that needs a logged-in user.
// allowedRoles is an array like ["ADMIN", "IT_AGENT"], or null to allow everyone.
function requireLogin(allowedRoles) {
    const user = getCurrentUser();

    if (user === null) {
        window.location.href = "login.html";
        return null;
    }

    if (allowedRoles !== null && allowedRoles.indexOf(user.role) === -1) {
        window.location.href = "index.html";
        return null;
    }

    return user;
}

// ---------- Helpers ----------

// Stops user text from being treated as HTML when we build tables with innerHTML
function escapeHtml(text) {
    if (text === null || text === undefined) {
        return "";
    }
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// "2026-11-10T12:30:45.123" becomes "2026-11-10 12:30"
function formatDate(isoText) {
    if (isoText === null || isoText === undefined) {
        return "";
    }
    return isoText.replace("T", " ").substring(0, 16);
}

// "IN_PROGRESS" becomes "In Progress"
function formatLabel(text) {
    if (text === null || text === undefined) {
        return "";
    }
    const words = text.split("_");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0) + words[i].substring(1).toLowerCase();
    }
    return words.join(" ");
}

// Shows a green (type "success") or red (type "error") message box
function showMessage(elementId, text, type) {
    const box = document.getElementById(elementId);
    box.className = "alert alert-" + type;
    box.textContent = text;
    box.style.display = "block";
}

function hideMessage(elementId) {
    document.getElementById(elementId).style.display = "none";
}

// ---------- Navbar ----------
// Each role sees different links
const NAV_LINKS = {
    EMPLOYEE: [
        ["Home", "index.html"],
        ["Create Ticket", "create-ticket.html"],
        ["Tickets", "tickets.html"]
    ],
    IT_AGENT: [
        ["Home", "index.html"],
        ["Tickets", "tickets.html"],
        ["Dashboard", "dashboard.html"]
    ],
    ADMIN: [
        ["Home", "index.html"],
        ["Create Ticket", "create-ticket.html"],
        ["Tickets", "tickets.html"],
        ["Dashboard", "dashboard.html"],
        ["Users", "users.html"]
    ]
};

function buildNavbar() {
    const navbar = document.getElementById("navbar");
    if (navbar === null) {
        return;
    }

    const user = getCurrentUser();

    // Find the name of the page we are on, so we can highlight its tab
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") {
        currentPage = "index.html";
    }

    // Decide which tabs to show
    let links = [];
    if (user !== null) {
        links = NAV_LINKS[user.role];
    } else if (currentPage !== "login.html") {
        links = [["Home", "index.html"]];
    }

    let html = '<header class="topbar">';
    html += '<a class="brand" href="index.html">IT Help Desk</a>';

    // Middle: pill tab bar (not shown on the login page)
    if (links.length > 0) {
        html += '<nav class="nav-tabs">';
        for (let i = 0; i < links.length; i++) {
            let cssClass = "";
            if (links[i][1] === currentPage) {
                cssClass = ' class="active"';
            }
            html += '<a href="' + links[i][1] + '"' + cssClass + '>' + links[i][0] + '</a>';
        }
        html += '</nav>';
    }

    // Right side: user name and logout, or a login button
    html += '<div class="topbar-actions">';
    if (user !== null) {
        html += '<div class="user-name">' + escapeHtml(user.fullName);
        html += '<span>' + formatLabel(user.role) + '</span></div>';
        html += '<button class="btn btn-small" id="logoutBtn">Logout</button>';
    } else if (currentPage !== "login.html") {
        html += '<a class="btn btn-small" href="login.html">Login</a>';
    }
    html += '</div></header>';

    navbar.innerHTML = html;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn !== null) {
        logoutBtn.addEventListener("click", logout);
    }
}

document.addEventListener("DOMContentLoaded", buildNavbar);

// ---------- Bar chart (plain divs, no library) ----------
// chartId : the div that holds the bars
// labelsId: the div that holds the names under the bars
// names   : the order we want, for example ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
// counts  : an object like { LOW: 0, MEDIUM: 2 }
// barClass: "" for dark green, "light" for light green
function drawBars(chartId, labelsId, names, counts, barClass) {
    let max = 1;
    for (let i = 0; i < names.length; i++) {
        if (counts[names[i]] > max) {
            max = counts[names[i]];
        }
    }

    let barsHtml = "";
    let labelsHtml = "";

    for (let i = 0; i < names.length; i++) {
        const count = counts[names[i]];
        const height = Math.round((count / max) * 170);

        barsHtml += '<div class="bar-col"><div class="bar-area">';
        barsHtml += '<div class="bar-count">' + count + '</div>';
        barsHtml += '<div class="bar ' + barClass + '" style="height:' + height + 'px"></div>';
        barsHtml += '</div></div>';

        labelsHtml += '<span>' + formatLabel(names[i]) + '</span>';
    }

    document.getElementById(chartId).innerHTML = barsHtml;
    document.getElementById(labelsId).innerHTML = labelsHtml;
}