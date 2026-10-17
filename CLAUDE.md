# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Slidev-based presentation monorepo for bioinformatics course slides (Hebei Medical University). Each slide deck is a separate package under `packages/`. Content is bilingual (Chinese primary, English secondary).

## Commands

```bash
npm install                           # Install all dependencies
npm test                              # Lockfile checker tests
npm run check:lockfile                # Theme pin and versioned node_modules entries
npm run check:type-scale              # Service-course deck cover, body, compact, and pipeline click
npm run dev --workspaces --if-present # Start dev server for all decks
npm run packages:build                # Build all decks (output: dist/)
npm run packages:build-base           # Build chapter decks with custom base paths for deployment
```

Run commands for a single deck:
```bash
npm run dev -w bioinfo-ch10-network-analysis            # Dev server
npm run export -w bioinfo-ch10-network-analysis         # Export to PDF
```

## Monorepo structure

- npm workspaces: each `packages/<name>/` is an independent Slidev project
- npm 11.19 lockfile bug: `npm install` may write version-less marker entries (e.g. `{"dev": true}` under `packages/*/node_modules/<pkg>`) that crash `npm ci` with `Invalid Version:`. `npm run check:lockfile` rejects those entries and a `git+ssh://` pin for `slidev-theme-hebmu`. Delete a marker entry; it carries no data. Keep the theme `resolved` value on `git+https://`
- New decks go in `packages/<name>/` with their own `package.json` and `slides.md`
- A chapter deck's build output uses `dist/bioinfo/<deck-name>/`
- A chapter deck's `build-base` script sets `--base` for asset paths on Cloudflare Pages
- A service-course deck follows the decisions recorded for that deck. Shared words live in `GLOSSARY.md`

## Theme

Uses `slidev-theme-hebmu` from `Lilong-Dong-Lab/slidev-theme-hebmu`. CI installs the git pin in `package-lock.json` via `GITHUB_TOKEN`. Local preview reads `node_modules/slidev-theme-hebmu`, which may be a symlink to `/Users/hugodong/Documents/AcademicWorkplace/01_TEACHING_PORTFOLIO/Teaching_Resources/Template_Lectures/slidev-theme-hebmu`. After `npm install`, restore `node_modules/slidev-theme-hebmu` as a symlink to that checkout. A theme edit is not in CI until that pin moves.

## Deployment

- CI: `.github/workflows/deploy.yaml` builds on push to main and deploys to Cloudflare Pages
- Requires secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Build command in CI: `npm run packages:build-base`
- Deploy via `npm run deploy` (wrangler CLI `pages deploy`) — no third-party GitHub Action, immune to org Actions allowlists

## Content conventions

- Slides are written in Markdown with Slidev frontmatter
- Primary language: Chinese; secondary: English
- Images go in `packages/<name>/public/assets/`
- Mermaid diagrams and KaTeX math are supported natively
