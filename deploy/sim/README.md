# Simulação local de produção (Azure path A)

Este ambiente ensaia o runbook de [`docs/DEPLOY_AZURE.md`](../../docs/DEPLOY_AZURE.md)
sem criar recursos na Azure.

## O que sobe

| Serviço | Endereço |
|---|---|
| Portfólio (Caddy + TLS interno) | https://localhost:8443 |
| Mailpit (captura de e-mails) | http://localhost:8025 |
| MySQL | interno ao Compose |
| Admin | `admin@portfolio.test` |

Os segredos são gerados em `env/.env.sim` (ignorado pelo Git).

## Comandos

```bash
deploy/sim/sim-up.sh      # build + migrate + seed + healthcheck
deploy/sim/smoke.sh       # smoke test da API/SPA/auth/contato/Mailpit
deploy/sim/backup.sh      # mysqldump + restore em banco temporário
deploy/sim/sim-down.sh    # para (preserva volume)
deploy/sim/sim-down.sh --wipe  # remove containers, volume e segredos
```

## Por que Caddy em :8443?

O nginx do host já usa a porta 80. O Caddy usa `tls internal`, então o
navegador mostrará um aviso de certificado; isso é esperado no staging.
Em produção, o Caddy emite Let's Encrypt normalmente.

Para confiar no certificado local:

```bash
docker compose -f docker-compose.prod.yml -f deploy/sim/docker-compose.sim.yml \
  --env-file env/.env.sim -p portfolio-sim \
  cp caddy:/data/caddy/pki/authorities/local/root.crt /tmp/portfolio-sim-ca.crt
# importe /tmp/portfolio-sim-ca.crt como autoridade no navegador/SO
```

## O que isso ensaia do runbook Azure

- imagens de produção e `npm start`;
- migrations automáticas no serviço `migrate`;
- seed do admin;
- healthcheck do backend;
- proxy reverso com TLS;
- envio de e-mail real (capturado pelo Mailpit);
- backup e restore;
- deploy isolado por projeto/volume, sem tocar no ambiente de dev.
