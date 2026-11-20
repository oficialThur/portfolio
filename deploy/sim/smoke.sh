#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT/env/.env.sim"
BASE="https://localhost:8443/api"
JAR="/tmp/opencode/portfolio-sim-cookies.txt"
BODY="/tmp/opencode/portfolio-sim-body.json"
PASS=0
FAIL=0

# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

expect() {
  local name=$1 expected=$2 actual=$3
  if [[ "$actual" == "$expected" ]]; then
    printf 'PASS  %s\n' "$name"; PASS=$((PASS + 1))
  else
    printf 'FAIL  %s (esperado %s, veio %s)\n' "$name" "$expected" "$actual"; FAIL=$((FAIL + 1))
  fi
}

code() {
  curl -sk -o "$BODY" -w '%{http_code}' "$@"
}

echo '== API e SPA =='
expect 'GET /api/projetos' 200 "$(code "$BASE/projetos")"

HTML=$(curl -sk "https://localhost:8443/rota-inexistente")
if grep -q '<div id="root">' <<< "$HTML"; then
  printf 'PASS  fallback do SPA\n'; PASS=$((PASS + 1))
else
  printf 'FAIL  fallback do SPA\n'; FAIL=$((FAIL + 1))
fi
expect 'API 404 em JSON' 404 "$(code "$BASE/rota-inexistente")"

echo '== Auth =='
rm -f "$JAR"
LOGIN=$(jq -nc --arg e 'admin@portfolio.test' --arg p "$SIM_ADMIN_PASSWORD" '{email:$e,password:$p}')
expect 'POST /api/login' 200 "$(code -c "$JAR" -X POST "$BASE/login" -H 'Content-Type: application/json' --data-binary "$LOGIN")"
ME=$(curl -sk -b "$JAR" "$BASE/me")
if grep -q '"authenticated":true' <<< "$ME"; then
  printf 'PASS  GET /api/me autenticado\n'; PASS=$((PASS + 1))
else
  printf 'FAIL  GET /api/me autenticado\n'; FAIL=$((FAIL + 1))
fi

echo '== CRUD =='
PROJECT=$(jq -nc '{nome:"Sim DevOps",descricao:"Projeto da simulação local.",link:"https://example.com/sim",tecnologias:["React","Docker"]}')
expect 'POST /api/projetos' 201 "$(code -b "$JAR" -X POST "$BASE/projetos" -H 'Content-Type: application/json' --data-binary "$PROJECT")"
ID=$(jq -r '.id // empty' "$BODY")
expect 'DELETE /api/projetos/:id' 204 "$(code -b "$JAR" -X DELETE "$BASE/projetos/$ID")"

echo '== Contato + Mailpit =='
CONTACT=$(jq -nc '{nome:"Sim QA",sobre:"Teste",email:"sim@example.com",mensagem:"Mensagem da simulação."}')
expect 'POST /api/enviando-email' 200 "$(code -X POST "$BASE/enviando-email" -H 'Content-Type: application/json' --data-binary "$CONTACT")"

sleep 1
MAILPIT=$(curl -s http://localhost:8025/api/v1/messages)
TOTAL=$(jq -r '.total // 0' <<< "$MAILPIT" 2>/dev/null || echo 0)
if [[ "$TOTAL" -ge 1 ]]; then
  printf 'PASS  Mailpit capturou %s e-mail(s)\n' "$TOTAL"; PASS=$((PASS + 1))
else
  printf 'FAIL  Mailpit não capturou e-mail\n'; FAIL=$((FAIL + 1))
fi

echo
echo "== RESULTADO: $PASS pass, $FAIL fail =="
exit "$FAIL"
