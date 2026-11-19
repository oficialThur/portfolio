# Backend — guia da API, banco e operação

Documentação do backend real do portfólio: Express 5 + Prisma 7 + MySQL 8, rodando em
Docker. O frontend (Vite + React) consome a API pelo proxy `/api` do Vite (dev) ou do
nginx (produção).

## 1. Stack e estrutura

| Item | Versão/uso |
|---|---|
| Node.js | 20 (imagem `node:20-alpine`) |
| Express | 5.x |
| Prisma | 7.x com `@prisma/adapter-mariadb` (obrigatório na v7) |
| MySQL | 8.0 |
| Autenticação | JWT (`jsonwebtoken`) em cookie `httpOnly`, 1h |
| Senhas | `bcryptjs` |
| E-mail | `nodemailer` |
| Segurança | `helmet`, `express-rate-limit`, `cookie-parser` |
| Testes | `node:test` + Supertest |

```
backend/
├── app.js            # app Express: middlewares, rotas e validações
├── server.js         # única responsabilidade: app.listen()
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── generated/prisma/ # client gerado (não editar)
└── test/             # suíte de integração
```

`app.js` exporta `{ app, prisma }` para os testes; `server.js` é o entrypoint de runtime.

## 2. Como subir

### 2.1 Desenvolvimento

```bash
docker compose -f docker-compose.dev.yml up -d --build

# primeira subida: migrations + admin
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
docker compose -f docker-compose.dev.yml exec \
  -e ADMIN_NAME=Arthur \
  -e ADMIN_EMAIL=admin@portfolio.dev \
  -e ADMIN_PASSWORD=admin123 \
  backend npx tsx prisma/seed.js
```

- Frontend: http://localhost:3000
- API: http://localhost:3001
- MySQL: `localhost:3308` (root/root por padrão)
- O `env/.env` é **opcional** no dev; sem ele valem os defaults do compose.
- O código é montado por bind mount (`./backend`, `./frontend`); `node_modules` fica em
  volume anônimo.

### 2.2 Produção

```bash
cp env/.env.example env/.env   # preencha segredos e SMTP
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend npx tsx prisma/seed.js
```

- O serviço `migrate` roda `prisma migrate deploy` antes do backend.
- O backend não publica porta; o nginx fala com `backend:4000`.
- `SECRET_KEY` é obrigatória (`NODE_ENV=production` encerra o processo sem ela).
- Defina `COOKIE_SECURE=true` quando o site estiver atrás de HTTPS.

## 3. Variáveis de ambiente

Referência completa: [`../env/.env.example`](../env/.env.example).

| Variável | Uso |
|---|---|
| `DATABASE_HOST` / `DATABASE_PORT` | Conexão do adapter (porta interna do MySQL: 3306) |
| `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` | Credenciais do app |
| `DATABASE_URL` | Usada pela CLI do Prisma (`migrate`) |
| `MYSQL_ROOT_PASSWORD` / `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD` | Container MySQL |
| `SECRET_KEY` | Assinatura do JWT |
| `COOKIE_SECURE` | `true` somente com HTTPS |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | SMTP do contato |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed do admin |
| `PORT` | Porta do Express (3001 dev, 4000 prod) |
| `VITE_API_URL` | Alvo do proxy `/api` no frontend |

O `.env` da raiz não é commitado; `env/.env.example` é o único arquivo versionado.

## 4. Banco de dados

### 4.1 Modelos

| Tabela | Campos principais |
|---|---|
| `admins` | `id`, `email` (único), `name`, `password` (hash bcrypt), `tokenVersion`, timestamps |
| `projetos` | `id`, `nome`, `descricao` (TEXT), `link` (VARCHAR 2048), `adminId`, timestamps |
| `subtitles` | `id`, `subtitle` (TEXT), `adminId`, timestamps |
| `tecnologias` | `id`, `nome` (único) |
| `projeto_tecnologias` | `projetoId` + `tecnologiaId` (PK composta, cascata) |

Relações com `onDelete: Cascade`: apagar um admin remove seus projetos/subtítulos;
apagar projeto/tecnologia remove os vínculos.

### 4.2 Migrations

```bash
# dev: cria migration a partir do schema
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name <nome>

# aplica pendentes (dev e prod)
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy

# estado atual
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate status

# regenerar o client após mudar o schema
docker compose -f docker-compose.dev.yml exec backend npx prisma generate
```

Se o comando gravar arquivos como root no bind mount, rode com
`-u 1000:1000 -e HOME=/tmp` (mesmo UID do host).

### 4.3 Seed

```bash
docker compose -f docker-compose.dev.yml exec \
  -e ADMIN_NAME=Arthur \
  -e ADMIN_EMAIL=admin@portfolio.dev \
  -e ADMIN_PASSWORD=admin123 \
  backend npx tsx prisma/seed.js
```

O seed faz `upsert` por e-mail: rodar de novo atualiza nome e senha do admin existente.
Nunca há rota de signup.

## 5. Autenticação

### 5.1 Fluxo

```
POST /login {email, password}
  → bcrypt.compare
  → JWT { id, email, ver } assinado com SECRET_KEY (exp: 1h)
  → Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600
  → 200 { msg }
```

- O token **não** vai no corpo da resposta.
- `secure` é controlado por `COOKIE_SECURE` (true só com HTTPS).
- O middleware aceita o cookie **ou** `Authorization: Bearer <jwt>` (fallback para
  CLI/integrações).
- Além da assinatura, o middleware consulta o admin e compara `ver` com
  `admins.tokenVersion`. Se não bater: `401 { msg: "Sessão expirada" }` e o cookie é
  limpo.

### 5.2 Rotas de sessão

| Rota | Comportamento |
|---|---|
| `POST /login` | `200` + cookie; `400` campos ausentes; `401` credenciais; `429` rate limit |
| `GET /me` | Sempre `200`: `{ authenticated: true, admin }` ou `{ authenticated: false }` |
| `POST /logout` | `204`; limpa o cookie e incrementa `tokenVersion` (revoga tokens antigos) |

`POST /logout` é idempotente: sem token, ainda responde `204`.

### 5.3 Rate limit

- Login: **10 falhas por IP a cada 15 min** (`skipSuccessfulRequests: true`).
- Resposta `429` com `Retry-After` e headers `RateLimit` (draft-8).
- Em produção, `app.set("trust proxy", 1)` para usar o IP real repassado pelo nginx.
- O store é em memória: reinicia com o processo e não é compartilhado entre réplicas.

## 6. API

Todas as respostas são JSON. O prefixo `/api` existe apenas no proxy do frontend.

### 6.1 Projetos

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/projetos` | — | Lista todos, mais recentes primeiro |
| `POST` | `/projetos` | ✅ | Cria |
| `PUT` | `/projetos/:id` | ✅ | Atualiza campos enviados |
| `DELETE` | `/projetos/:id` | ✅ | Remove (`204`) |

Payload de criação:

```json
{
  "nome": "Portfólio",
  "descricao": "Texto do projeto",
  "link": "https://github.com/usuario/repo",
  "tecnologias": ["React", "Node.js"]
}
```

Resposta (formato público):

```json
{
  "id": "1",
  "name": "Portfólio",
  "description": "Texto do projeto",
  "link": "https://github.com/usuario/repo",
  "tecnologias": [{ "id": "1", "name": "React" }],
  "createdAt": "...",
  "updatedAt": "..."
}
```

- `tecnologias` é obrigatório na criação (ao menos 1); duplicatas são removidas.
- `PUT` aceita qualquer subconjunto de `nome`, `descricao`, `link`, `tecnologias`.
- `PUT`/`DELETE` com ID não numérico → `400`; ID inexistente → `404`.

### 6.2 Subtítulos (texto do Sobre)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/subtitulos` | — | Lista, mais recentes primeiro |
| `POST` | `/subtitulos` | ✅ | Cria (`201`) |
| `PUT` | `/subtitulos/:id` | ✅ | Atualiza |
| `DELETE` | `/subtitulos/:id` | ✅ | Remove (`204`) |

Payload: `{ "subtitle": "Texto" }`. O frontend usa o primeiro item da lista.

### 6.3 Contato

`POST /enviando-email` (sem auth):

```json
{
  "nome": "Visitante",
  "sobre": "Assunto",
  "email": "visitante@exemplo.com",
  "mensagem": "Mensagem",
  "website": ""
}
```

- `website` é o **honeypot**: se vier preenchido, responde `200` sem enviar nada.
- Sucesso: `200 { msg, messageId }`.
- Falha de SMTP: `500 { msg: "Erro interno do servidor" }` (detalhe só no log).
- Rate limit: **5 envios/15 min por IP**.

## 7. Validação e limites

Validação manual no backend (sem zod); textos são normalizados com `trim` e rejeitados
quando não são string.

| Campo | Limite |
|---|---|
| `nome` (projeto) | 120 |
| `descricao` | 5000 |
| `link` | 2048, somente `http://` ou `https://` |
| cada tecnologia | 60 |
| `subtitle` | 2000 |
| contato `nome` / `sobre` / `mensagem` | 120 / 200 / 5000 |
| contato `email` | 254 + formato válido |
| `:id` das rotas | somente dígitos (`/^\d+$/`) |

IDs inválidos retornam `400 { msg: "ID inválido" }`.

## 8. Contrato de erros

O backend sempre responde JSON com a chave `msg`:

| Status | Quando |
|---|---|
| `400` | Campo ausente, tamanho excedido, URL/e-mail inválido, JSON malformado, ID inválido |
| `401` | Sem sessão, token inválido/expirado/revogado |
| `404` | Recurso inexistente ou rota desconhecida |
| `413` | Corpo acima do limite do `express.json` (100 kB) |
| `429` | Rate limit |
| `500` | Erro inesperado (log detalhado no servidor) |

Exemplo de JSON malformado: `400 { "msg": "JSON inválido" }`.

## 9. Segurança

- `helmet` com CSP/HSTS/nosniff/frame-options; `X-Powered-By` desabilitado.
- Cookie `httpOnly` + `SameSite=Strict`; JWT fora do alcance de JavaScript.
- Logout revoga tokens via `tokenVersion` (não é só apagar o cookie).
- Senhas com bcrypt (10 rounds no seed).
- Rate limit no login e no contato.
- Validação de URL bloqueia `javascript:`/`data:`; assunto de e-mail remove CRLF.
- Queries via Prisma (parametrizadas); nenhum SQL concatenado.
- Erros internos não vazam stack para o cliente.
- API pensada para consumo **same-origin** via proxy. Não há CORS configurado; chamadas
  de outra origem exigiriam middleware CORS explícito.

## 10. E-mail (SMTP)

Configuração em `app.js`:

```js
secure: emailPort === 465; // 465 = TLS direto; 587/25 = STARTTLS
connectionTimeout: 5000;
greetingTimeout: 5000;
socketTimeout: 10000;
```

- `from` e `to` usam `EMAIL_USER`; o visitante vai em `replyTo`.
- Sem SMTP configurado, o envio falha com erro genérico ao cliente e log no servidor.
- Gmail exige senha de app (2FA), não a senha da conta.

## 11. Testes

```bash
docker compose -f docker-compose.dev.yml exec backend npm test
```

- 26 testes de integração (`node:test` + Supertest), 6 suítes.
- Banco isolado `portfolio_test`, criado e migrado automaticamente; o nome precisa
  terminar em `_test` por segurança.
- Cobre: endpoints públicos, headers, login/cookie/logout/revogação, CRUD de projetos e
  subtítulos, validação, JSON malformado, body grande, contato/honeypot e rate limit.
- O script usa `node --import tsx` porque o client do Prisma 7 é gerado em TypeScript.

Detalhes: [`../backend/test/README.md`](../backend/test/README.md).

## 12. Operação e troubleshooting

**Ver logs**

```bash
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f backend
```

**Banco não conecta**

- Confirme `docker compose ... ps` e o healthcheck do `db`.
- No dev, o MySQL do host é `localhost:3308`; dentro da rede, `db:3306`.
- `DATABASE_PORT` é a porta **interna** (3306), não a publicada.

**Login não persiste**

- Em HTTP, `COOKIE_SECURE` precisa ser `false`.
- Atrás de HTTPS, use `true`.
- Verifique se o navegador está aceitando cookies do domínio.

**Migrations**

```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate status
```

**Porta 3000/3001/3308 ocupada**

Ajuste os mapeamentos nos compose ou pare o serviço conflitante. O MySQL dev usa 3308
justamente para evitar conflito com instâncias locais.

**Healthcheck**

Não há rota `/health`; use `GET /projetos` (200) como smoke test.

## 13. Referências

- [Express 5](https://expressjs.com/en/guide/migrating-5.html)
- [Prisma 7 + driver adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [Prisma `migrate`](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#migrate)
- [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken)
- [`express-rate-limit`](https://express-rate-limit.mintlify.app/)
- [`helmet`](https://helmetjs.github.io/)
- [Nodemailer SMTP](https://nodemailer.com/smtp/)
- [Node.js `node:test`](https://nodejs.org/api/test.html)
- [Supertest](https://github.com/ladjs/supertest)
