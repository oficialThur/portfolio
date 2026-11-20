#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT/env/.env.sim"
BACKUP_DIR="/tmp/opencode/portfolio-sim-backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/portfolio-$STAMP.sql"
COMPOSE=(docker compose
  -f "$ROOT/docker-compose.prod.yml"
  -f "$ROOT/deploy/sim/docker-compose.sim.yml"
  --env-file "$ENV_FILE"
  -p portfolio-sim)

mkdir -p "$BACKUP_DIR"

"${COMPOSE[@]}" exec -T db sh -c \
  'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers portfolio_db' \
  > "$FILE"

echo "Backup criado: $FILE ($(du -h "$FILE" | cut -f1))"

# Teste de restore em um banco temporário, sem tocar no banco da simulação.
"${COMPOSE[@]}" exec -T db sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS portfolio_restore_test; CREATE DATABASE portfolio_restore_test;"'
"${COMPOSE[@]}" exec -T db sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" portfolio_restore_test' < "$FILE"

TABLES=$("${COMPOSE[@]}" exec -T db sh -c \
  'mysql -N -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '\''portfolio_restore_test'\'';"')
echo "Restore OK: $TABLES tabelas restauradas."

"${COMPOSE[@]}" exec -T db sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE portfolio_restore_test;"'
echo "Banco temporário de restore removido."
