#!/usr/bin/env bash
set -euo pipefail

echo "Stopping PostgreSQL container..."
docker compose down
