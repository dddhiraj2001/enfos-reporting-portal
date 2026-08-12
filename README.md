# ENFOS Reporting Portal

A responsive React and Spring Boot portal for discovering and viewing Users, Departments, and
Projects reports.

## Quick start

Prerequisites: Java 17, npm, and Node.js `20.19+` or `22.12+`. Maven is included through the
repository wrapper.

From the repository root:

```bash
npm start
```

The command installs locked frontend dependencies, builds both applications, starts them, and
waits until they respond.

- Application: `http://localhost:4173`
- API: `http://localhost:8080/api/reports`
- Stop both processes: Control+C

Override occupied ports when necessary:

```bash
BACKEND_PORT=18080 FRONTEND_PORT=14173 npm start
```

### Run the backend and frontend separately

Start the Spring Boot API from one terminal:

```bash
cd backend
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd spring-boot:run`. The API is available at
`http://localhost:8080/api/reports`.

Then start the React development server from a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite forwards relative `/api` requests to the Spring Boot API on
port 8080.

## Features

- Searchable report catalog with dedicated report URLs
- Server-side row search, sorting, and pagination
- Shareable table state with browser Back/Forward support
- Loading, empty, no-match, error, and retry states
- Responsive tables with semantic markup and keyboard-operable controls
- Consistent `400`, `404`, and sanitized `500` API errors
- Configurable frontend API origin
- One-command local build and startup

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router, Vite |
| Backend | Java 17, Spring Boot 4, Spring MVC |
| Build | npm, Maven Wrapper |
| Frontend testing | Vitest, React Testing Library, MSW, axe-core |
| Backend testing | JUnit, Spring Boot Test, MockMvc |

## Architecture

```text
Browser → React page → async hook → API client → /api proxy
        → Spring controller → report service → in-memory data store
        → paginated JSON response → React table
```

### Project structure

```text
.
├── backend/
│   ├── src/main/java/com/enfos/reporting/
│   │   ├── error/             # Consistent API error responses
│   │   └── report/
│   │       ├── ReportController.java
│   │       ├── ReportService.java
│   │       ├── data/          # Deterministic in-memory data
│   │       └── model/         # Immutable response records
│   ├── src/test/              # Spring and MockMvc tests
│   ├── mvnw                   # Maven wrapper
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/               # HTTP boundary
│   │   ├── components/        # Reusable UI
│   │   ├── config/            # Report column definitions
│   │   ├── hooks/             # Async and debounce behavior
│   │   ├── pages/             # Route-level components
│   │   ├── test/              # Fixtures and mock API
│   │   └── utils/             # Display formatting
│   ├── package.json
│   └── vite.config.js
├── scripts/start.mjs           # Full-stack launcher
├── package.json                # Root command
└── README.md
```

`ReportController` translates HTTP input and output. `ReportService` owns validation, search,
sorting, and pagination. `InMemoryReportDataStore` owns fixture data. On the frontend, route
pages call a small API client through reusable async-state behavior, and one configuration-driven
`DataTable` renders every report.

Spring manages the controller, service, and data store as beans. Constructor dependency
injection makes dependencies explicit and immutable: Spring supplies the service to the
controller and the data store to the service rather than those classes constructing dependencies
with `new`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/reports` | Report catalog metadata |
| `GET` | `/api/reports/users` | Paginated Users rows |
| `GET` | `/api/reports/departments` | Paginated Departments rows |
| `GET` | `/api/reports/projects` | Paginated Projects rows |

Report-row parameters:

| Parameter | Default | Description |
| --- | --- | --- |
| `page` | `0` | Zero-based API page index |
| `size` | `5` | Rows per page, from 1 through 50 |
| `query` | empty | Case-insensitive row search |
| `sort` | Report ID field | Report-specific sort field |
| `direction` | `asc` | `asc` or `desc` |

Example:

```http
GET /api/reports/users?page=0&size=5&query=active&sort=name&direction=asc
```

```json
{
  "items": [
    {
      "userId": "USR-1001",
      "name": "Ava Patel",
      "email": "ava.patel@enfos.example",
      "role": "Administrator",
      "status": "Active",
      "createdDate": "2022-03-14"
    }
  ],
  "page": 0,
  "size": 5,
  "totalItems": 11,
  "totalPages": 3
}
```

Invalid input uses a stable error envelope. An out-of-range page returns `400 Bad Request`
instead of an empty page that contradicts `totalItems`.

## Verification

Frontend behavior and accessibility tests:

```bash
npm --prefix frontend test
```

Frontend lint and production build:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

Backend tests:

```bash
(cd backend && ./mvnw test)
```

With Spring Boot already running on port 8080, check the live backend contract:

```bash
npm --prefix frontend run test:contract
```

The contract command checks report IDs and fields; it does not start the backend or automate a
browser.

## Configuration

Local relative `/api` requests are forwarded to Spring Boot by Vite. For a separately hosted
API, build from `frontend/` with:

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

The API must allow the frontend origin or sit behind the same gateway. A broad CORS policy is
not enabled by default.

## Security considerations

- Public query parameters are validated. Page size is bounded, sort fields are allowlisted, and
  unsupported values return `400 Bad Request`.
- Unknown resources return `404`; unexpected exceptions are logged on the server while clients
  receive a sanitized `500` response without stack traces or internal details.
- The repository contains no credentials. Local `.env` files, private keys, certificate stores,
  logs, dependencies, and build output are excluded from Git; `.env.example` contains placeholders
  only. Values prefixed with `VITE_` are compiled into browser code and must never hold secrets.
- Dependency lockfiles and build wrappers are committed so local builds and automated scanners
  can reproduce the selected dependency versions.
- A permissive cross-origin policy is intentionally absent. A deployed system should explicitly
  allow only its trusted frontend origin or route traffic through one gateway.

This application ships with synthetic, non-sensitive seed data and read-only endpoints.
Authentication, authorization, TLS termination, rate limiting, and production security headers
belong at the application and deployment boundaries before the service handles real
organizational data.

## Troubleshooting

- **Port already in use:** stop older processes or use the port overrides in Quick Start.
- **Maven wrapper is not executable (macOS/Linux):** run `chmod +x backend/mvnw`.
- **Frontend dependency installation fails:** verify the Node.js version and network access,
  then run `npm --prefix frontend ci` to reproduce the locked install directly.
- **Backend fails to start:** confirm `java -version` reports Java 17 and port 8080 is free.
- **Frontend shows a retryable API error:** confirm
  `http://localhost:8080/api/reports` responds.
- **Contract check cannot connect:** start Spring Boot first; the contract script deliberately
  does not launch the application.
