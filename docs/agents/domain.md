# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a single-context repo: one `GLOSSARY.md` and one `docs/adr/` at the repo root serve all slide decks.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root: the shared language for the HEBMU slide theme, the chapter decks, and the service-course decks.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in (theme look, diagram layout, deployment paths).

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── GLOSSARY.md
├── docs/
│   ├── adr/
│   │   ├── 0001-neutral-cards-carry-no-meaning.md
│   │   ├── 0002-diagram-layout-is-not-theme-look.md
│   │   └── 0003-service-course-decks-deploy-under-medbio.md
│   └── agents/
└── packages/
    └── <deck-name>/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
