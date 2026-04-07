#!/usr/bin/env bash
set -euo pipefail

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "Starting PostgreSQL via Docker..."
docker compose up -d postgres

echo ""
echo "Next step:"
echo "  1) Backend:  mvn -f backend/pom.xml spring-boot:run"
echo "  2) Frontend: npm --prefix frontend install && npm --prefix frontend run dev -- --host localhost --port 3001"
