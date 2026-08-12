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

Run the frontend tests, lint check, and production build:

```bash
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

Run the backend tests:

```bash
(cd backend && ./mvnw test)
```

With the backend running on port `8080`, verify the frontend-backend API contract:

```bash
npm --prefix frontend run test:contract
```

## Configuration

During local development, Vite forwards `/api` requests to Spring Boot. For a separately hosted
backend, configure the API URL before building the frontend:

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

## Security

The application validates API query parameters and returns sanitized error responses. It contains
synthetic data and no credentials; local environment files, private keys, dependencies, logs, and
generated build output are excluded from Git.

## Troubleshooting

- **Port already in use:** stop older processes or use the port overrides in Quick Start.
- **Backend fails to start:** confirm Java 17 is installed and port `8080` is available.
- **Frontend cannot load reports:** confirm `http://localhost:8080/api/reports` is responding.
- **Contract check cannot connect:** start the backend before running the contract command.
