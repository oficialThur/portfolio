# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitors evaluating Arthur Henrique's work — recruiters, potential collaborators, and clients. Secondary: Arthur himself, maintaining the Sobre text and projects through the admin area.

## Product Purpose

Personal developer portfolio for Arthur Henrique — fullstack developer and Computer Science student based in Belo Horizonte, Brazil. It presents who he is, what he builds, and how to reach him. Success: a visitor understands who Arthur is within seconds, traverses the work, and reaches the contact endpoint.

## Positioning

An editorial/experimental developer space — deliberately not a SaaS-style landing page. The distinguishing mechanism is the spatial navigation system: horizontal depth movement along a Fibonacci-inspired trajectory replaces conventional vertical scrolling, with sections coexisting in three depth planes.

## Operating Context

Single-page public experience (`/`) with three sections — Sobre, Projetos, Contato — plus an admin area (`/login` and `/admin`) and a JSON API consumed under `/api` (nginx/Vite proxy → Express).

- Public content comes from MySQL: the Sobre paragraph (`subtitles`) and up to three projects (`projetos`), managed in the admin.
- The admin authenticates with e-mail + password. The session is a JWT in an `httpOnly` cookie (1h); logout revokes issued tokens server-side.
- The contact form validates on the client and server and sends e-mail over SMTP (Nodemailer), with a honeypot and per-IP rate limit.
- Dark-only by intent; no light mode planned. Content language: Portuguese (BR).
- Development and production run on Docker Compose; production applies Prisma migrations in a one-shot `migrate` service before the backend starts.

## Capabilities and Constraints

- Sobre and projects are real data, not hardcoded: admin can create, edit, and delete projects and update the Sobre paragraph.
- The public portfolio shows at most the **3 most recent** projects; the admin lists all.
- A project requires name, description, an `http(s)` link, and at least one technology. Limits: name 120, description 5000, link 2048, each technology 60 characters.
- The Sobre text is limited to 2000 characters.
- Contact messages: name 120, subject 200, e-mail 254, message 5000. Delivery requires SMTP credentials; without a configured SMTP the endpoint returns a generic error and logs the cause.
- Real project entries and contact values are still owner-supplied. Contact links (email, GitHub, LinkedIn) currently render clearly-marked placeholders from `frontend/src/data/site.js` — an empty string removes the item. No fabricated projects, metrics, or claims.
- Stack: Vite 6 + React 19 + Tailwind CSS 4 + JavaScript (JSX); Express 5 + Prisma 7 + MySQL 8; Docker Compose; nginx serving the SPA and proxying `/api`.
- No multi-user support, no signup, no password reset flow. One admin is created by the Prisma seed.
- Rate limits are in-memory (single instance). Scaling horizontally would require a shared store such as Redis.

## Brand Commitments

- `docs/design/DESIGN.md` is the pinned visual authority — follow it strictly; it is not rewritten by tooling.
- The hand-drawn layout sketch (`docs/design/Captura de tela de 2026-08-13 15-00-11.png`) defines the asymmetric section hierarchy: Sobre dominant, Projetos intermediate, Contato minimal endpoint.
- Onyx canvas `#353839` is non-negotiable (changed from the original deep ink `#06151E` at the owner's request on 2026-08-16; muted/border grays lightened proportionally to preserve AA contrast). Inter dominant, JetBrains Mono for code-adjacent labels/metadata (Playfair Display dropped 2026-08-16 when the Contact editorial headline was removed at owner request). Section navigation is a vertical list pinned to the top-right corner on desktop and a two-line hamburger overlay on mobile; project items follow the "Koala" reference structure (year + dominant name + description · vertical mono stack + link).
- Admin area deliberately leaves the spatial stage: operational canvas, same palette/type, native `<dialog>` flows for create/edit and delete confirmation.

## Evidence on Hand

- `docs/design/DESIGN.md` — full design system and interaction spec (pinned).
- `docs/design/Captura de tela de 2026-08-13 15-00-11.png` — hand-drawn layout sketch.
- `docs/diagrama/Arquitetura.drawio` — architecture notes.
- `README.md` — setup, dev/prod, environment, tests.
- `docs/BACKEND.md` — API, database, auth, validation, operations.
- `backend/test/` — 26 automated integration tests.
- `env/.env.example` — every environment variable, documented.
- No project images, testimonials, or real contact values on hand — these must not be fabricated.

## Product Principles

- Content first: effects, motion, and atmosphere always yield to content and navigation.
- Negative space is a design element; emptiness may be intentional.
- Asymmetric, composed, personal — never a generic symmetric template.
- Honesty: no invented projects, metrics, or claims; placeholders stay visibly replaceable.
- Operate safely: validation on both sides, generic errors to clients, actionable logs on the server.

## Accessibility & Inclusion

- Text and UI contrast meet WCAG AA: error `#fca5a5` (6.2:1), success `#4ade80` (6.8:1), control borders `#8b9193` (3.7:1) over the Onyx canvas.
- Visible 2px focus indicators; full keyboard navigation; skip link ("Pular para o conteúdo") as the first Tab stop.
- SPA route changes move focus to the new `<main>`; the mobile menu traps focus, closes on Escape, and returns focus to its trigger.
- Forms expose per-field errors via `aria-invalid` + `aria-describedby` and focus the first invalid field. Global feedback uses `role="alert"`/`role="status"`.
- Semantic heading hierarchy, `noindex` on admin/login/404, and `<html lang="pt-BR">`.
- `prefers-reduced-motion` fallback (flat, accessible mode preserving Sobre → Projetos → Contato order); minimum 44×44px touch targets; state never conveyed by color alone.
- External links that open a new tab announce it to screen readers.
