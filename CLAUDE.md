# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Slidev-based presentation monorepo for bioinformatics course slides (Hebei Medical University). Each slide deck is a separate package under `packages/`. Content is bilingual (Chinese primary, English secondary).

## Commands

```bash
pnpm install                          # Install all dependencies
pnpm -r --filter=./packages/* run dev # Start dev server for all decks
pnpm run packages:build               # Build all decks (output: dist/)
pnpm run packages:build-base          # Build all decks with custom base paths for deployment
```

Run commands for a single deck:
```bash
pnpm --filter bioinfo-ch10-network-analysis run dev    # Dev server
pnpm --filter bioinfo-ch10-network-analysis run export  # Export to PDF
```

## Monorepo structure

- pnpm workspaces: each `packages/<name>/` is an independent Slidev project
- New decks go in `packages/<name>/` with their own `package.json` and `slides.md`
- Build output uses path convention: `dist/bioinfo/<deck-name>/`
- Each deck's `build-base` script sets `--base` for correct asset paths on Cloudflare Pages

## Theme

Uses `slidev-theme-hebmu` from a private GitHub repo (`Lilong-Dong-Lab/slidev-theme-hebmu`). CI authenticates via `GITHUB_TOKEN`. Local dev requires SSH or HTTPS access to this repo.

## Deployment

- CI: `.github/workflows/deploy.yaml` builds on push to main and deploys to Cloudflare Pages
- Requires secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Build command in CI: `pnpm run packages:build-base`

## Content conventions

- Slides are written in Markdown with Slidev frontmatter
- Primary language: Chinese; secondary: English
- Images go in `packages/<name>/public/assets/`
- Mermaid diagrams and KaTeX math are supported natively
