#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT/env/.env.sim"
COMPOSE=(docker compose
  -f "$ROOT/docker-compose.prod.yml"
  -f "$ROOT/deploy/sim/docker-compose.sim.yml"
  --env-file "$ENV_FILE"
  -p portfolio-sim)

if [[ "${1:-}" == "--wipe" ]]; then
  "${COMPOSE[@]}" down -v
  rm -f "$ENV_FILE"
  echo "Simulação removida, incluindo volume e segredos."
else
  "${COMPOSE[@]}" down
  echo "Simulação parada. Volume preservado (use --wipe para apagar)."
fi
