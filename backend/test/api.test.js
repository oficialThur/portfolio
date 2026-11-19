import { after, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import {
  app,
  authCookie,
  prisma,
  resetData,
  TEST_ADMIN,
} from "./helpers/setup.js";

beforeEach(resetData);
after(async () => {
  await prisma.$disconnect();
});

const VALID_PROJECT = {
  nome: "Portfólio QA",
  descricao: "Projeto usado pela suíte automatizada.",
  link: "https://github.com/arthur/portfolio",
  tecnologias: ["React", "Node.js", "React"],
};

const VALID_CONTACT = {
  nome: "QA",
  sobre: "Teste automatizado",
  email: "qa@example.com",
  mensagem: "Mensagem enviada pela suíte.",
};

async function login() {
  const agent = request.agent(app);
  await agent
    .post("/login")
    .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password })
    .expect(200);
  return agent;
}

describe("Endpoints públicos", () => {
  it("lista projetos vazio", async () => {
    const response = await request(app).get("/projetos").expect(200);
    assert.deepEqual(response.body, []);
  });

  it("lista subtítulos vazio", async () => {
    const response = await request(app).get("/subtitulos").expect(200);
    assert.deepEqual(response.body, []);
  });

  it("responde 404 em JSON para rota inexistente", async () => {
    const response = await request(app).get("/rota-inexistente").expect(404);
    assert.equal(response.body.msg, "Rota não encontrada");
  });

  it("envia headers de segurança e esconde o Express", async () => {
    const response = await request(app).get("/projetos").expect(200);
    assert.equal(response.headers["x-powered-by"], undefined);
    assert.match(response.headers["content-security-policy"], /default-src 'self'/);
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    assert.equal(response.headers["x-frame-options"], "SAMEORIGIN");
  });
});

describe("Autenticação", () => {
  it("faz login e grava cookie httpOnly", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password })
      .expect(200);

    assert.equal(response.body.token, undefined);
    assert.match(response.body.msg, /Login realizado com sucesso/);

    const cookie = response.headers["set-cookie"]?.find((item) =>
      item.startsWith("token="),
    );
    assert.ok(cookie, "cookie de sessão ausente");
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Strict/i);
  });

  it("rejeita campos ausentes com 400", async () => {
    await request(app)
      .post("/login")
      .send({ email: TEST_ADMIN.email })
      .expect(400);
  });

  it("rejeita senha incorreta com 401", async () => {
    await request(app)
      .post("/login")
      .send({ email: TEST_ADMIN.email, password: "senha-errada" })
      .expect(401);
  });

  it("responde /me anônimo sem erro", async () => {
    const response = await request(app).get("/me").expect(200);
    assert.deepEqual(response.body, { authenticated: false });
  });

  it("responde /me autenticado com o cookie", async () => {
    const agent = await login();
    const response = await agent.get("/me").expect(200);

    assert.equal(response.body.authenticated, true);
    assert.equal(response.body.admin.email, TEST_ADMIN.email);
  });

  it("bloqueia rota protegida sem sessão", async () => {
    const response = await request(app)
      .post("/projetos")
      .send(VALID_PROJECT)
      .expect(401);

    assert.equal(response.body.msg, "Acesso não autorizado");
  });

  it("logout limpa o cookie e encerra a sessão", async () => {
    const agent = await login();

    await agent.post("/logout").expect(204);

    const me = await agent.get("/me").expect(200);
    assert.equal(me.body.authenticated, false);

    await agent.post("/projetos").send(VALID_PROJECT).expect(401);
  });

  it("revoga token copiado antes do logout", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password })
      .expect(200);
    const token = authCookie(loginResponse);
    assert.ok(token);

    const before = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    assert.equal(before.body.authenticated, true);

    await request(app)
      .post("/logout")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const afterLogout = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    assert.equal(afterLogout.body.authenticated, false);

    const blocked = await request(app)
      .post("/projetos")
      .set("Authorization", `Bearer ${token}`)
      .send(VALID_PROJECT)
      .expect(401);
    assert.match(blocked.body.msg, /Sessão expirada/);
  });
});

describe("Projetos", () => {
  it("cria projeto, deduplica tecnologias e devolve o formato público", async () => {
    const agent = await login();

    const response = await agent
      .post("/projetos")
      .send(VALID_PROJECT)
      .expect(201);

    assert.equal(typeof response.body.id, "string");
    assert.equal(response.body.name, VALID_PROJECT.nome);
    assert.equal(response.body.description, VALID_PROJECT.descricao);
    assert.equal(response.body.link, VALID_PROJECT.link);
    assert.deepEqual(
      response.body.tecnologias.map((tech) => tech.name).sort(),
      ["Node.js", "React"],
    );

    const list = await request(app).get("/projetos").expect(200);
    assert.equal(list.body.length, 1);
    assert.equal(list.body[0].id, response.body.id);
  });

  it("valida campos e URL do projeto", async () => {
    const agent = await login();

    await agent.post("/projetos").send({ nome: "só nome" }).expect(400);

    await agent
      .post("/projetos")
      .send({ ...VALID_PROJECT, link: "javascript:alert(1)" })
      .expect(400);

    await agent
      .post("/projetos")
      .send({ ...VALID_PROJECT, nome: "a".repeat(121) })
      .expect(400);

    await agent
      .post("/projetos")
      .send({ ...VALID_PROJECT, tecnologias: [] })
      .expect(400);
  });

  it("atualiza nome e tecnologias", async () => {
    const agent = await login();
    const created = await agent
      .post("/projetos")
      .send(VALID_PROJECT)
      .expect(201);

    const response = await agent
      .put(`/projetos/${created.body.id}`)
      .send({ nome: "Nome atualizado", tecnologias: ["Go"] })
      .expect(200);

    assert.equal(response.body.name, "Nome atualizado");
    assert.deepEqual(
      response.body.tecnologias.map((tech) => tech.name),
      ["Go"],
    );
  });

  it("rejeita ID inválido com 400", async () => {
    const agent = await login();

    await agent.put("/projetos/abc").send({ nome: "x" }).expect(400);
    await agent.delete("/projetos/1.5").expect(400);
  });

  it("responde 404 para projeto inexistente", async () => {
    const agent = await login();

    await agent.put("/projetos/999999").send({ nome: "x" }).expect(404);
    await agent.delete("/projetos/999999").expect(404);
  });

  it("remove o projeto e responde 404 na segunda tentativa", async () => {
    const agent = await login();
    const created = await agent
      .post("/projetos")
      .send(VALID_PROJECT)
      .expect(201);

    await agent.delete(`/projetos/${created.body.id}`).expect(204);

    const list = await request(app).get("/projetos").expect(200);
    assert.equal(list.body.length, 0);

    await agent.delete(`/projetos/${created.body.id}`).expect(404);
  });
});

describe("Subtítulos", () => {
  it("cria, atualiza e remove subtítulo", async () => {
    const agent = await login();

    const created = await agent
      .post("/subtitulos")
      .send({ subtitle: "Subtítulo de teste" })
      .expect(201);
    assert.equal(created.body.subtitle, "Subtítulo de teste");

    const updated = await agent
      .put(`/subtitulos/${created.body.id}`)
      .send({ subtitle: "Subtítulo atualizado" })
      .expect(200);
    assert.equal(updated.body.subtitle, "Subtítulo atualizado");

    await agent.delete(`/subtitulos/${created.body.id}`).expect(204);

    const list = await request(app).get("/subtitulos").expect(200);
    assert.equal(list.body.length, 0);
  });

  it("rejeita subtítulo vazio e ID inválido", async () => {
    const agent = await login();

    await agent.post("/subtitulos").send({ subtitle: "   " }).expect(400);
    await agent.put("/subtitulos/abc").send({ subtitle: "x" }).expect(400);
  });
});

describe("Tratamento de requisições inválidas", () => {
  it("responde 400 para JSON malformado", async () => {
    const response = await request(app)
      .post("/login")
      .set("Content-Type", "application/json")
      .send('{"email":')
      .expect(400);

    assert.equal(response.body.msg, "JSON inválido");
  });

  it("responde 400 para body sem JSON", async () => {
    await request(app)
      .post("/login")
      .set("Content-Type", "text/plain")
      .send("email=teste")
      .expect(400);
  });

  it("responde 413 para body acima do limite", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "a".repeat(150_000), password: "x" })
      .expect(413);

    assert.equal(response.body.msg, "Corpo da requisição muito grande");
  });
});

describe("Contato", () => {
  it("honeypot responde sucesso sem enviar e-mail", async () => {
    const response = await request(app)
      .post("/enviando-email")
      .send({ ...VALID_CONTACT, website: "http://spam.example" })
      .expect(200);

    assert.match(response.body.msg, /sucesso/i);
  });

  it("valida os campos do contato", async () => {
    await request(app)
      .post("/enviando-email")
      .send({ nome: "QA" })
      .expect(400);

    await request(app)
      .post("/enviando-email")
      .send({ ...VALID_CONTACT, email: "nao-e-email" })
      .expect(400);

    await request(app)
      .post("/enviando-email")
      .send({ ...VALID_CONTACT, mensagem: "x".repeat(5001) })
      .expect(400);
  });
});
