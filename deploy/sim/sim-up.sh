#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT/env/.env.sim"
COMPOSE=(docker compose
  -f "$ROOT/docker-compose.prod.yml"
  -f "$ROOT/deploy/sim/docker-compose.sim.yml"
  --env-file "$ENV_FILE"
  -p portfolio-sim)

if [[ ! -f "$ENV_FILE" ]]; then
  umask 077
  cat > "$ENV_FILE" <<EOF
SIM_DB_PASSWORD=$(openssl rand -hex 24)
SIM_ROOT_PASSWORD=$(openssl rand -hex 24)
SIM_SECRET_KEY=$(openssl rand -hex 32)
SIM_ADMIN_PASSWORD=$(openssl rand -hex 16)
EOF
  chmod 600 "$ENV_FILE"
  echo "Segredos de simulação criados em $ENV_FILE"
fi

"${COMPOSE[@]}" up -d --build

echo "Aguardando o backend ficar saudável..."
for _ in $(seq 1 60); do
  status="$(docker inspect --format '{{.State.Health.Status}}' portfolio-backend-sim 2>/dev/null || echo starting)"
  if [[ "$status" == "healthy" ]]; then
    break
  fi
  sleep 2
done

if [[ "$(docker inspect --format '{{.State.Health.Status}}' portfolio-backend-sim 2>/dev/null || true)" != "healthy" ]]; then
  echo "Backend não ficou saudável. Logs:"
  "${COMPOSE[@]}" logs --tail=80 backend migrate
  exit 1
fi

"${COMPOSE[@]}" exec -T backend npx tsx prisma/seed.js

echo
echo "Simulação no ar:"
echo "  UI:      https://localhost:8443  (certificado interno; aceite o aviso)"
echo "  Mailpit: http://localhost:8025"
echo "  Admin:   admin@portfolio.test"
echo "  Senha:   veja SIM_ADMIN_PASSWORD em $ENV_FILE"
