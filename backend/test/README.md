# Testes do backend

Suíte de integração com `node:test` + Supertest. Os testes usam um banco
separado (`portfolio_test`), criado e migrado automaticamente na primeira
execução — o banco de desenvolvimento (`portfolio_db`) não é tocado.

## Como rodar

Com a stack de desenvolvimento no ar:

```bash
docker compose -f docker-compose.dev.yml exec backend npm test
```

O container já tem `DATABASE_HOST`, `DATABASE_USER` etc. definidos pelo
compose. Rodar direto no host não funciona sem configurar essas variáveis.

## O que é coberto

- endpoints públicos (`/projetos`, `/subtitulos`) e 404 em JSON;
- headers de segurança (`helmet`, sem `X-Powered-By`);
- login com cookie `httpOnly`, `/me`, logout e revogação de token copiado;
- CRUD de projetos e subtítulos, incluindo validação de URL, limites de
  tamanho, deduplicação de tecnologias e IDs inválidos;
- JSON malformado, body sem JSON e payload acima de 100 kB;
- contato: honeypot e validação dos campos;
- rate limit do login (10 falhas → 429, outras rotas livres).

## Variáveis opcionais

- `TEST_DATABASE_NAME`: nome do banco de teste. Precisa terminar em `_test`;
  padrão `portfolio_test`.
