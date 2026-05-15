---
name: new-deck
description: Scaffold a new Slidev presentation deck in this monorepo. Use when adding a new lecture or topic. Accepts a deck name and optional course prefix (e.g. `/new-deck bioinfo-ch11-proteomics`).
disable-model-invocation: true
---

# New Deck Scaffolding

Create a new slide deck package in this Slidev monorepo.

## Inputs

- `$ARGUMENTS` — deck name (required). Use format: `<course>-ch<number>-<topic>` (e.g. `bioinfo-ch11-proteomics`).

## Steps

1. Parse `$ARGUMENTS` as the deck name. Validate it follows the naming convention (`<course>-ch<number>-<topic>`). If invalid, ask the user to correct it.

2. Create the package directory: `packages/<deck-name>/`

3. Create `packages/<deck-name>/package.json` using this template (replace placeholders):

```json
{
  "name": "<deck-name>",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "slidev --open",
    "build": "slidev build",
    "build-base": "slidev build --out ../../dist/<course>/<deck-name> --base /<course>-<deck-name>/",
    "export": "slidev export --with-clicks --per-slide"
  },
  "dependencies": {
    "@slidev/cli": "latest",
    "@slidev/theme-default": "latest"
  },
  "devDependencies": {
    "@slidev/types": "latest"
  }
}
```

Adjust `build-base` paths based on the course prefix from the deck name. Use the existing deck (`bioinfo-ch10-network-analysis`) as a reference for the exact path pattern.

4. Create `packages/<deck-name>/slides.md` with a minimal Slidev starter:

```markdown
---
theme: hebmu
title: <Title>
info: |
  ## <Course> - Chapter <N>: <Topic>
class: text-center
drawings:
  persist: false
transition: slide-left
mdc: true
---

# <Title>

<Course> - Chapter <N>: <Topic>

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

---
layout: intro
---

# Introduction

Content goes here
```

5. Create `packages/<deck-name>/public/assets/` directory (empty, for images).

6. Install dependencies: run `pnpm install` from the repo root.

7. Verify the dev server starts: `pnpm --filter <deck-name> run dev` (start it briefly, then kill — just confirm no errors).

8. Print a summary of what was created and how to start developing.
