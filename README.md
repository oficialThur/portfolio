# Portfólio — Arthur Henrique

Portfólio pessoal de desenvolvedor fullstack, com experiência pública em navegação
espacial (Sobre → Projetos → Contato) e uma área administrativa para gerenciar o texto
do Sobre e os projetos.

**Site:** https://devthur.dev

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | Vite 6 · React 19 · React Router 7 · Tailwind CSS 4 · zod 4 · axios |
| Backend | Node.js 20 · Express 5 · Prisma 7 + adapter MariaDB · MySQL 8 |
| Autenticação | JWT em cookie `httpOnly` (1h), logout com revogação por `tokenVersion` |
| E-mail | Nodemailer (SMTP) com honeypot, rate limit e timeouts |
| Infra | Docker multi-stage · nginx (SPA + proxy `/api`) · MySQL 8 |

## Estrutura

```
.
├── backend/
│   ├── app.js              # rotas, middlewares e regras de negócio
│   ├── server.js           # sobe o servidor (listen)
│   ├── prisma/             # schema, migrations e seed
│   └── test/               # suíte de integração (node:test + Supertest)
├── frontend/
│   └── src/                # páginas, componentes, serviços e estilos
├── Dockerfile              # targets: dev e produção (frontend/backend)
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── env/.env.example
└── docs/BACKEND.md         # guia detalhado da API e do banco
```

## Rodando em desenvolvimento

Pré-requisitos: Docker e Docker Compose.

```bash
git clone <repo>
cd portfolio

# Opcional no dev: sem este arquivo o compose usa root/root e uma SECRET_KEY de dev.
cp env/.env.example env/.env

docker compose -f docker-compose.dev.yml up -d --build
```

Na primeira subida, aplique as migrations e crie o admin:

```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy

docker compose -f docker-compose.dev.yml exec \
  -e ADMIN_NAME=Arthur \
  -e ADMIN_EMAIL=admin@portfolio.dev \
  -e ADMIN_PASSWORD=admin123 \
  backend npx tsx prisma/seed.js
```

Serviços:

| Serviço | URL |
|---|---|
| Portfólio | http://localhost:3000 |
| API (direta) | http://localhost:3001 |
| MySQL | `localhost:3308` (root/root por padrão) |
| Admin | http://localhost:3000/login |

> Troque a senha do exemplo. O seed é idempotente: rodar de novo atualiza nome e senha
> do admin existente.

## Rodando em produção

```bash
cp env/.env.example env/.env
# Edite: SECRET_KEY, senhas do MySQL, DATABASE_*, SMTP e ADMIN_*.

docker compose -f docker-compose.prod.yml up -d --build
```

O serviço `migrate` roda `prisma migrate deploy` antes de o backend subir. Depois, crie
o admin uma única vez:

```bash
docker compose -f docker-compose.prod.yml exec backend npx tsx prisma/seed.js
```

A aplicação fica em `http://localhost:3000`. Se for publicar atrás de HTTPS, defina
`COOKIE_SECURE=true` no `env/.env` **antes** de subir — sem isso o navegador descarta o
cookie de sessão em conexões HTTP.

```bash
# Parar sem apagar o banco (volume preservado)
docker compose -f docker-compose.prod.yml down

# Parar e apagar os dados
docker compose -f docker-compose.prod.yml down -v
```

## Variáveis de ambiente

O arquivo completo e comentado está em [`env/.env.example`](env/.env.example).

| Grupo | Variáveis |
|---|---|
| Banco (app) | `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` |
| Banco (CLI) | `DATABASE_URL` — usada por `prisma migrate` |
| Container MySQL | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` |
| Sessão | `SECRET_KEY`, `COOKIE_SECURE` |
| SMTP | `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` |
| Seed | `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| Frontend (build/dev) | `VITE_API_URL` |

Em produção, `SECRET_KEY` é obrigatória (o processo encerra sem ela). No dev existe um
fallback previsível para o projeto subir do zero.

## Scripts

Backend (dentro de `backend/` ou via `docker compose exec backend`):

```bash
npm start                  # produção (tsx server.js)
npm run dev                # desenvolvimento (tsx watch server.js)
npm test                   # 26 testes de integração
```

Frontend:

```bash
npm run dev                # Vite
npm run build              # build de produção
npm run lint               # ESLint (0 erros)
```

Testes do backend:

```bash
docker compose -f docker-compose.dev.yml exec backend npm test
```

A suíte usa um banco separado (`portfolio_test`), criado e migrado automaticamente; o
banco de desenvolvimento não é tocado. Detalhes em
[`backend/test/README.md`](backend/test/README.md).

## API

Todas as rotas são servidas sob `/api` pelo nginx/Vite proxy (o Express não usa prefixo).
A documentação completa — payloads, limites, códigos de erro, autenticação e banco — está
em [`docs/BACKEND.md`](docs/BACKEND.md).

Resumo:

| Método | Rota | Auth | Uso |
|---|---|---|---|
| `POST` | `/login` | — | Login (cookie `httpOnly`) |
| `GET` | `/me` | cookie/Bearer | Sessão atual |
| `POST` | `/logout` | cookie/Bearer | Revoga a sessão |
| `GET` | `/projetos` | — | Lista pública de projetos |
| `POST` | `/projetos` | ✅ | Cria projeto |
| `PUT` | `/projetos/:id` | ✅ | Atualiza projeto |
| `DELETE` | `/projetos/:id` | ✅ | Remove projeto |
| `GET` | `/subtitulos` | — | Lista textos do Sobre |
| `POST` | `/subtitulos` | ✅ | Cria texto |
| `PUT` | `/subtitulos/:id` | ✅ | Atualiza texto |
| `DELETE` | `/subtitulos/:id` | ✅ | Remove texto |
| `POST` | `/enviando-email` | — | Formulário de contato |

## Segurança

- Sessão em cookie `httpOnly` + `SameSite=Strict`; o JWT nunca fica no `localStorage`.
- `POST /logout` incrementa `tokenVersion` e invalida tokens já emitidos.
- `helmet` (CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, etc.) e
  `X-Powered-By` desabilitado.
- Rate limit: login 10 falhas/15 min por IP; contato 5 envios/15 min por IP.
- Validação de tamanho, URL `http(s)` e e-mail no backend; mensagens de erro genéricas.
- Honeypot no formulário de contato e timeouts no SMTP.
- `npm audit`: 0 vulnerabilidades no backend e no frontend (nov/2026).

## Limitações conhecidas

- Os rate limits usam memória do processo: zeram ao reiniciar e não são compartilhados
  entre réplicas. Para escalar, troque por um store Redis.
- HTTPS não está incluído no compose; use um proxy TLS à frente e `COOKIE_SECURE=true`.
- O frontend não tem testes unitários; a cobertura automatizada hoje é a suíte de
  integração do backend + os fluxos E2E manuais usados no QA.
- O MySQL de desenvolvimento é publicado na porta **3308** para não conflitar com outros
  MySQL locais.

## Documentação

- [`docs/BACKEND.md`](docs/BACKEND.md) — guia da API, banco, autenticação, validação,
  testes e operação.
- [`PRODUCT.md`](PRODUCT.md) — contexto e princípios do produto.
- [`backend/test/README.md`](backend/test/README.md) — como rodar e o que a suíte cobre.
