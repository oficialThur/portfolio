# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitors evaluating Arthur Henrique's work — recruiters, potential collaborators, and clients (audience inferred from the portfolio genre; not yet confirmed in interview). Secondary: Arthur himself, maintaining projects through the future `/admin` area.

## Product Purpose

Personal developer portfolio for Arthur Henrique — fullstack developer and Computer Science student based in Belo Horizonte, Brazil. It presents who he is, what he builds, and how to reach him. Success: a visitor understands who Arthur is within seconds, traverses the work, and reaches the contact endpoint.

## Positioning

An editorial/experimental developer space — deliberately not a SaaS-style landing page. The distinguishing mechanism is the spatial navigation system: horizontal depth movement along a Fibonacci-inspired trajectory replaces conventional vertical scrolling, with sections coexisting in three depth planes.

## Operating Context

Single-page public experience (`/`) with three sections — Sobre, Projetos, Contato — plus a future admin area (`/admin`, `/admin/login`) and API routes (`/api/projects`, `/api/auth/login`) for project management. Dark-only by intent; no light mode planned. Content language: Portuguese (BR).

## Capabilities and Constraints

- This session ships the public page only; admin/API are stubs for a future session.
- Projects section ships empty on purpose: real project data is deferred (open decision — owner will supply entries later; no fabricated projects).
- Contact links (email, GitHub, LinkedIn) currently render clearly-marked placeholders from `src/data/site.ts` — owner will supply real values later (empty string removes the item). The contact form's submit action is intentionally blank: the owner will write the backend himself; fields (`nome`, `email`, `mensagem`) are ready to be wired (2026-08-16).
- Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript.

## Brand Commitments

- `docs/design/DESIGN.md` is the pinned visual authority — it must be followed strictly and is not rewritten by tooling.
- The hand-drawn layout sketch (`docs/design/Captura de tela de 2026-08-13 15-00-11.png`) defines the asymmetric section hierarchy: Sobre dominant, Projetos intermediate, Contato minimal endpoint.
- Onyx canvas `#353839` is non-negotiable (changed from the original deep ink `#06151E` at the owner's request on 2026-08-16; muted/border grays lightened proportionally to preserve AA contrast). Inter dominant, JetBrains Mono for code-adjacent labels/metadata (Playfair Display dropped 2026-08-16 when the Contact editorial headline was removed at owner request). Section navigation is a vertical list pinned to the top-right corner on desktop and a two-line hamburger overlay on mobile; project items follow the "Koala" reference structure (year + dominant name + description · vertical mono stack + link).

## Evidence on Hand

- `docs/design/DESIGN.md` — full design system and interaction spec (pinned).
- `docs/design/Captura de tela de 2026-08-13 15-00-11.png` — hand-drawn layout sketch.
- `docs/Arquitetura.drawio` — architecture notes.
- No project images, testimonials, or real contact values on hand — these must not be fabricated.

## Product Principles

- Content first: effects, motion, and atmosphere always yield to content and navigation.
- Negative space is a design element; emptiness may be intentional.
- Asymmetric, composed, personal — never a generic symmetric template.
- Honesty: no invented projects, metrics, or claims; placeholders stay visibly replaceable.

## Accessibility & Inclusion

Follows the DESIGN.md contract: sufficient contrast at all times, visible focus indicators, full keyboard navigation, semantic heading hierarchy, `prefers-reduced-motion` fallback (flat, accessible mode preserving Sobre → Projetos → Contato order), minimum 44×44px touch targets, never color-alone state.
