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

### Post Frontmatter Schema

Required fields: `title`, `pubDatetime`, `description`. Key optional fields:

- `draft: true` — hides from production (second way to draft, alongside `_` filename prefix)
- `featured: true` — surfaces on homepage
- `modDatetime` — last-modified date shown in UI
- `tags` — defaults to `["others"]`
- `ogImage` — custom OG image (local asset or URL); omit to use dynamic generation
- `hideEditPost: true` — hides the edit link on that post
- `timezone` — overrides `SITE.timezone` for date display
- `canonicalURL` — override the canonical URL for the post

In dev mode (`pnpm dev`), drafts and future-dated posts are visible. In production, `postFilter.ts` hides them (with a 15-minute `scheduledPostMargin` grace window).

### Notion Sync

`scripts/notion-sync.js` pulls pages with status `Published` from a Notion database and writes them as Markdown to `src/data/blog/`. Requires env vars:

```bash
NOTION_TOKEN=...
NOTION_DATABASE_ID=...
node scripts/notion-sync.js
```

The Notion DB must have `제목` (title), `작성일` (date), `태그` (multi-select), and `상태` (status) properties.

The GitHub Actions workflow (`.github/workflows/notion-sync.yml`) runs this script **hourly** and auto-commits any new/changed files back to `main` with the message `chore: update posts from notion`. Requires `NOTION_TOKEN` and `NOTION_DATABASE_ID` repository secrets.

### Shiki Code Block Features

Code blocks support transformer annotations:
- `// [!code highlight]` — highlight a line
- `// [!code ++]` / `// [!code --]` — diff notation
- `// [!code word:foo]` — word highlight
- Filename shown via `transformerFileName` (set filename with a comment or meta string on the opening fence)

### Environment Variables

`PUBLIC_GOOGLE_SITE_VERIFICATION` — optional, client-side, for Google Search Console verification.

## CI / CD

**CI** (`.github/workflows/ci.yml`): runs on every PR and push to `main` — lint → format check → build (3-minute timeout, Node 24, pnpm 10.33.0).

**Deploy** (`.github/workflows/deploy.yml`): manual `workflow_dispatch` only — runs CI, then deploys `dist/` to GitHub Pages. Not triggered automatically on push.
