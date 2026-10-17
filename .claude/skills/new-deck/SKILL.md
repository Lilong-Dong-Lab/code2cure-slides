---
name: new-deck
description: Scaffold a chapter deck (`<course>-ch<number>-<topic>`) or a service-course deck for the service course 生物信息学.
disable-model-invocation: true
---

# New Deck Scaffolding

Create a new slide deck package in this Slidev monorepo.

## Inputs

- `$ARGUMENTS` — deck name (required).

## Steps

1. Parse `$ARGUMENTS` as the deck name. A name shaped `<course>-ch<number>-<topic>` (for example `bioinfo-ch11-proteomics`) is a chapter deck: follow the chapter-deck steps. A deck for the service course 生物信息学 is a service-course deck: keep the package name the user gave and follow the service-course steps. If the name matches neither, ask which it is.

## Service-course deck

2. Create `packages/<deck-name>/`.

3. Create `packages/<deck-name>/package.json`:

```json
{
  "name": "<deck-name>",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "slidev --open",
    "build": "slidev build",
    "export": "slidev export --with-clicks --per-slide"
  },
  "dependencies": {
    "slidev-theme-hebmu": "git+https://github.com/Lilong-Dong-Lab/slidev-theme-hebmu.git"
  }
}
```

Omit `build-base` until the deck is published.

4. Create `packages/<deck-name>/slides.md`:

```markdown
---
theme: hebmu
title: <Title>
---

# <Title>
```

5. Create `packages/<deck-name>/public/assets/`.

6. From the repo root, run `npm install`.

7. Start `npm run dev -w <deck-name>` briefly, then stop it, and confirm it boots.

8. Print what was created and the dev command. Stop here.

## Chapter deck

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
