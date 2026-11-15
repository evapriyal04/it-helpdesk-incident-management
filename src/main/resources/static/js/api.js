// One generic function that talks to the backend using the Fetch API.
// method    : "GET", "POST", "PUT" or "DELETE"
// url       : for example "/api/tickets"
// body      : a JavaScript object to send as JSON, or null when there is no body
// onSuccess : function called with the data when the request works
// onError   : function called with an error message when it fails
function apiRequest(method, url, body, onSuccess, onError) {
    const options = {
        method: method,
        headers: { "Content-Type": "application/json" }
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    fetch(url, options)
        .then(function (response) {
            return response.text().then(function (text) {
                let data = null;
                if (text !== "") {
                    data = JSON.parse(text);
                }

                if (response.ok) {
                    onSuccess(data);
                } else if (data !== null && data.message) {
                    onError(data.message);
                } else {
                    onError("Request failed with status " + response.status);
                }
            });
        })
        .catch(function (error) {
            onError("Cannot reach the server. Is the application running?");
        });
}

// ---------- Users ----------
function getUsers(onSuccess, onError) {
    apiRequest("GET", "/api/users", null, onSuccess, onError);
}

function createUser(user, onSuccess, onError) {
    apiRequest("POST", "/api/users", user, onSuccess, onError);
}

// ---------- Tickets ----------
function createTicket(ticket, onSuccess, onError) {
    apiRequest("POST", "/api/tickets", ticket, onSuccess, onError);
}

function getTickets(onSuccess, onError) {
    apiRequest("GET", "/api/tickets", null, onSuccess, onError);
}

function getTicketById(id, onSuccess, onError) {
    apiRequest("GET", "/api/tickets/" + id, null, onSuccess, onError);
}

function searchTicket(ticketNumber, onSuccess, onError) {
    apiRequest("GET", "/api/tickets/search?ticketNumber=" + encodeURIComponent(ticketNumber), null, onSuccess, onError);
}

function getRecommendation(id, onSuccess, onError) {
    apiRequest("GET", "/api/tickets/" + id + "/recommendation", null, onSuccess, onError);
}

function updateTicket(id, ticket, onSuccess, onError) {
    apiRequest("PUT", "/api/tickets/" + id, ticket, onSuccess, onError);
}

// body: { agentId, reassignmentReason, overrideMismatch }
function assignTicket(id, body, onSuccess, onError) {
    apiRequest("PUT", "/api/tickets/" + id + "/assign", body, onSuccess, onError);
}

function updateTicketStatus(id, status, resolutionNotes, onSuccess, onError) {
    const body = { status: status, resolutionNotes: resolutionNotes };
    apiRequest("PUT", "/api/tickets/" + id + "/status", body, onSuccess, onError);
}

function deleteTicket(id, onSuccess, onError) {
    apiRequest("DELETE", "/api/tickets/" + id, null, onSuccess, onError);
}

// ---------- Dashboard ----------
function getDashboard(onSuccess, onError) {
    apiRequest("GET", "/api/dashboard", null, onSuccess, onError);
}