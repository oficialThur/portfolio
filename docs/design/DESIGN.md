___

version: alpha
name: Portfolio — Arthur Henrique
description: A personal developer portfolio with an editorial and experimental visual language. The design anchors on a deep onyx canvas (#353839) with white and cool grays building contrast and hierarchy. Two font families handle the full hierarchy — Inter (sans-serif) for display, headings, body and navigation, and JetBrains Mono for labels, tags, tech metadata and code-adjacent details. The spatial navigation system replaces conventional vertical scroll with a horizontal Fibonacci-spiral trajectory — sections coexist in depth rather than stacking as slides. The result is dark, minimal, asymmetric, typographic, and deeply personal.

colors:
  background: "#353839"
  surface: "#FFFFFF"
  surface-muted: "#D6D6D6"
  text-primary: "#FFFFFF"
  text-secondary: "#D6D6D6"
  text-muted: "#A8AAAC"
  border: "#6E7476"
  ink: "#353839"
  gray-100: "#D6D6D6"
  gray-300: "#A8AAAC"
  gray-500: "#6E7476"
  white: "#FFFFFF"

typography:
  display-xl:
    fontFamily: "'Inter', sans-serif"
    fontSize: "clamp(48px, 8vw, 112px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: -2px
  display-lg:
    fontFamily: "'Inter', sans-serif"
    fontSize: "clamp(40px, 6vw, 80px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -1.5px
  heading-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.5px
  body-lg:
    fontFamily: "'Inter', sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  label-md:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.5px
  nav-link:
    fontFamily: "'Inter', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0.5px

rounded:
  sm: 4px
  md: 8px
  lg: 8px
  pill: 9999px

spacing:
  1: 8px
  2: 16px
  3: 24px
  4: 32px
  5: 48px
  6: 64px
  7: 80px
  8: 120px

components:
  top-nav:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.nav-link}"
    height: 56px
    position: fixed
  section-about:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    typography: "{typography.display-lg}"
    padding: "{spacing.8}"
  section-project:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    typography: "{typography.heading-md}"
    padding: "{spacing.7}"
  section-contact:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-lg}"
    padding: "{spacing.6}"
  card:
    backgroundColor: "transparent"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: 24px
  project-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    borderBottom: "1px solid {colors.border}"
    padding: "20px 0"
  badge-tech:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    typography: "{typography.label-md}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  nav-indicator:
    backgroundColor: "{colors.text-primary}"
    height: 1px
    width: 16px
  scroll-arrow:
    textColor: "{colors.text-muted}"
    typography: "{typography.label-md}"
    transition: opacity 0.2s ease
  admin-header:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-md}"
    borderBottom: "1px solid {colors.border}"
    height: 56px
    padding: "0 {spacing.3}"
  admin-project-card:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: 24px
  admin-project-card-hover:
    borderColor: "{colors.text-muted}"
  admin-dialog:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: 32px
  admin-input:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: 44px
  admin-input-focus:
    borderColor: "{colors.text-muted}"
  admin-button-primary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: 40px
  admin-button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    typography: "{typography.label-md}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: 40px
  admin-button-danger:
    backgroundColor: "transparent"
    textColor: "#EF4444"
    typography: "{typography.label-md}"
    border: "1px solid #EF4444"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: 40px
  admin-badge-tech:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    typography: "{typography.label-md}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  admin-feedback-success:
    textColor: "#22C55E"
    typography: "{typography.label-md}"
  admin-feedback-error:
    textColor: "#EF4444"
    typography: "{typography.label-md}"
  admin-login-card:
    backgroundColor: "transparent"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: 40px
    maxWidth: 400px
---

## Overview

This portfolio is a personal developer space for Arthur Henrique — a fullstack developer and Computer Science student based in Belo Horizonte, Brazil. The design draws from three references: **Master Strategy** (atmospheric depth, motion, and visual-first composition), **Minimalist Event Launch** (clean typography, controlled effects, and disciplined whitespace), and a hand-drawn asymmetric sketch defining the exact layout hierarchy of `About`, `Project`, and `Contact`.

The portfolio feels like an **editorial/experimental developer space** — not a SaaS landing page. Every decision is in service of that identity: a deep onyx canvas, restrained type scale, generous negative space, and a spatial navigation system that replaces conventional scrolling with horizontal depth movement through a Fibonacci-inspired trajectory.

The visual identity balances four forces:
```
MINIMALISM + EDITORIAL + TECHNICAL + MOTION
```

## Design Principles

### Minimalism with personality
The interface uses few elements, but each one carries visual weight. Negative space is never filled for the sake of filling it. Cards are used sparingly. SaaS-style generic sections are avoided entirely. If a section looks empty, that emptiness may be intentional.

### Asymmetric composition
The sketch defines clear visual weight differences between sections. `About` is the dominant element occupying the most space. `Project` holds intermediate presence. `Contact` is smaller and acts as the interaction endpoint. Navigation stays small and discreet at the top. The asymmetry should feel deliberate — composed, not misaligned.

### Content first
Animations, gradients, WebGL, textures, or atmospheric effects all operate as support layers. Content, navigation, and project listings always hold visual priority. If an effect competes with content, the effect loses.

## Colors

### Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-background` | `#353839` | Main background, primary structure |
| `--color-white` | `#FFFFFF` | Primary text, light surfaces |
| `--color-gray-100` | `#D6D6D6` | Secondary text, soft borders |
| `--color-gray-300` | `#A8AAAC` | Muted text, inactive elements |
| `--color-gray-500` | `#6E7476` | Auxiliary text, icons, dividers |

> Palette change (2026-08-16, owner request): the canvas moved from the original deep ink `#06151E` to onyx `#353839`. `gray-300` (`#898A8C` → `#A8AAAC`) and `gray-500` (`#545A5B` → `#6E7476`) were lightened in the same proportion to preserve WCAG AA contrast on the lighter canvas (muted text ≈ 5.1:1).

### Semantic roles
- **Background** (`{colors.background}` — #353839): The structural anchor of the entire experience. Deep onyx — a warm-neutral dark gray.
- **Text Primary** (`{colors.text-primary}` — #FFFFFF): Headlines, active nav links, project names.
- **Text Secondary** (`{colors.gray-100}` — #D6D6D6): Body paragraphs, card descriptions, soft headings.
- **Text Muted** (`{colors.gray-300}` — #A8AAAC): Metadata, tech labels, timestamps, inactive nav.
- **Border** (`{colors.border}` — #6E7476): Dividers, card borders, subtle structural lines.

### Contrast hierarchy
```
Onyx (#353839) → White (#FFFFFF) → Gray-100 (#D6D6D6) → Gray-300 (#A8AAAC)
```
Never use all four tones simultaneously across large areas. Hierarchy must stay simple. White and light tones create focal points. `#353839` is the canvas everything lives on.

## Typography

### Font families

| Family | Role | Weights |
|---|---|---|
| **Inter** | Display, headings, body, navigation | 400, 500, 600 |
| **JetBrains Mono** | Labels, tech metadata, tags, stack items | 500, 600 |

> Typography change (2026-08-16, owner request): Playfair Display (formerly the single editorial accent, used in the Contact headline) was dropped when the Contact headline was removed; the system is now two families only — Inter + JetBrains Mono.

Inter is the dominant voice — technical, clean, and proportional. JetBrains Mono provides the developer signal wherever code-adjacent language appears.

### Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display-xl` | `clamp(48px, 8vw, 112px)` | 600 | 1.04–1.1 | Name in hero |
| `display-lg` | `clamp(40px, 6vw, 80px)` | 500 | 1.1 | Section headings |
| `heading-md` | `32px` | 500 | 1.2 | Sub-headings |
| `body-lg` | `18px` | 400 | 1.6 | Introductory text |
| `body-md` | `16px` | 400 | 1.6 | Standard body copy |
| `label-md` | `12px` | 500 | 1.2 | Nav links, tags, metadata |

### Principles
- Display type uses tight line-height (1.04–1.1) — headlines feel dense and editorial, not airy.
- Body copy uses generous line-height (1.6) for readability on dark backgrounds.
- JetBrains Mono label-md uses light letter-spacing (+0.5px) to breathe at small sizes.

## Layout & Structure

### Page structure
```
PORTFOLIO
│
├── Header (fixed)
│   ├── Name — Arthur Henrique
│   └── Navigation
│       ├── About
│       ├── Project
│       └── Contact
│
├── About — dominant section
│
├── Project — secondary section
│
└── Contact — minimal interaction endpoint
```

The page is a continuous spatial experience, not a stack of independent blocks. Navigation allows direct access to sections, but the scroll — spatial horizontal movement — is itself part of the experience.

### Spacing

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 8px | Base unit |
| `--space-2` | 16px | Inner gaps, form fields |
| `--space-3` | 24px | Card padding |
| `--space-4` | 32px | Component separation |
| `--space-5` | 48px | Sub-section spacing |
| `--space-6` | 64px | Section padding inner |
| `--space-7` | 80px | Between sections |
| `--space-8` | 120px | Hero spacing, large breathing rooms |

Negative space is a design element. If a section feels empty, do not fill it.

### Grid
- **Max content width:** ~1200px, centered.
- **Hero:** Full viewport, name prominent, navigation small.
- **About:** Single dominant panel, large text, minimal metadata.
- **Project:** Vertical list, numbered, no generic card grid.
- **Contact:** Narrow, simple, one clear action.

## Spatial Navigation System

The portfolio does not use conventional vertical scroll.

Navigation moves through a **horizontal spatial trajectory** inspired by an **inverted Fibonacci spiral**. The intention is not a mathematically perfect spiral but the feeling of proportion and curvature — sections distributed across a three-dimensional space.

### Depth model
Three sections coexist at all times across three visual planes:

```
[ THIRD PLANE ]     ←    [ ACTIVE ]    →    [ SECOND PLANE ]
  outgoing                first plane           incoming
  blur + small            full focus            blur + small
  scale + low opacity     scale: 1              scale + medium opacity
```

- **First plane (Active):** `scale: 1` · `opacity: 1` · `filter: blur(0)` · full interaction.
- **Second plane (Incoming):** reduced scale · moderate blur · lower opacity · partially visible — creates anticipation.
- **Third plane (Outgoing):** smallest scale · highest blur · lowest opacity · progressively removed from field.

### Trajectory
Scroll input (wheel, trackpad, touch) maps to a continuous progress value:
```
0.00 ──────────── 0.50 ──────────── 1.00
start            transition          destination
```

Properties respond proportionally to this value:
```
scroll → progress → position + scale + blur + opacity + z-index
```

This is not a page transition — it is spatial movement. The user traverses a horizontal space while scroll controls the trajectory along the inverted Fibonacci curve.

### Section state transitions
Moving forward (`About → Project`):
```
About:   ACTIVE  → blur + scale down → OUTGOING (third plane)
Project: INCOMING → blur decreases + scale up → ACTIVE (first plane)
Contact: enters as INCOMING (second plane)
```

Moving backward reverses the trajectory exactly.

### Performance requirements
- Prioritize `transform` and `opacity` animations only — never animate layout properties.
- Use `will-change` only when strictly needed.
- Keep blur values controlled — heavy blur on multiple elements degrades GPU performance.
- Use `requestAnimationFrame` for manual progress processing.
- Avoid multiple WebGL instances.
- Disable or reduce effects on low-performance devices.

## Sections

### Header / Navigation
Fixed at top, height 56px, containing only the developer name on the left. The section list is a **vertical column fixed at the top-right corner** of the viewport (below the header, always visible on desktop). Navigation links use `{typography.nav-link}` in `{colors.text-muted}` default, `{colors.text-primary}` on hover and active. The active section receives a single subtle indicator (the 16×1px line marker below the link — never stack multiple indicators).

```
Arthur Henrique

                                      About
                                    Projects
                                     Contact
```

On mobile the vertical list collapses behind a **two-line hamburger button** (two thin strokes, 44×44px target) that opens a full-screen overlay in the canvas color with the three links stacked at `{typography.heading-md}` size. The overlay traps focus, closes on `Esc`, on link selection, and on the toggle (which morphs into an X).

### Hero (first viewport)
Communicates immediately: who the developer is, their field, and that there is content below. The name must dominate visually. Navigation stays small by comparison. No large hero CTA button, no metric cards, no gradients. The first impression must be editorial and personal.

### About
The largest visual element — dominant section. Large type for key phrases, short objective text, and generous negative space. Metadata (location, role, availability) renders in `{typography.label-md}` with JetBrains Mono. The section must not read as a traditional résumé.

```
ABOUT

Developer focused on building
digital experiences...

                       [metadata in mono]
```

### Project
Projects presented as part of the composition — not a generic card grid. Each project item occupies full presence, in a two-column asymmetric layout (reference: `Captura de tela de 2026-08-16 12-42-17.png`):

- **Left column (dominant):** year in `{typography.display-lg}`, then the project name in `{typography.display-xl}` (the dominant element of the item), then a short description in `{typography.body-md}` with `{colors.text-secondary}`.
- **Right column:** the tech stack as a vertical list in `{typography.label-md}` (JetBrains Mono, uppercase, `{colors.text-muted}`), vertically centered, closed by the optional link (e.g. `GitHub`) in `{colors.text-primary}`.
- Items are separated by a light border-bottom. On scroll, individual projects can receive spotlight focus.

```
PROJECTS

2024
Koala
                            Next.js
Short description.          Node.js
                            PostgreSQL
                            Prisma
                            Figma
                            GitHub
```

When project images exist, they support the visual narrative and never overshadow the typographic content.

### Contact
Minimal, direct endpoint — no editorial headline (removed 2026-08-16, owner request). Two-column composition (reference: owner's previous portfolio): a contact form on the left and the social links on the right as **plain text names** (no icons, no SVG), styled exactly like the project stack list — JetBrains Mono, uppercase, `{colors.text-muted}`, vertically centered, brightening to `{colors.text-primary}` on hover. The form holds `nome` / `email` / `mensagem` fields (following the Form Controls spec) and a white `Enviar` button; its submit action is intentionally blank — the owner will write the backend himself (2026-08-16). The section must feel like a natural endpoint, not a conversion funnel.

```
CONTACT

NOME                                  GITHUB
[                                    ]  LINKEDIN
EMAIL                                 EMAIL
[                                    ]
MENSAGEM
[                                    ]
[ Enviar ]
```

## Elevation & Depth

Depth is constructed through the spatial navigation system, not through drop shadows or card layering.

| Level | Treatment | Usage |
|---|---|---|
| Flat | No shadow, no border | Background, section bodies |
| Outlined | `1px solid {colors.border}` | Cards when used, project dividers |
| Spatial — First Plane | `scale: 1` · `blur(0)` · `opacity: 1` | Active section |
| Spatial — Second Plane | Reduced scale · moderate blur · ~0.6 opacity | Incoming section |
| Spatial — Third Plane | Small scale · heavy blur · ~0.3 opacity | Outgoing section |

No drop shadows. Depth comes from scale, blur, opacity, and position within the spatial system.

## Shapes

| Token | Value | Usage |
|---|---|---|
| `rounded.sm` | 4px | Micro elements |
| `rounded.md` | 8px | Cards, controls |
| `rounded.pill` | 9999px | Tech stack tags, small badges |

Radius must never be excessive. No bubbly, app-like roundness. The interface is lean and editorial.

## Motion

### Entry
Elements fade in and rise:
```
opacity: 0 → 1
translateY: 16px → 0
duration: 400–600ms
easing: ease-out
stagger: 60–100ms between elements
```

### Page load (2026-08-16, owner request)
The first paint is covered by a **loading curtain**: solid canvas color with the developer's name in `label-md` mono (muted), centered. It fades out on its own after ~720ms (480ms ease-out) — pure CSS, no JS dependency, never blocking interaction, removed from the accessibility tree. Content entry animations are offset by ~780ms so they start as the curtain lifts. Under `prefers-reduced-motion` the curtain disappears instantly.

### Scroll reveal (flat flow)
In the flat flow (mobile / reduced-motion), each section reveals once — fade + 20px rise, 600ms ease-out — when it crosses 12% of the viewport (`IntersectionObserver`, unobserve after first reveal). In spatial mode there is no scroll reveal: the traversal itself is the appearance. Under `prefers-reduced-motion` everything is visible immediately.

### Hover — Project items
- Minimal vertical shift: `translateY(-2px)`
- Contrast increase on text
- Underline reveal on name
- Subtle image scale if present

### Scroll — Spatial system
Active section properties respond continuously to scroll progress. Inactive sections shift through scale, blur, and opacity. Transitions must feel smooth and physical — not snappy or mechanical.

### Arrows / direction indicators
Arrows represent spatial direction, not "up/down" page controls. They must be thin, simple, and visually consistent with the interface language. A short directional animation on transition is acceptable. Arrows must never compete for attention.

## Atmospheric Effects
WebGL, Three.js, canvas noise, grain, dither, or subtle particle systems are **permitted as background layers only**. Rules:
- The effect must enhance content perception, never compete with it.
- Content, navigation, and projects always win visually.
- On mobile or low-performance devices: reduce or disable all atmospheric effects.
- Possible: subtle noise texture · grain overlay · very low-opacity gradient movement · canvas particles.

### Active atmosphere (2026-08-16)
1. **Shadow pattern** (owner request): three large, soft, dark radial stains fixed to the viewport — a deep shadow mass at the top-right corner, a deeper one at the bottom-left, and a faint one at the top-left. They sit **behind all content** (`z-index: 0`, first child of `body`) and are pure `radial-gradient` — no WebGL, no animation. These are background shadows on the canvas, not drop shadows on components (components remain shadow-free).
2. **Grain overlay**: subtle SVG noise above everything (`z-index: 130`, `opacity: 0.05`), disabled under `prefers-reduced-motion`.

## Accessibility

- Sufficient contrast between text and background at all times.
- Visible focus indicators on links and interactive controls.
- Full keyboard navigation support.
- Proper semantic heading hierarchy.
- `alt` attributes on all images.
- Touch targets: minimum 44 × 44px on mobile.
- Never rely on color alone to indicate state.

### Reduced motion
When `prefers-reduced-motion: reduce` is active:
- Disable the Fibonacci spiral trajectory.
- Remove 3D-depth transitions.
- Reduce or eliminate blur animations.
- Enable direct section navigation (flat, accessible mode).
- Preserve the logical content order: `About → Project → Contact`.
- Remove all decorative atmospheric effects.

The visual experience may be significantly reduced — the content must remain fully accessible regardless.

## Interaction States

### Navigation links
```
Default → {colors.text-muted}
Hover   → {colors.text-primary}
Active  → {colors.text-primary} + single indicator
Focus   → {colors.text-primary} + focus ring
```

### Project items
```
Default → Normal opacity and weight
Hover   → Subtle translateY(-2px) + increased text contrast
Focus   → Same visual behavior as hover
```

### Contact links
```
Default → {colors.text-secondary}
Hover   → {colors.text-primary} + underline
Focus   → {colors.text-primary} + focus ring
```

## Responsive

### Breakpoints

| Name | Width | Changes |
|---|---|---|
| Mobile | < 768px | Vertical linear layout; spatial scroll disabled; nav collapses to name + two-line hamburger opening a full-screen overlay; type scale reduced |
| Tablet | 768–1024px | Spatial scroll optional; asymmetry reduced; type scale slightly reduced |
| Desktop | 1024–1440px | Full spatial navigation; full asymmetric composition; vertical nav column at top-right |
| Wide | > 1440px | Same as desktop; content max 1200px |

### Mobile
On mobile, priority is legibility and navigation. The spatial horizontal system is replaced by a functional vertical flow:
```
Name                                       ☰

About
─────

Project
─────

Contact
```
Do not try to replicate desktop spatial positioning on mobile. Adapt the hierarchy, not the spatial mechanics.

## Do's and Don'ts

### Do
- Anchor the entire experience on the onyx canvas (`#353839`). This is non-negotiable.
- Use negative space as a design element. An empty area may be intentional.
- Keep Inter as the dominant typeface across the system.
- Use JetBrains Mono exclusively for code-adjacent content: tech stacks, labels, metadata.
- Build depth through scale, blur, and opacity in the spatial system — not through drop shadows.
- Maintain consistent `{rounded.md}` (8px) on any surface that uses a border.
- Preserve the active section highlight throughout the spatial navigation experience.
- Keep the first viewport clean, editorial, and impression-driven.

### Don't
- Don't turn the portfolio into a dashboard — no metric panels, no status cards.
- Don't turn all content into card components. Content can exist without a container.
- Don't add strong gradients without a specific compositional purpose.
- Don't use excessive or layered animations. Motion must be restrained.
- Don't replace the asymmetric composition with a generic symmetric grid.
- Don't remove the spatial scroll in favor of conventional vertical scroll.
- Don't treat sections as independent slides — they must coexist in spatial depth.
- Don't use WebGL as the primary visual attraction.
- Don't fill empty space automatically. Emptiness is part of the composition.
- Don't swap the official color palette without a documented reason.
- Don't mix font roles: Inter for display/body, JetBrains Mono for labels and code-adjacent details.

## Tokens Summary

```css
:root {
  /* Colors */
  --color-background:    #353839;
  --color-surface:       #FFFFFF;
  --color-surface-muted: #D6D6D6;
  --color-text-primary:  #FFFFFF;
  --color-text-secondary:#D6D6D6;
  --color-text-muted:    #A8AAAC;
  --color-border:        #6E7476;

  /* Typography */
  --font-display:    "Inter", sans-serif;
  --font-body:       "Inter", sans-serif;
  --font-mono:       "JetBrains Mono", monospace;

  /* Type scale */
  --text-display-xl: clamp(48px, 8vw, 112px);
  --text-display-lg: clamp(40px, 6vw, 80px);
  --text-heading-md: 32px;
  --text-body-lg:    18px;
  --text-body-md:    16px;
  --text-label-md:   12px;

  /* Line heights */
  --lh-display: 1.04;
  --lh-body:    1.6;
  --lh-label:   1.2;

  /* Spacing */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 48px;
  --space-6: 64px;
  --space-7: 80px;
  --space-8: 120px;

  /* Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-pill: 9999px;
}
```

## Known Gaps

- Exact Fibonacci spiral easing curve and keyframe values are not yet defined — to be determined during animation implementation.
- WebGL/canvas atmospheric layer is conceptually specified but not technically scoped.
- Project section image treatment (hover reveal, lightbox, or inline) is not finalized.
- Contact form behavior (if any) is not specified — currently assumed to be link-only.
- Specific scroll progress thresholds for spatial state transitions need calibration in implementation.
- Dark/light mode variant is not planned — this design is dark-only by intent.
- Admin area: technology management screen is deferred to a future version.
- Admin area: dialog animation easing is not yet specified.

## References

- `master-strategy-DESIGN.md` — Atmospheric visual direction, motion system, depth effects, spacing foundations, component guardrails.
- `minimalist-event-launch-DESIGN.md` — Minimalist direction, responsiveness, Inter as typographic base, JetBrains Mono for labels, controlled motion.
- Visual palette reference — `#FFFFFF` · `#D6D6D6` · `#A8AAAC` · `#6E7476` · `#353839`.
- Hand-drawn layout sketch — Header with name and nav · `About` as dominant area · `Project` as secondary area · `Contact` as minimal endpoint · Arrows representing spatial focus change on scroll.
- `Captura de tela de 2026-08-16 12-42-17.png` / `Captura de tela de 2026-08-16 12-43-41.png` — project item structure reference: year in display, dominant name, short description, vertical mono stack, GitHub link.

---

## Admin Area

### Overview

The admin area is part of the same project but operates under a deliberately different visual register. While the public portfolio is experimental, spatial, and atmospheric, the admin is functional, organized, and task-focused. It exists to let the developer manage projects without friction — not to be a showcase.

```
PORTFOLIO          ADMIN
→ experimental     → functional
→ spatial          → organized
→ depth + motion   → stable + legible
→ composition      → task-focused
```

The admin shares the same token system — colors, typography, spacing, radius, borders — but does not use the Fibonacci spatial navigation as its primary interaction model.

### Routes

```
/admin/login   — Authentication screen
/admin         — Main dashboard (project management)
```

No separate pages for `/admin/projects` or `/admin/technologies` in the first version. All project management is concentrated on the `/admin` dashboard.

### Visual Principles

- Clarity over expression.
- Fast task completion with minimal cognitive load.
- Readable type hierarchy at all viewport sizes.
- Visible feedback for every significant action.
- Accessibility and keyboard navigation are first-class requirements.
- Visual consistency with the portfolio's token system.
- No excessive animation — only functional state transitions.

### Page Structure — Dashboard (`/admin`)

```
┌──────────────────────────────────────────────────────┐
│ ADMIN                                      [ Logout ] │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Projects                      [ + New project ]      │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │ NestFin                                         │  │
│  │ Finance management platform                     │  │
│  │                                                 │  │
│  │ Next.js · C# · MySQL                            │  │
│  │                          [ Edit ] [ Delete ]    │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

The layout scales cleanly from a few projects to a longer list. No pagination is required at the initial scale.

### Login Screen (`/admin/login`)

Minimal, centered, no distraction.

```
┌────────────────────────────────┐
│                                │
│            ADMIN               │
│                                │
│  Email                         │
│  [__________________________]  │
│                                │
│  Password                      │
│  [__________________________]  │
│                                │
│          [ Sign in ]           │
│                                │
└────────────────────────────────┘
```

Uses `{component.admin-login-card}`. The login form must handle four states: default, loading, authentication error, and keyboard focus. Error messages appear inline below the relevant field.

### Project List

Each project item in the list exposes only the information needed for identification:

- Name — `{typography.heading-md}`
- Short description — `{typography.body-md}`
- Tech stack — rendered as `{component.admin-badge-tech}` tags
- Actions — Edit and Delete buttons

Avoid overloading the list with metadata. The card uses `{component.admin-project-card}` with a subtle border hover state via `{component.admin-project-card-hover}`.

### Project Form — Create & Edit

Create and edit happen inside the same dialog (`{component.admin-dialog}`), not on separate pages. The dialog is triggered by "New project" or "Edit".

```
/admin
   │
   ├── project list
   │
   └── [ New project ]
          │
          ▼
       Dialog
          │
          └── ProjectForm (reused for edit)
```

**Form fields:**
- Name
- Description
- Link
- Technologies (multi-select toggle — see below)

The same `ProjectForm` component handles both creation and editing. Prefill all fields when editing.

### Technology Selection

Technologies are managed inside the project form. In the first version there is no standalone technology management screen.

```
Technologies

[ Next.js ] [ C# ] [ MySQL ]
[ React   ] [ PHP ] [ Docker ]
```

Selected technologies are visually distinguished from unselected ones. Use `{component.admin-badge-tech}` with an active/selected modifier state.

### Interface States

All significant admin actions must have visible feedback.

**Loading**
```
[ Saving... ]
```
Button enters disabled + loading state. Label changes to reflect the ongoing action.

**Success**
```
✓ Project saved successfully.
```
Uses `{component.admin-feedback-success}` inline below the form or as a dismissible top-of-panel message.

**Error**
```
Could not save the project. Please try again.
```
Uses `{component.admin-feedback-error}`. Never fail silently.

**Empty list**
```
No projects yet.

[ + New project ]
```
The empty state must include the primary action so the user knows exactly what to do next.

**Delete confirmation**
Before permanently removing a project, a confirmation must appear:
```
Delete project?

This action cannot be undone.

[ Cancel ]  [ Delete ]
```
Uses `{component.admin-button-ghost}` for Cancel and `{component.admin-button-danger}` for Delete. Never auto-confirm a destructive action.

### Component Architecture

Admin components live in their own directory, fully separated from portfolio and spatial components:

```
components/
├── portfolio/
│   ├── About.tsx
│   ├── Projects.tsx
│   ├── Contact.tsx
│   └── Navigation.tsx
│
├── spatial/
│   ├── SpatialContainer.tsx
│   ├── SpatialSection.tsx
│   ├── FibonacciMotion.tsx
│   └── ScrollController.tsx
│
└── admin/
    ├── AdminHeader.tsx
    ├── ProjectList.tsx
    ├── ProjectCard.tsx
    ├── ProjectForm.tsx
    └── ProjectDialog.tsx
```

Admin visual logic must not mix with the spatial system logic. These are separate concerns with separate interaction models.

### Shared vs. Exclusive Elements

**Shared between portfolio and admin:**
- Color tokens
- Typography scale and families
- Spacing tokens
- Border radius tokens
- Base interactive states (focus ring, hover contrast)
- Icon language

**Exclusive to the portfolio (not used in admin):**
- Fibonacci spatial navigation
- Depth planes (first/second/third plane model)
- Animated blur transitions
- Cinematic section transitions
- Atmospheric background effects
- Asymmetric compositional layout

The admin should feel like it belongs to the same product without inheriting complexity that is irrelevant to task completion.

### Responsive — Admin

**Desktop (priority):** Full-width list layout. Dialog centered with max-width ~560px.

**Mobile:** Cards stack vertically. Action buttons (`Edit`, `Delete`) are full-width on small screens. Touch targets: minimum 44 × 44px. Dialog takes full-screen width with internal scroll.

```
┌──────────────────────────┐
│ NestFin                  │
│                          │
│ Next.js · C# · MySQL     │
│                          │
│ [ Edit ]  [ Delete ]     │
└──────────────────────────┘
```

### Admin Do's and Don'ts

**Do**
- Use the same token system as the portfolio — never introduce new colors or custom spacing.
- Show feedback for every action: loading, success, error, empty.
- Confirm before any destructive action.
- Reuse `ProjectForm` for both create and edit flows.
- Keep keyboard navigation fully functional throughout the admin.
- Keep the admin visually simpler than the public portfolio.

**Don't**
- Don't use the Fibonacci spatial scroll as the admin's navigation model.
- Don't create separate pages for create and edit — use the dialog.
- Don't build a technology management screen in version one.
- Don't stack excessive animations — admin transitions are subtle state changes only.
- Don't mix admin components with portfolio or spatial components.
- Don't introduce design patterns that exist only in the admin — extend the shared token system instead.

### Full Structure

```
PORTFOLIO
│
├── About
├── Projects
│     ├── Project A
│     ├── Project B
│     └── Project C
└── Contact


ADMIN
│
├── /admin/login
│
└── /admin  (Dashboard)
      │
      ├── Project list
      ├── New project → Dialog → ProjectForm
      ├── Edit project → Dialog → ProjectForm (prefilled)
      └── Delete project → Confirmation dialog
```
