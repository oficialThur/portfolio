# Backend — Guia de Implementação

Autenticação do admin, CRUD de projetos e envio de e-mail, implementados sobre o que já existe neste projeto.

**Stack:** Next.js 16.3 (App Router) · React 19 · TypeScript · Node 24 · **Prisma 7.9 + MySQL**

> Duas armadilhas de versão que invalidam a maior parte dos tutoriais que você vai
> encontrar por aí:
>
> 1. **Prisma 7 exige driver adapter.** `new PrismaClient()` sem `adapter` lança erro.
>    Para MySQL o pacote é `@prisma/adapter-mariadb` (o adapter declara
>    `provider = 'mysql'` e serve para MySQL e MariaDB).
> 2. **No Next.js 16 o `middleware.ts` virou `proxy.ts`**, com a função exportada
>    renomeada para `proxy`, e o runtime edge deixou de ser suportado ali.
>
> Versões confirmadas no npm em 2026-08-16: `prisma@7.9.1`, `@prisma/client@7.9.1`,
> `@prisma/adapter-mariadb@7.9.1`.

## 1. O que já existe

| Arquivo | Estado |
|---|---|
| `src/app/api/auth/login/route.ts` | Stub — `POST` retorna 501 |
| `src/app/api/projects/route.ts` | Stub — `GET`/`POST` retornam 501 |
| `src/app/api/projects/[id]/route.ts` | Stub — `GET`/`PUT`/`DELETE` retornam 501 |
| `src/app/admin/login/page.tsx` | Stub visual, já com `robots: noindex` |
| `src/app/admin/page.tsx` | Stub visual, já com `robots: noindex` |
| `src/data/projects.ts` | Tipo `Project` + array estático (1 placeholder) |
| `src/components/portfolio/Contact.tsx` | Formulário pronto, `onSubmit` vazio de propósito |

O contrato que o front já consome — e que o banco precisa alimentar:

```ts
export type Project = {
  name: string;
  description: string;
  stack: string[];
  year: number;
  status?: string;
  link?: string;
  /** Rótulo do link (padrão: "GitHub"). */
  linkLabel?: string;
};
```

O `docs/Arquitetura.drawio` modela `Post` com Nome, Descrição, Link e `AdminId`, mas
**não tem `year` nem `status`**, que o front já usa. O schema da seção 3 reconcilia os dois.

## 2. Instalação e configuração

### 2.1 Pacotes

```bash
npm i @prisma/client @prisma/adapter-mariadb server-only
npm i -D prisma tsx
```

O `@prisma/adapter-mariadb` é o driver adapter oficial para MySQL. O `server-only` faz o
build **falhar** se um componente cliente importar um módulo com segredos — é a rede de
segurança contra vazar credenciais para o browser.

### 2.2 MySQL local

Se ainda não tem um MySQL rodando, o caminho mais rápido é Docker:

```bash
docker run --name portfolio-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=portfolio \
  -p 3306:3306 -d mysql:8
```

### 2.3 Variáveis de ambiente

Em `.env.local` (o `.gitignore` já cobre `.env*`):

```bash
# Banco — a URL é usada pelas migrations (prisma.config.ts)
DATABASE_URL="mysql://root:root@localhost:3306/portfolio"

# ...e os campos separados, usados pelo driver adapter em runtime
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=portfolio

# Sessão
SESSION_COOKIE_NAME=admin_session
SESSION_TTL_HOURS=168

# SMTP (formulário de contato)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=seu-email@gmail.com
SMTP_PASS=senha-de-app-de-16-caracteres
CONTACT_TO=seu-email@gmail.com
```

Nenhuma dessas leva prefixo `NEXT_PUBLIC_` — isso as exporia ao browser. Em produção,
cadastre no painel da hospedagem.

### 2.4 `prisma.config.ts`

Na raiz do projeto. **Novidade da v7:** a URL do banco para migrations mora aqui, não
mais no `schema.prisma`.

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### 2.5 Script de geração

Adicione ao `package.json` para que o client seja gerado após cada `npm install`
(essencial em deploy):

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

E acrescente ao `.gitignore`:

```
# prisma
/src/generated/prisma
```

## 3. Schema

`prisma/schema.prisma`. Note o generator `prisma-client` (o novo da v7) com
`importFileExtension = ""`, necessário para o bundler do Next resolver os imports:

```prisma
generator client {
  provider            = "prisma-client"
  output              = "../src/generated/prisma"
  importFileExtension = ""
}

datasource db {
  provider = "mysql"
}

model Admin {
  id           Int      @id @default(autoincrement())
  email        String   @unique @db.VarChar(191)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at")

  projects Project[]
  sessions Session[]

  @@map("admin")
}

model Session {
  tokenHash String   @id @map("token_hash") @db.VarChar(64)
  adminId   Int      @map("admin_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  admin Admin @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([expiresAt])
  @@map("session")
}

model Project {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(191)
  description String   @db.Text
  year        Int
  status      String?  @db.VarChar(60)
  link        String?  @db.VarChar(500)
  linkLabel   String?  @map("link_label") @db.VarChar(60)
  position    Int      @default(0)
  adminId     Int      @map("admin_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  admin        Admin        @relation(fields: [adminId], references: [id], onDelete: Cascade)
  technologies Technology[]

  @@index([position])
  @@map("project")
}

model Technology {
  id   Int    @id @default(autoincrement())
  name String @unique @db.VarChar(60)

  projects Project[]

  @@map("technology")
}
```

Três decisões que valem explicação:

**Many-to-many implícito.** `technologies Technology[]` de um lado e `projects Project[]`
do outro — o Prisma cria e gerencia a tabela de junção sozinho (equivalente ao seu
`Post_Tecnologias`). Se um dia quiser controlar a junção (adicionar uma coluna de ordem,
por exemplo), declare um model explícito `ProjectTechnology`.

**`@db.VarChar(191)` em campos únicos.** Em MySQL com `utf8mb4` cada caractere ocupa até
4 bytes e o índice tem limite de tamanho — 191 é o maior valor seguro para uma coluna
`VARCHAR` indexada. É o padrão do Prisma para MySQL.

**`@map` em tudo.** Mantém `snake_case` no banco (convenção SQL) e `camelCase` no
TypeScript, sem tradução manual.

Aplique:

```bash
npx prisma migrate dev --name init
```

## 4. Client e camada de dados

### 4.1 Singleton

`src/server/db.ts`. O singleton importa porque em dev o Next recarrega módulos a cada
edição — sem ele, o pool de conexões se esgota em minutos:

```ts
import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/src/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // Na v7 o adapter é obrigatório: new PrismaClient() sem ele lança erro.
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 4.2 Repositório

`src/server/repositories/projects.ts`. Concentrar as queries aqui mantém as rotas
legíveis e faz a tradução `Project do banco` → `Project do front` acontecer num lugar só:

```ts
import "server-only";
import { prisma } from "../db";
import type { Project } from "@/src/data/projects";

export type ProjectRecord = Project & { id: number };

export type ProjectInput = {
  name: string;
  description: string;
  year: number;
  stack: string[];
  status?: string;
  link?: string;
  linkLabel?: string;
};

const withTechnologies = {
  technologies: { select: { name: true }, orderBy: { name: "asc" } },
} as const;

type Row = {
  id: number;
  name: string;
  description: string;
  year: number;
  status: string | null;
  link: string | null;
  linkLabel: string | null;
  technologies: { name: string }[];
};

function toProject(row: Row): ProjectRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    year: row.year,
    stack: row.technologies.map((t) => t.name),
    // Campos opcionais só entram se existirem — o front checa por ausência.
    ...(row.status ? { status: row.status } : {}),
    ...(row.link ? { link: row.link } : {}),
    ...(row.linkLabel ? { linkLabel: row.linkLabel } : {}),
  };
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const rows = await prisma.project.findMany({
    include: withTechnologies,
    orderBy: [{ position: "asc" }, { year: "desc" }],
  });
  return rows.map(toProject);
}

// connectOrCreate: reaproveita a tecnologia se já existir, cria se não.
const connectStack = (stack: string[]) => ({
  connectOrCreate: stack.map((name) => ({ where: { name }, create: { name } })),
});

export async function createProject(input: ProjectInput, adminId: number) {
  const created = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      year: input.year,
      status: input.status ?? null,
      link: input.link ?? null,
      linkLabel: input.linkLabel ?? null,
      adminId,
      technologies: connectStack(input.stack),
    },
    include: withTechnologies,
  });
  return toProject(created);
}

export async function updateProject(id: number, input: ProjectInput) {
  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      year: input.year,
      status: input.status ?? null,
      link: input.link ?? null,
      linkLabel: input.linkLabel ?? null,
      // set: [] desfaz os vínculos antigos antes de reconectar os novos.
      technologies: { set: [], ...connectStack(input.stack) },
    },
    include: withTechnologies,
  });
  return toProject(updated);
}

export async function deleteProject(id: number) {
  await prisma.project.delete({ where: { id } });
}
```

Quando um `id` não existe, `update` e `delete` lançam erro com `code: "P2025"` — é assim
que as rotas devolvem 404 na seção 7.

## 5. Autenticação

### 5.1 Por que sessão opaca e não JWT

Para um admin de um usuário só, **token opaco guardado no banco** é mais simples e mais
seguro que JWT: dá para revogar (logout de verdade), não precisa de biblioteca, e não
existe o risco clássico de configurar o algoritmo errado. JWT compensa quando vários
serviços precisam validar o token sem consultar o banco — não é o caso aqui.

```
login → verifica senha (scrypt) → gera token aleatório de 32 bytes
      → grava SHA-256(token) no banco → devolve o token em cookie httpOnly
requisição → lê cookie → SHA-256 → busca no banco → sessão válida?
```

Guardar o **hash** do token (nunca o token) é a mesma lógica de guardar senhas com hash:
mesmo que alguém leia o banco, não consegue se passar por você.

### 5.2 Hash de senha

`src/server/auth/password.ts`, com `node:crypto` puro — scrypt é memory-hard e vem no
Node, sem dependência:

```ts
import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;
const PARAMS = { N: 16384, r: 8, p: 1 } as const;

export function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEYLEN, PARAMS, (err, key) => {
      if (err) reject(err);
      else resolve(`scrypt$${salt.toString("hex")}$${key.toString("hex")}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return Promise.resolve(false);

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");

  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, expected.length, PARAMS, (err, key) => {
      if (err) reject(err);
      // timingSafeEqual: comparar em tempo constante impede que se descubra
      // a senha medindo o tempo de resposta.
      else resolve(timingSafeEqual(key, expected));
    });
  });
}
```

### 5.3 Sessão

`src/server/auth/session.ts`. Atenção: **`cookies()` é assíncrono** no App Router.

```ts
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "../db";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "admin_session";
const TTL_MS = Number(process.env.SESSION_TTL_HOURS ?? 168) * 60 * 60 * 1000;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function createSession(adminId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MS);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), adminId, expiresAt },
  });

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,                                 // invisível para JS — barra XSS
    secure: process.env.NODE_ENV === "production",  // só HTTPS em produção
    sameSite: "lax",                                // barra CSRF em POST cross-site
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(): Promise<{ adminId: number } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
    select: { adminId: true },
  });

  return session ?? null;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    await prisma.session
      .delete({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});   // já expirada ou removida: nada a fazer
  }
  store.delete(COOKIE);
}
```

### 5.4 Criando o seu usuário admin

Não faça rota de signup — é um portfólio, existe um usuário só. Use o seed do Prisma em
`prisma/seed.ts`:

```ts
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/server/auth/password";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD antes de rodar o seed.");
}

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});
const prisma = new PrismaClient({ adapter });

const passwordHash = await hashPassword(password);
await prisma.admin.upsert({
  where: { email: email.toLowerCase() },
  update: { passwordHash },
  create: { email: email.toLowerCase(), passwordHash },
});

console.log(`Admin ${email} pronto.`);
```

Rode uma vez com as variáveis na linha de comando, para a senha não ficar em arquivo nenhum:

```bash
ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD='senha-forte' npx prisma db seed
```

### 5.5 Protegendo as rotas — `proxy.ts`, não `middleware.ts`

**Mudança do Next.js 16:** o arquivo `middleware.ts` virou `proxy.ts` e a função exportada
agora se chama `proxy`. O runtime é sempre Node (edge deixou de ser suportado). Crie
`proxy.ts` na raiz:

```ts
import { NextResponse, type NextRequest } from "next/server";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "admin_session";

export function proxy(request: NextRequest) {
  const hasCookie = Boolean(request.cookies.get(COOKIE)?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (pathname === "/admin/login" && hasCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

**Isto é uma checagem otimista, não a sua segurança.** A documentação do Next é explícita:
o proxy só deve verificar a *presença* do cookie (ele roda em toda navegação, inclusive
prefetch — consultar banco ali derruba a performance). A validação real acontece em cada
rota protegida. Por isso **toda** rota de escrita começa com:

```ts
const session = await getSession();
if (!session) return Response.json({ error: "Não autorizado." }, { status: 401 });
```

### 5.6 Rota de login

Substitua o stub em `src/app/api/auth/login/route.ts`:

```ts
import { prisma } from "@/src/server/db";
import { verifyPassword } from "@/src/server/auth/password";
import { createSession } from "@/src/server/auth/session";

const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string, max = 5, windowMs = 15 * 60_000) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return Response.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { email, password } = body;

  if (typeof email !== "string" || typeof password !== "string") {
    return Response.json({ error: "Credenciais inválidas." }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, passwordHash: true },
  });

  // Mensagem idêntica para e-mail inexistente e senha errada: não entregue
  // a um atacante a informação de que aquele e-mail existe.
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return Response.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  await createSession(admin.id);
  return Response.json({ ok: true });
}
```

Crie também `src/app/api/auth/logout/route.ts` com um `POST` que chama `destroySession()`.

## 6. Validação

`src/server/validation.ts` — devolve todos os erros de uma vez, que é o que o formulário
do admin precisa para mostrar mensagem por campo:

```ts
import type { ProjectInput } from "./repositories/projects";

export function validateProject(data: unknown) {
  const errors: Record<string, string> = {};
  const d = (data ?? {}) as Record<string, unknown>;

  if (typeof d.name !== "string" || d.name.trim().length < 2) {
    errors.name = "Nome deve ter ao menos 2 caracteres.";
  }
  if (typeof d.description !== "string" || d.description.trim().length < 10) {
    errors.description = "Descrição deve ter ao menos 10 caracteres.";
  }
  if (typeof d.year !== "number" || !Number.isInteger(d.year) || d.year < 2000) {
    errors.year = "Ano inválido.";
  }
  if (!Array.isArray(d.stack) || d.stack.some((t) => typeof t !== "string")) {
    errors.stack = "Stack deve ser uma lista de textos.";
  }
  if (d.link !== undefined && d.link !== "") {
    try {
      const url = new URL(String(d.link));
      // Bloqueia javascript: e data:, que viram XSS ao virar href no front.
      if (!["http:", "https:"].includes(url.protocol)) errors.link = "Link inválido.";
    } catch {
      errors.link = "Link inválido.";
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false as const, errors };
  return { ok: true as const, value: d as unknown as ProjectInput };
}
```

O Prisma valida *tipos*, não *regras de negócio* — ele impede um `year: "abc"`, mas aceita
`year: -5` e descrição vazia. Esta camada é o que garante que o dado faz sentido.

## 7. CRUD de projetos

### 7.1 Coleção — `src/app/api/projects/route.ts`

```ts
import { revalidatePath } from "next/cache";
import { getSession } from "@/src/server/auth/session";
import { listProjects, createProject } from "@/src/server/repositories/projects";
import { validateProject } from "@/src/server/validation";

export async function GET() {
  return Response.json({ projects: await listProjects() });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const result = validateProject(await request.json().catch(() => null));
  if (!result.ok) return Response.json({ errors: result.errors }, { status: 422 });

  const project = await createProject(result.value, session.adminId);
  revalidatePath("/");   // o portfólio público reflete a mudança na hora
  return Response.json({ project }, { status: 201 });
}
```

### 7.2 Item — `src/app/api/projects/[id]/route.ts`

**Atenção:** desde o Next 15, `params` é uma **Promise** e precisa de `await`.

```ts
import { revalidatePath } from "next/cache";
import { getSession } from "@/src/server/auth/session";
import { updateProject, deleteProject } from "@/src/server/repositories/projects";
import { validateProject } from "@/src/server/validation";

type Context = { params: Promise<{ id: string }> };

// P2025 é o código do Prisma para "registro não encontrado".
const isNotFound = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error &&
  (error as { code: unknown }).code === "P2025";

export async function PUT(request: Request, { params }: Context) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "ID inválido." }, { status: 400 });
  }

  const result = validateProject(await request.json().catch(() => null));
  if (!result.ok) return Response.json({ errors: result.errors }, { status: 422 });

  try {
    const project = await updateProject(id, result.value);
    revalidatePath("/");
    return Response.json({ project });
  } catch (error) {
    if (isNotFound(error)) {
      return Response.json({ error: "Projeto não encontrado." }, { status: 404 });
    }
    console.error("Falha ao atualizar projeto:", error);
    return Response.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const id = Number((await params).id);

  try {
    await deleteProject(id);
    revalidatePath("/");
    return new Response(null, { status: 204 });
  } catch (error) {
    if (isNotFound(error)) {
      return Response.json({ error: "Projeto não encontrado." }, { status: 404 });
    }
    console.error("Falha ao remover projeto:", error);
    return Response.json({ error: "Erro interno." }, { status: 500 });
  }
}
```

### 7.3 Ligando o portfólio público ao banco

Hoje `Projects.tsx` importa o array estático. Para ler do banco, ele vira um Server
Component assíncrono:

```tsx
import { listProjects } from "@/src/server/repositories/projects";
import { projects as fallback } from "@/src/data/projects";

export async function Projects() {
  const fromDb = await listProjects();
  const projects = fromDb.length > 0 ? fromDb : fallback;
  // ...resto do componente igual
}
```

Uma sutileza da nossa arquitetura que costuma confundir: `Projects` é passado como *prop*
(`node`) para o `SpatialContainer`, que é um Client Component. **Isso funciona** — o React
renderiza o Server Component antes e entrega o resultado já pronto. O que **não**
funcionaria seria o `SpatialContainer` importar `Projects` diretamente.

## 8. Envio de e-mail do contato

### 8.1 Transporte

```bash
npm i nodemailer && npm i -D @types/nodemailer
```

`src/server/mailer.ts`:

```ts
import "server-only";
import nodemailer from "nodemailer";

const globalForMail = globalThis as unknown as {
  transporter?: nodemailer.Transporter;
};

// Uma instância só: cada createTransport abre conexões novas.
export const transporter =
  globalForMail.transporter ??
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

if (process.env.NODE_ENV !== "production") globalForMail.transporter = transporter;
```

Com Gmail é obrigatório ativar a verificação em duas etapas e gerar uma **senha de app**
de 16 caracteres — a senha normal da conta não passa no SMTP.

### 8.2 Rota — `src/app/api/contact/route.ts`

```ts
import { transporter } from "@/src/server/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recent = new Map<string, number>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (Date.now() - (recent.get(ip) ?? 0) < 60_000) {
    return Response.json({ error: "Aguarde um minuto." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { nome, email, mensagem, website } = body;

  // Honeypot: campo escondido no form. Bot preenche, humano não.
  if (website) return Response.json({ ok: true });

  const errors: Record<string, string> = {};
  if (typeof nome !== "string" || nome.trim().length < 2) errors.nome = "Informe seu nome.";
  if (typeof email !== "string" || !EMAIL_RE.test(email)) errors.email = "E-mail inválido.";
  if (typeof mensagem !== "string" || mensagem.trim().length < 10) {
    errors.mensagem = "Mensagem muito curta.";
  }
  if (Object.keys(errors).length > 0) return Response.json({ errors }, { status: 422 });

  try {
    await transporter.sendMail({
      from: `"Portfólio" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO,
      replyTo: `${nome} <${email}>`,   // responder vai direto ao visitante
      subject: `Contato do portfólio — ${nome}`,
      text: `De: ${nome} <${email}>\n\n${mensagem}`,
    });
  } catch (error) {
    console.error("Falha no envio:", error);       // detalhe fica no log
    return Response.json({ error: "Não foi possível enviar." }, { status: 502 });
  }

  recent.set(ip, Date.now());
  return Response.json({ ok: true });
}
```

Três detalhes que importam: o `from` precisa ser o **seu** endereço (usar o do visitante
derruba o e-mail em spam por falha de SPF/DKIM) — a identidade dele vai no `replyTo`; o
erro real vai só para o log; e o honeypot exige um input escondido no formulário
(`name="website"`, com `tabIndex={-1}` e `aria-hidden`).

### 8.3 Ligando o formulário

Em `Contact.tsx`, troque o `onSubmit` vazio por um handler com estado
(`idle | sending | sent | error`) chamando `fetch("/api/contact", { method: "POST", ... })`.
O DESIGN.md exige feedback visível para toda ação: o botão vira "Enviando..." desabilitado
e a confirmação/erro aparece inline abaixo do form.

**Sobre serverless:** os `Map` de rate limit vivem em memória e somem a cada deploy — em
Vercel, cada instância tem o seu. Para proteção real, crie uma tabela `RateLimit` no
schema. Para um portfólio pessoal, honeypot + limite em memória já filtram a maior parte
dos bots.

## 9. Ordem de implementação sugerida

1. MySQL rodando + `schema.prisma` + `migrate dev` — confira as tabelas no `npx prisma studio`
2. `db.ts` e o seed do admin — rode o seed e veja o registro no Studio
3. `password.ts` e `session.ts`
4. Rota de login + `proxy.ts` — teste com `curl -i` e confira o `Set-Cookie`
5. Tela de login (`/admin/login`) consumindo a rota
6. `GET /api/projects` + dashboard listando
7. `POST`/`PUT`/`DELETE` + o `ProjectForm` no dialog
8. Trocar o array estático pelo banco no portfólio público
9. Rota de contato + wiring do formulário

Cada passo é testável sozinho — resista a escrever tudo antes de rodar o primeiro.

## 10. Checklist de segurança

- [ ] Senhas com scrypt (nunca texto puro, MD5 ou SHA-1)
- [ ] Comparação com `timingSafeEqual`
- [ ] Cookie `httpOnly` + `secure` em produção + `sameSite: "lax"`
- [ ] Token de sessão guardado **hasheado** no banco
- [ ] Mensagem genérica no login (não revelar se o e-mail existe)
- [ ] Rate limit no login e no contato
- [ ] `getSession()` em toda rota de escrita — o `proxy.ts` não basta
- [ ] Queries via Prisma (parametrizadas por padrão); se usar `$queryRaw`, **sempre** com
      template tag, nunca concatenação
- [ ] URLs validadas (só `http:`/`https:`) antes de virarem `href`
- [ ] `.env.local` fora do Git e `src/generated/prisma` no `.gitignore`
- [ ] Erro detalhado no log, genérico na resposta
- [ ] `robots: noindex` nas páginas de admin (já está)
- [ ] `import "server-only"` em todo módulo com segredo

## 11. Comandos do dia a dia

```bash
npx prisma migrate dev --name <nome>   # cria e aplica migration em dev
npx prisma migrate deploy              # aplica migrations em produção
npx prisma generate                    # regenera o client após mudar o schema
npx prisma studio                      # GUI para inspecionar os dados
npx prisma db seed                     # roda prisma/seed.ts
npx prisma migrate reset               # apaga tudo e recria (só em dev!)
```

## 12. Documentação de referência

**Prisma 7**
- [Quickstart MySQL](https://www.prisma.io/docs/prisma-orm/quickstart/mysql) — setup completo com o adapter MariaDB
- [Driver adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers) — por que são obrigatórios na v7
- [`prisma.config.ts`](https://www.prisma.io/docs/orm/reference/prisma-config-reference) — schema, migrations, datasource
- [Upgrade para a v7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) — o que mudou da v6
- [Relações many-to-many](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations) — implícita vs. explícita
- [Prisma com Next.js](https://www.prisma.io/docs/guides/nextjs) — singleton e Server Components
- [MySQL — mapeamento de tipos](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#mysql) — `@db.VarChar`, `@db.Text`

**Next.js 16**
- [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies) — API assíncrona e opções
- [Guia de autenticação](https://nextjs.org/docs/app/guides/authentication) — sessões, checagem otimista vs. real
- [Proxy (ex-Middleware)](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Upgrade para a v16](https://nextjs.org/docs/app/guides/upgrading/version-16) — `middleware` → `proxy`
- [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

**Node.js 24**
- [`crypto.scrypt`](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback)
- [`crypto.timingSafeEqual`](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b)

**Nodemailer**
- [SMTP](https://nodemailer.com/smtp/) · [Gmail](https://nodemailer.com/usage/using-gmail/) · [Mensagem](https://nodemailer.com/message/)
