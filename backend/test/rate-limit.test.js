import { after, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, prisma, TEST_ADMIN } from "./helpers/setup.js";

after(async () => {
  await prisma.$disconnect();
});

it("limita tentativas de login por IP sem afetar outras rotas", async () => {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    await request(app)
      .post("/login")
      .send({ email: TEST_ADMIN.email, password: "senha-errada" })
      .expect(401);
  }

  const blocked = await request(app)
    .post("/login")
    .send({ email: TEST_ADMIN.email, password: "senha-errada" })
    .expect(429);

  assert.match(blocked.body.msg, /Muitas tentativas/);
  assert.ok(blocked.headers["retry-after"], "Retry-After ausente");
  assert.ok(blocked.headers["ratelimit"], "header RateLimit ausente");

  await request(app).get("/projetos").expect(200);

  // Nem a senha correta passa enquanto a janela está bloqueada.
  await request(app)
    .post("/login")
    .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password })
    .expect(429);
});
