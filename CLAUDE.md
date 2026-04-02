# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use **pnpm** as the package manager.

```bash
pnpm dev              # Start dev server at localhost:4321
pnpm build            # Type-check, build, generate Pagefind search index
pnpm preview          # Preview production build
pnpm lint             # ESLint
pnpm format           # Prettier (auto-fix)
pnpm format:check     # Prettier (check only)
pnpm sync             # Regenerate Astro TypeScript types
```

The build command (`astro check && astro build && pagefind --site dist && cp -r dist/pagefind public/`) requires `pagefind` CLI to be available.

## Architecture

This is a personal blog built on the [AstroPaper](https://github.com/satnaing/astro-paper) theme using **Astro 5**, **TailwindCSS 4**, and **TypeScript**.

### Content System

Blog posts live in `src/data/blog/` as Markdown files. The Astro Content Loader (`src/content.config.ts`) uses glob `**/[^_]*.md` — files prefixed with `_` are treated as drafts and excluded. Each post is validated against a Zod schema (author, pubDatetime, title, tags, description, etc.).

### Key Configuration Files

- **`src/config.ts`** — Site-wide settings (`SITE`, `LOCALE`) including title, author, pagination, timezone, and `editPost` URL.
- **`src/constants.ts`** — Social links and share link definitions.
- **`astro.config.ts`** — Astro integrations (sitemap), Shiki syntax highlighting (themes: `min-light` / `night-owl`), Remark plugins (TOC, collapse), Vite/Tailwind config, and experimental font provider.

### Page Routing

All routes are under `src/pages/`:
- `/` — Homepage (latest posts)
- `/posts/` — Paginated post list
- `/posts/[slug]/` — Individual post
- `/posts/[slug]/index.png` — Dynamically generated OG image per post (Satori + Resvg)
- `/tags/` — Tag index and per-tag pages
- `/archives/` — Chronological archive
- `/search` — Pagefind-powered search

### OG Image Generation

Dynamic OG images are generated at build time using **Satori** (JSX → SVG) and **@resvg/resvg-js** (SVG → PNG). Templates are React JSX files in `src/utils/og-templates/`. Google Fonts are loaded via `src/utils/loadGoogleFont.ts`.

### Import Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### ESLint Rules

`console.log` is forbidden. The `dist/`, `.astro/`, and `public/pagefind/` directories are ignored by linting.

## CI

`.github/workflows/ci.yml` runs on PRs: lint → format check → build (3-minute timeout, Node 20, pnpm 10.33.0).
