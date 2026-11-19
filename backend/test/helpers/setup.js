import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mariadb from "mariadb";
import bcrypt from "bcryptjs";

// Carrega env/.env quando existir (no container o arquivo não é montado; as
// variáveis vêm do compose). Variáveis já definidas têm prioridade.
dotenv.config({
  path: fileURLToPath(new URL("../../../env/.env", import.meta.url)),
  quiet: true,
});

export const TEST_ADMIN = {
  name: "Test Admin",
  email: "test-admin@portfolio.test",
  password: "test-password-123",
};

const BACKEND_DIR = fileURLToPath(new URL("../..", import.meta.url));
const TEST_DB = process.env.TEST_DATABASE_NAME || "portfolio_test";

if (!/^[A-Za-z0-9_]+$/.test(TEST_DB) || !TEST_DB.endsWith("_test")) {
  throw new Error(
    `Banco de teste inválido: ${TEST_DB}. Use um nome terminado em _test ` +
      "(padrão: portfolio_test) para nunca apagar dados de desenvolvimento.",
  );
}

const connection = {
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD ?? "",
};

if (!connection.host || !connection.user) {
  throw new Error(
    "DATABASE_HOST/DATABASE_USER não definidos. Rode os testes dentro do container: " +
      "`docker compose -f docker-compose.dev.yml exec backend npm test`.",
  );
}

// O app lê estas variáveis ao ser importado; por isso são definidas antes.
process.env.NODE_ENV = "test";
process.env.DATABASE_NAME = TEST_DB;

async function ensureDatabase() {
  let conn;

  try {
    conn = await mariadb.createConnection(connection);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${TEST_DB}\``);
  } catch (error) {
    throw new Error(
      `Não foi possível conectar no MySQL (${connection.host}:${connection.port}). ` +
        "Suba o banco (`docker compose -f docker-compose.dev.yml up -d db`) e rode os testes " +
        `no container do backend. Causa: ${error.message}`,
      { cause: error },
    );
  } finally {
    await conn?.end();
  }
}

function runMigrations() {
  const url = `mysql://${encodeURIComponent(connection.user)}:${encodeURIComponent(
    connection.password,
  )}@${connection.host}:${connection.port}/${TEST_DB}`;
  const prismaBin = fileURLToPath(
    new URL("../../node_modules/.bin/prisma", import.meta.url),
  );

  try {
    execFileSync(prismaBin, ["migrate", "deploy"], {
      cwd: BACKEND_DIR,
      env: { ...process.env, DATABASE_URL: url },
      stdio: "pipe",
    });
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    throw new Error(`Falha ao aplicar migrations no banco de teste: ${detail}`, {
      cause: error,
    });
  }
}

await ensureDatabase();
runMigrations();

const { app, prisma } = await import("../../app.js");

await prisma.projeto.deleteMany();
await prisma.tecnologia.deleteMany();
await prisma.subtitle.deleteMany();
await prisma.admin.deleteMany();
await prisma.admin.create({
  data: {
    name: TEST_ADMIN.name,
    email: TEST_ADMIN.email,
    password: await bcrypt.hash(TEST_ADMIN.password, 4),
  },
});

export { app, prisma };

/** Limpa os dados entre testes, preservando o admin de teste. */
export async function resetData() {
  await prisma.projeto.deleteMany();
  await prisma.tecnologia.deleteMany();
  await prisma.subtitle.deleteMany();
}

/** Extrai o valor do cookie de sessão de uma resposta do Supertest. */
export function authCookie(response) {
  const cookie = response.headers["set-cookie"]?.find((item) =>
    item.startsWith("token="),
  );

  return cookie ? cookie.split(";")[0].slice("token=".length) : null;
}
