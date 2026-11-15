# IT Help Desk & Incident Management System

A full stack IT support platform built with **Java, Spring Boot, PostgreSQL** and a plain **HTML, CSS and JavaScript** frontend.

Employees report technical problems as tickets, IT agents work on them until they are resolved, and admins follow live statistics on a dashboard. A rule-based **smart routing** feature recommends the right support team for each ticket and warns when a ticket is assigned to the wrong one.

> This is a learning project. Login is a simple role selector, not real authentication. See [Known limitations](#known-limitations).

## Why this project

In a large company, IT incidents arrive all day: someone cannot open a database, a laptop fails before a meeting, a floor loses its network. Many incidents do not reach the right support team first time. They get transferred, time is wasted, and deadlines are missed. This project is a small, simplified version of the tooling that IT service teams use to track incidents and route them to the right people.

## Features

- **Tickets:** create, list, view, edit, search by ticket number (for example `TKT-1001`), and delete (only while a ticket is still `OPEN`)
- **Automatic ticket numbers** generated from the database id
- **Categories:** Network, Hardware, Software, Access. **Priorities:** Low, Medium, High, Critical
- **Status workflow:** Open, In Progress, Resolved, with mandatory resolution notes when a ticket is resolved
- **Smart routing:** each category maps to a support team; the app recommends the team and its agents, warns on a mismatch, and records a reason for every override or transfer
- **Dashboard:** totals, counts by status, priority and category, and the newest tickets
- **User management:** admins create employees, IT agents (who must belong to a support team) and admins
- **Role-based navigation** for Employee, IT Agent and Admin
- **Validation** in the browser and on the server, and a **global exception handler** that returns consistent JSON errors

## Roles

| Role | What they can do |
|---|---|
| Employee | Create tickets, view the ticket list and details |
| IT Agent | View and edit tickets, assign or transfer them, change status, write resolution notes, see the dashboard |
| Admin | Everything an agent can do, plus create users and delete open tickets |

## Smart routing

| Category | Support team |
|---|---|
| Network | Network Support |
| Hardware | Hardware Support |
| Software | Software Support |
| Access | Access Management |

- When a ticket is opened, `GET /api/tickets/{id}/recommendation` returns the recommended team and the IT agents who belong to it. The rule is a `HashMap` from category to team, and the agents come from a derived Spring Data JPA query.
- If someone picks an agent from a different team, the API rejects the assignment with an `Assignment mismatch` message unless the request sets `overrideMismatch` to `true` and gives a reason.
- Changing an already-assigned ticket counts as a transfer and always needs a reason. The latest reason is saved on the ticket as its assignment note.

## Tech stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot (Spring Web MVC, Spring Data JPA, Bean Validation) |
| Persistence | Hibernate (JPA) |
| Database | PostgreSQL |
| Build tool | Maven |
| Frontend | HTML5, CSS3 (Flexbox, Grid, media queries), JavaScript (DOM, events, Fetch API) |
| Testing tools | Postman, pgAdmin |

## Architecture

```
Browser (HTML, CSS, JavaScript with Fetch)
        |  HTTP + JSON
        v
Controller    maps URLs, converts JSON to DTOs, runs validation
        |
        v
Service       business rules, converts between DTOs and entities
        |
        v
Repository    Spring Data JPA interfaces
        |
        v
Hibernate     maps objects to rows
        |
        v
PostgreSQL    tables: users, tickets
```

The frontend lives in `src/main/resources/static`, so Spring Boot serves the pages and the API from the same port.

## Project structure

```
src/main/java/com/it/helpdesk
├── controller    TicketController, UserController, DashboardController
├── dto           request and response classes (TicketRequest, TicketResponse, AssignRequest, ...)
├── entity        User, Ticket, and the enums Role, Priority, TicketStatus, Category, SupportTeam
├── exception     ResourceNotFoundException, BadRequestException, GlobalExceptionHandler
├── repository    UserRepository, TicketRepository
└── service       TicketService, UserService, AssignmentService, DashboardService

src/main/resources
├── application.properties.example
└── static        index, login, create-ticket, tickets, ticket-details, dashboard, users (.html)
    ├── css       style.css
    └── js        api.js, common.js and one script per page
```

## Getting started

### Prerequisites

- Java 21
- Maven (or the Maven wrapper included in the project)
- PostgreSQL

### 1. Create the database

```sql
CREATE DATABASE helpdesk_db;
```

Hibernate creates the tables automatically on the first start. It does not create the database itself.

### 2. Configure the application

Copy the example settings file and put in your own PostgreSQL password:

```
src/main/resources/application.properties.example  ->  src/main/resources/application.properties
```

```properties
spring.application.name=helpdesk

spring.datasource.url=jdbc:postgresql://localhost:5432/helpdesk_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD_HERE

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8484
```

`application.properties` is listed in `.gitignore`, so your real password is never committed.

### 3. Run it

Run `HelpdeskApplication` from your IDE, or from the project folder:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell use `.\mvnw.cmd spring-boot:run`. Then open **http://localhost:8484**.

### 4. Create the first users

The app starts with no users, and the Users page is for admins, so create the first accounts with Postman (or any HTTP client). Send each of these as `POST http://localhost:8484/api/users`:

```json
{ "fullName": "Admin User", "email": "admin@company.com", "password": "admin123", "role": "ADMIN" }
```

```json
{ "fullName": "Ravi Kumar", "email": "ravi@company.com", "password": "employee123", "role": "EMPLOYEE" }
```

```json
{ "fullName": "Anita Sharma", "email": "anita@company.com", "password": "agent123", "role": "IT_AGENT", "supportTeam": "NETWORK_SUPPORT" }
```

```json
{ "fullName": "Hari Prasad", "email": "hari@company.com", "password": "agent123", "role": "IT_AGENT", "supportTeam": "HARDWARE_SUPPORT" }
```

Valid support teams: `NETWORK_SUPPORT`, `HARDWARE_SUPPORT`, `SOFTWARE_SUPPORT`, `ACCESS_MANAGEMENT`. After that, open the login page and choose a user to continue as. These are demo passwords for a local test database only.

## Try it

1. Log in as the **employee** and create a Network ticket with High priority. Note the generated ticket number.
2. Log out, log in as the **Network agent**, and open the ticket. The recommended team and agent are already shown.
3. Choose an agent from another team to see the mismatch warning, the override checkbox and the reason box.
4. Assign the right agent, set the status to In Progress, then Resolved with resolution notes.
5. Log in as the **admin** to see the dashboard and the Users page.

## REST API

Base URL: `http://localhost:8484`

| Method | Endpoint | Purpose | Success status |
|---|---|---|---|
| POST | `/api/users` | Create a user | 201 |
| GET | `/api/users` | List users | 200 |
| POST | `/api/tickets` | Create a ticket | 201 |
| GET | `/api/tickets` | List tickets | 200 |
| GET | `/api/tickets/{id}` | Get one ticket | 200 |
| GET | `/api/tickets/search?ticketNumber=TKT-1001` | Find by ticket number | 200 |
| GET | `/api/tickets/{id}/recommendation` | Smart routing recommendation | 200 |
| PUT | `/api/tickets/{id}` | Edit title, description, category, priority | 200 |
| PUT | `/api/tickets/{id}/assign` | Assign or transfer a ticket | 200 |
| PUT | `/api/tickets/{id}/status` | Change status (resolution notes needed for `RESOLVED`) | 200 |
| DELETE | `/api/tickets/{id}` | Delete a ticket (only while `OPEN`) | 204 |
| GET | `/api/dashboard` | Dashboard numbers | 200 |

Errors share one JSON shape:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Ticket not found with id 999",
  "timestamp": "2026-11-10T12:30:00.123"
}
```

| Status | When |
|---|---|
| 400 | Failed validation, a broken business rule (wrong role, mismatch, missing reason or notes, deleting a non-open ticket), malformed JSON, or a database constraint such as a duplicate email |
| 404 | A ticket or user that does not exist, or an unknown URL |
| 500 | Anything unexpected, returned with a generic message |

## Known limitations

This project is a learning project and has real gaps, listed here on purpose:

- **No real authentication.** The login page is a role selector, and the API has no login check. Role rules are enforced in the browser, apart from the business rules in the services.
- **Passwords are stored as plain text.** Spring Security with BCrypt hashing is the next step.
- Every role can see every ticket.
- Only the latest assignment reason is stored, with no transfer history.
- No pagination, SLA timers, notifications, or automated tests yet.
- The schema is created with `ddl-auto=update` instead of migrations.

## Planned improvements

- Spring Security, hashed passwords, and server-side role checks
- Employees see only their own tickets
- A ticket history table that records every transfer
- SLA timers, escalation, and email notifications
- Routing rules stored in the database so admins can edit them
- Pagination, JUnit and Mockito tests, and Flyway migrations

## Author

Built by **Eva Priyal Noronha**
