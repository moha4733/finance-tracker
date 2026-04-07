# Contributing Guide

Thanks for your interest in contributing to `finance-tracker`.

## 1) Before you start

- Read the README and run the project locally.
- Check existing issues before creating a new one.
- Keep contributions focused and small when possible.

## 2) Local setup

```bash
git clone <repo-url>
cd finance-tracker
bash scripts/dev-up.sh
```

Start backend:

```bash
mvn -f backend/pom.xml spring-boot:run
```

Start frontend:

```bash
npm --prefix frontend install
npm --prefix frontend run dev -- --host localhost --port 3001
```

## 3) Branch naming

Use one of these formats:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `test/<short-description>`

Examples:

- `feature/monthly-report-card`
- `fix/register-cors-error`

## 4) Coding expectations

- Keep code readable and consistent with existing style.
- Write clear, descriptive names.
- Avoid large unrelated refactors in the same PR.
- Add or update tests for behavior changes.

## 5) Required checks before PR

Backend:

```bash
mvn -f backend/pom.xml test
```

Frontend unit/integration coverage:

```bash
npm --prefix frontend run test:coverage
```

Frontend E2E:

```bash
npm --prefix frontend run test:e2e
```

Build check:

```bash
npm --prefix frontend run build
```

## 6) Pull request process

1. Fork + create branch.
2. Implement your change.
3. Run required checks.
4. Open a PR using the template.
5. Respond to review feedback.

## 7) Commit message style (recommended)

- `feat: add monthly budget chart`
- `fix: handle duplicate email validation response`
- `test: add register field error integration test`
- `docs: improve quick-start section`

## 8) Good first contributions

- UI polish and responsiveness
- Better error messages
- Missing tests
- README improvements
- Accessibility improvements
