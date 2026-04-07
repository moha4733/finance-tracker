# Finance Tracker

Full-stack hobby project for personal finance tracking (Spring Boot + React/Vite).

## Features

- JWT authentication (`register/login`)
- Category + transaction CRUD
- Dashboard with:
  - totals (income/expense/balance)
  - filtering (month/type/category)
  - pagination
  - optimistic UI updates
  - toast notifications
  - field-level validation errors
- Modern dark UI inspired by Linear-style design language

## Tech Stack

- **Backend:** Java 21, Spring Boot 3, Spring Security, JPA, PostgreSQL
- **Frontend:** React 18, Vite, React Router, Axios
- **Testing:** Vitest + Testing Library, Playwright, JUnit

## Project Structure

- `backend/` Spring Boot API
- `frontend/` React app
- `CONTRIBUTING.md` contribution workflow and standards

## Quick Start (5 minutes)

### 1) Requirements

- Java 21+
- Node.js 18+
- Maven
- Docker Desktop (or Docker Engine)

### 2) Clone and bootstrap

```bash
git clone <your-repo-url>
cd finance-tracker
bash scripts/dev-up.sh
```

This will:

- create `.env` from `.env.example` (first run only)
- start PostgreSQL with Docker

### 3) Start backend (Terminal A)

```bash
mvn -f backend/pom.xml spring-boot:run
```

Backend: `http://localhost:8080`

### 4) Start frontend (Terminal B)

```bash
npm --prefix frontend install
npm --prefix frontend run dev -- --host localhost --port 3001
```

Frontend: `http://localhost:3001`

### 5) Stop local environment

```bash
bash scripts/dev-down.sh
```

## Environment Variables

Copy `.env.example` to `.env` and adjust if needed:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (Docker DB)
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (backend DB connection)
- `JWT_SECRET` (JWT signing key)

## Testing

### Backend tests

```bash
mvn -f backend/pom.xml test
```

Jacoco report generated at:

- `backend/target/site/jacoco/index.html`

### Frontend unit + integration + coverage

```bash
npm --prefix frontend run test:coverage
```

Coverage report generated at:

- `frontend/coverage/index.html`

### Frontend E2E (Playwright)

Install browser (first time):

```bash
PLAYWRIGHT_BROWSERS_PATH=0 npm --prefix frontend exec playwright install chromium
```

Run E2E:

```bash
npm --prefix frontend run test:e2e
```

## Current Coverage Notes

- Frontend coverage threshold is configured to minimum 70%.
- Backend has Jacoco report enabled (reporting set up and running in test phase).
- E2E tests run with Playwright against `/register` validation flow.

## Portfolio Checklist

To make this repo recruiter-friendly:

- Keep this README updated with screenshots/demo URL
- Add GitHub Actions for backend + frontend tests
- Pin this repo on your GitHub profile
- Add "What I learned" section after each major milestone

## Contributing

Contributions are welcome.  
Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening issues or pull requests.
