# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Engineering Standards

This project is maintained by a staff-level engineer with 15 years of experience. The bar is production-grade, not prototype-grade. Every file committed should be something you'd defend in a code review.

- **No slop.** No vibe-coded throwaway code. Every component, utility, and config should be intentional, well-structured, and maintainable.
- **DRY.** Extract shared logic. If something appears twice, it should be a function, constant, or component. But don't over-abstract — three similar lines is fine, a premature abstraction is not.
- **Readable code > clever code.** Name things clearly. Keep functions short. Prefer explicit over implicit. A new developer should understand any file in under 60 seconds.
- **SEO-first.** Every page must have proper metadata, Open Graph tags, structured data (JSON-LD), and semantic HTML. SEO is not an afterthought — it's a core acquisition channel.
- **Tailwind CSS 4 + CSS Cascade Layers.** All custom CSS must be inside `@layer base` or `@layer components`. NEVER write unlayered CSS — it overrides all Tailwind utilities due to cascade layer precedence. This burned us once; it will not happen again.
- **TypeScript strict mode.** No `any`. No `// @ts-ignore`. If the types are hard, that means the code needs restructuring.
- **Test what matters.** Critical paths (API responses, domain matching, billing logic) must have tests. UI pixel-perfection does not need tests.

## Project Overview

isBurner (isburner.com) is a disposable email detection API for developers. It answers one question: "Is this email from a throwaway provider?" Built as a Turborepo monorepo with two packages:

- `packages/api` — Hono on Cloudflare Workers (the core detection API)
- `packages/web` — Next.js 16 on Vercel (landing page, dashboard, docs)

## Business Goals

isBurner is a paid SaaS product targeting developers. Revenue comes from API subscriptions (Free + Starter tiers). Key priorities:

- **Reliability above all.** The API must be fast (< 50ms globally) and available (leveraging Cloudflare's edge network). Developers integrate this into their signup flows — downtime means their signups break.
- **Developer experience.** Clean API design, clear docs, helpful error messages. Developers are the customer.
- **SEO for organic acquisition.** Landing pages, docs, and blog content should be optimized for search ("disposable email API", "detect burner emails", "block fake signups").
- **Performance.** Core domain lookups use an in-memory Set (sub-microsecond). MX record analysis adds ~20ms. Keep total response time under 50ms.

## Tech Stack

| Layer | Tool |
|-------|------|
| API framework | Hono |
| API runtime | Cloudflare Workers |
| Domain list | In-memory Set (~30K domains) |
| MX lookups | Cloudflare DNS (nodejs_compat) |
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Neon) |
| Auth | TBD (Clerk or NextAuth) |
| Payments | Stripe |
| Monorepo | Turborepo |

## Git Workflow

- NEVER commit or push directly to `main` or `staging`. Always create a feature branch and open a PR.
- When asked to 'commit', create a branch and PR unless explicitly told otherwise.
- PRs to `staging`: squash merge only (enforced by ruleset).
- PRs to `main` (from staging): merge commits only (enforced by ruleset).

## Commands

```bash
npm run dev            # Start all packages in dev mode
npm run build          # Build all packages
npm run lint           # Lint all packages
npm run format         # Prettier format all source files
npm run format:check   # Check formatting without writing
```

### Package-specific

```bash
# API (from packages/api/)
npm run dev            # Wrangler dev server
npm run deploy         # Deploy to Cloudflare Workers

# Web (from packages/web/)
npm run dev            # Next.js dev server (localhost:3000)
npm run build          # Production build
```

CI runs lint, format:check, and build on PRs to `staging`.

## Design System

Dark, terminal-forward aesthetic. NOT generic AI-generated UI.

- **Background**: Near-black (#06060a), surfaces (#0e0e14), elevated (#14141c)
- **Accent**: Terminal green (#00ff88)
- **Fonts**: Geist Sans (body), Geist Mono (code, headings, nav)
- **Principles**: Monospace-forward, code blocks prominent, real personality in copy, no stock illustrations
- **Animations**: No generic slide-up fade-ins. Use terminal-inspired effects (boot-in, HUD slide, brightness pulse). Animations should feel like a system powering on, not a PowerPoint deck.

## Architecture

### API (packages/api/)

- `src/index.ts` — Hono app entry point, route definitions
- `src/data/domains.ts` — In-memory Set of known disposable domains

### Web (packages/web/)

- `src/app/` — Next.js App Router pages
- `src/app/layout.tsx` — Root layout with fonts, global metadata
- `src/app/page.tsx` — Landing page (Nav, Hero, HowItWorks, WhySection, Pricing, CTA, Footer)
- `src/app/globals.css` — Tailwind theme (`@theme`), base styles (`@layer base`), component styles (`@layer components`), keyframe animations
- `src/components/` — Shared React components

### SEO Requirements (every page)

- Metadata export with title, description, Open Graph, Twitter Card
- JSON-LD structured data where applicable
- Semantic HTML (`<main>`, `<article>`, `<section>`, `<nav>`, `<footer>`)
- `sitemap.ts` and `robots.ts` in `src/app/`
- Favicons and social preview images in `public/`

## Code Style

- Prettier: single quotes, semicolons, 100-char line width, 2-space indent, trailing commas (ES5)
- TypeScript strict mode in both packages
- Path alias: `@/*` maps to `src/*` (web package)
- Node version: 24 (specified in `.nvmrc`)
