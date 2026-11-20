# Deploy Azure — runbook (Azure for Students)

> **Execução real em 2026-11-20:** a assinatura Students tinha uma policy que
> permitia apenas `mexicocentral`, `northcentralus`, `eastus`, `chilecentral` e
> `canadacentral`; as VMs B-series estavam bloqueadas em Brazil South/East US.
> A VM free escolhida foi **`Standard_B2ats_v2` em Chile Central**.
> O MySQL gerenciado free não foi criado (erro interno + aviso de “Paid Tier”),
> então o fallback adotado foi **MySQL 8 no container da VM**, com swap e
> `deploy/azure/docker-compose.override.yml`.

> Caminho original: **A — free por 12 meses**.
> A VM roda backend/nginx/Caddy; o MySQL fica fora da VM quando o gerenciado
> free está disponível. A execução real usou o fallback descrito abaixo.

## Arquitetura

```
Internet
  │ 443 (Caddy + Let's Encrypt)
  ▼
Azure VM B2ats_v2 (Ubuntu 24.04, 1 GB + 2 GB swap)
  └── Docker Compose
        ├── Caddy :443 → nginx :3000
        ├── frontend (nginx + Vite)
        └── backend (Express) ──► MySQL 8 (container + volume)
```

Alternativa com banco gerenciado: trocar o MySQL do container por
`Azure Database for MySQL B1ms` e ativar `DATABASE_SSL=true`.

## Limites e custos

| Item | Limite free | Observação |
|---|---|---|
| VM `B1s` | 750 h/mês por 12 meses | 1 vCPU/1 GB; 744 h cobre 31 dias |
| MySQL `B1ms` | 750 h/mês + 32 GB por 12 meses | TLS obrigatório |
| Disco | conforme free tier | 30 GB é suficiente |
| IPv4 | pode haver cobrança pequena | crédito de US$ 100 cobre |
| SMTP | 465/587 liberadas; 25 bloqueada | Gmail funciona na 465 |
| Domínio | não incluso | DuckDNS grátis ou domínio próprio |

Após 12 meses ou crédito, a assinatura é desativada; migre para pay-as-you-go ou outro host.

## Fase 0 — Preflight (local)

- [ ] `git status` limpo e branch definida.
- [ ] `npm test` no backend: 26/26.
- [ ] `npm run lint` no frontend: 0.
- [ ] Conteúdo real: projetos, Sobre e contatos (sem placeholders).
- [ ] Admin definido; senha forte e diferente da de dev.
- [ ] `env/.env` não versionado; nenhum segredo no Git.

## Fase 1 — Recursos Azure

Instale/logue no Azure CLI (ou use o Cloud Shell):

```bash
az login
az account show
```

Variáveis:

```bash
RG=rg-portfolio
LOCATION=brazilsouth
VM=vm-portfolio
MYSQL=mysql-portfolio-<algo-unico>
ADMIN_USER=azureuser
```

### Grupo e rede

```bash
az group create --name "$RG" --location "$LOCATION"
az network nsg create --resource-group "$RG" --name nsg-portfolio

# SSH apenas do seu IP
MY_IP=$(curl -s https://api.ipify.org)
az network nsg rule create -g "$RG" --nsg-name nsg-portfolio \
  --name allow-ssh --priority 1000 --access Allow --protocol Tcp \
  --direction Inbound --source-address-prefixes "$MY_IP/32" --destination-port-ranges 22

# HTTP/HTTPS públicos
az network nsg rule create -g "$RG" --nsg-name nsg-portfolio \
  --name allow-http --priority 1010 --access Allow --protocol Tcp \
  --direction Inbound --source-address-prefixes '*' --destination-port-ranges 80
az network nsg rule create -g "$RG" --nsg-name nsg-portfolio \
  --name allow-https --priority 1020 --access Allow --protocol Tcp \
  --direction Inbound --source-address-prefixes '*' --destination-port-ranges 443
```

### VM

```bash
az vm create \
  --resource-group "$RG" --name "$VM" \
  --image Ubuntu2404 --size Standard_B1s \
  --admin-username "$ADMIN_USER" \
  --generate-ssh-keys \
  --nsg nsg-portfolio \
  --public-ip-sku Standard \
  --os-disk-size-gb 30
```

Anote o IP público:

```bash
az vm show -d -g "$RG" -n "$VM" --query publicIps -o tsv
```

> A `B1s` tem 1 GB. Crie **2 GB de swap** na VM antes de buildar imagens.
> Se a sua assinatura tiver quota para `B2ats_v2`/`B2pts_v2`, eles são 2 vCPU/1 GB (mais CPU, mesma RAM).

### MySQL free

Crie o servidor com a oferta free (confirme o SKU `Standard_B1ms` e a região no portal):

```bash
MYSQL_PASSWORD='uma-senha-forte'
az mysql flexible-server create \
  --resource-group "$RG" --name "$MYSQL" \
  --location "$LOCATION" \
  --admin-user portfolioadmin --admin-password "$MYSQL_PASSWORD" \
  --tier Burstable --sku-name Standard_B1ms \
  --storage-size 32 --version 8.0 \
  --public-access "$(az vm show -d -g "$RG" -n "$VM" --query publicIps -o tsv)"
```

Crie o banco:

```bash
az mysql flexible-server db create \
  --resource-group "$RG" --server-name "$MYSQL" \
  --database-name portfolio_db
```

> O acesso público fica restrito ao IP da VM. TLS é obrigatório.
> Se a oferta free não aparecer no portal, não continue: o caminho A perde o sentido.

## Fase 2 — Servidor

SSH:

```bash
ssh "$ADMIN_USER@<IP>"
```

Swap e dependências:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

sudo apt update
sudo apt install -y git docker.io docker-compose-v2
sudo usermod -aG docker "$USER"
# saia e entre de novo

# Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Clone e configure:

```bash
git clone <repo> portfolio
cd portfolio
git switch qa/fixes   # ou a branch que você mergear
cp env/.env.example env/.env
chmod 600 env/.env
```

No `env/.env`, ajuste:

```env
DATABASE_HOST=<server>.mysql.database.azure.com
DATABASE_PORT=3306
DATABASE_USER=portfolioadmin
DATABASE_PASSWORD=<senha>
DATABASE_NAME=portfolio_db
DATABASE_URL="mysql://portfolioadmin:<senha>@<server>.mysql.database.azure.com:3306/portfolio_db?sslaccept=strict"
DATABASE_SSL=true

SECRET_KEY=<openssl rand -hex 32>
COOKIE_SECURE=true

ADMIN_NAME=Arthur
ADMIN_EMAIL=<seu-email>
ADMIN_PASSWORD=<senha-forte>

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=<seu-email>
EMAIL_PASS=<senha-de-app>
```

### Build (sem OOM na B1s)

O ideal é buildar fora da VM (máquina local ou CI) e transferir:

```bash
# na sua máquina, no repo:
docker compose -f docker-compose.prod.yml build
docker save portfolio-prod-backend portfolio-prod-frontend | gzip > imagens.tgz
scp imagens.tgz azureuser@<IP>:/tmp/

# na VM:
gunzip -c /tmp/imagens.tgz | docker load
```

Se for buildar na VM, use swap e build um serviço por vez.

### Deploy

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs migrate
docker compose -f docker-compose.prod.yml exec -T backend npx tsx prisma/seed.js
docker compose -f docker-compose.prod.yml ps
```

Smoke:

```bash
curl -s http://127.0.0.1:3000/api/projetos | head
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
```

## Fase 3 — Domínio e TLS

Aponte o domínio/DuckDNS para o IP da VM.

Caddyfile em `/etc/caddy/Caddyfile`:

```caddyfile
seudominio.duckdns.org {
    reverse_proxy 127.0.0.1:3000
}
```

```bash
sudo systemctl reload caddy
sudo journalctl -u caddy -f
```

Teste `https://seudominio.duckdns.org`; o Caddy emite o certificado.

## Fase 4 — Aceitação

- [ ] Home carrega com o Sobre real.
- [ ] Login em `/login` funciona; cookie `HttpOnly`/`Secure`/`SameSite=Strict`.
- [ ] Criar/editar/excluir projeto; aparece na home.
- [ ] Atualizar Sobre; persiste.
- [ ] Contato envia e-mail real para `EMAIL_USER`.
- [ ] 404 amigável.
- [ ] Headers da API têm CSP/Helmet; sem `X-Powered-By`.
- [ ] Rate limit do login e do contato funcionam (e depois reinicie o backend para zerar).
- [ ] `docker compose ps` saudável; logs sem erro.

## Fase 5 — Backup e restore

Backup manual:

```bash
docker compose -f docker-compose.prod.yml exec -T db mysqldump \
  -uroot -p"$MYSQL_ROOT_PASSWORD" portfolio_db > backup-$(date +%F).sql
```

No Azure, o MySQL gerenciado já possui backups automáticos (32 GB no free). Teste um restore em um banco de homologação antes de confiar.

## Fase 6 — Rollback e incidente

1. Antes de cada deploy, tagueie as imagens:
   ```bash
   docker tag portfolio-prod-backend portfolio-prod-backend:v1
   ```
2. Suba a versão nova.
3. Se o healthcheck falhar:
   ```bash
   docker compose -f docker-compose.prod.yml logs backend
   docker tag portfolio-prod-backend:v1 portfolio-prod-backend:latest
   docker compose -f docker-compose.prod.yml up -d --force-recreate backend
   ```
4. Registre o incidente e a causa no vault/issue.

## Fase 7 — Operação

- AWS/Azure budget/alerts de crédito.
- `caddy` + `docker` com restart automático.
- Logs: `docker compose logs -f backend` e `journalctl -u caddy`.
- Atualizações: `apt upgrade`, `docker compose pull` (se usar registry).
- Monitoramento externo (UptimeRobot) em `/api/projetos`.
- Não exponha 3306/3000 no NSG.
- Rotacione segredos e faça backup antes de mudanças.

## Simulação local (sem Azure)

Use `deploy/sim`:

```bash
deploy/sim/sim-up.sh
```

- UI: https://localhost:8443 (certificado interno; o navegador avisa)
- Mailpit: http://localhost:8025
- Credenciais: `env/.env.sim`

O mesmo fluxo é ensaiado localmente antes de repetir na Azure.

## Resultado da execução real (2026-11-20)

- Resource group: `rg-portfolio-prod` em **Chile Central**.
- VM: `Standard_B2ats_v2` (2 vCPU/1 GB), Ubuntu 24.04, 30 GB, IP `68.211.145.157`.
- Domínio final: `https://devthur.dev` e `https://www.devthur.dev` (Let's Encrypt).
- MySQL: container 8.0 com volume, tuning `innodb-buffer-pool-size=128M`.
- **MySQL gerenciado free não foi usado**: a criação falhou com erro interno e
  o CLI avisou “Paid Tier”; nenhum servidor gerenciado ficou criado.
- Frontend publicado apenas em `127.0.0.1:3000`; Caddy na 443.
- Testes: home/API 200, login/cookie `Secure`/`HttpOnly`, CRUD, 404, contato real
  via Gmail, backup + restore (6 tabelas) e reboot completo.
- O reboot revelou um bug de ordem: o backend subia antes do MySQL. Correções:
  - `backend/docker-entrypoint.sh` espera o MySQL responder e ter uptime ≥ 10s;
  - `allowPublicKeyRetrieval: true` para `caching_sha2_password`;
  - `TRUST_PROXY=2` (Caddy + nginx) para o rate limit ver o IP real.
- Após as correções, o reboot sobe o backend **healthy** sem loop.
- Conteúdo ainda pendente: projetos reais e texto do Sobre.
