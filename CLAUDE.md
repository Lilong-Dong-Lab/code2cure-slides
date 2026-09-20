# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Slidev-based presentation monorepo for bioinformatics course slides (Hebei Medical University). Each slide deck is a separate package under `packages/`. Content is bilingual (Chinese primary, English secondary).

## Commands

```bash
npm install                           # Install all dependencies
npm run dev --workspaces --if-present # Start dev server for all decks
npm run packages:build                # Build all decks (output: dist/)
npm run packages:build-base           # Build all decks with custom base paths for deployment
```

Run commands for a single deck:
```bash
npm run dev -w bioinfo-ch10-network-analysis            # Dev server
npm run export -w bioinfo-ch10-network-analysis         # Export to PDF
```

## Monorepo structure

- npm workspaces: each `packages/<name>/` is an independent Slidev project
- New decks go in `packages/<name>/` with their own `package.json` and `slides.md`
- Build output uses path convention: `dist/bioinfo/<deck-name>/`
- Each deck's `build-base` script sets `--base` for correct asset paths on Cloudflare Pages

## Theme

Uses `slidev-theme-hebmu` from a private GitHub repo (`Lilong-Dong-Lab/slidev-theme-hebmu`). CI authenticates via `GITHUB_TOKEN`. Local dev requires SSH or HTTPS access to this repo.

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
