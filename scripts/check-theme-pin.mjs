// Scheduled guardrail: fail when the lockfile theme pin is not the theme
// repo's main HEAD. CLAUDE.md: "A theme edit is not in CI until that pin
// moves" — this check automates that watch.
//
// Env: GITHUB_TOKEN (optional; raises the API rate limit).

import { readFileSync } from "node:fs";

const themeRepo = "Lilong-Dong-Lab/slidev-theme-hebmu";

const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
const resolved = lock.packages["node_modules/slidev-theme-hebmu"]?.resolved ?? "";
const pin = resolved.match(/#([0-9a-f]{40})/)?.[1];

if (!pin) {
  console.error(`theme pin: no commit SHA in the lockfile entry (resolved: "${resolved}")`);
  process.exit(1);
}

async function gh(path) {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} on ${path}`);
  return res.json();
}

const head = (await gh(`/repos/${themeRepo}/commits/main`)).sha;

if (pin === head) {
  console.log(`theme pin: fresh — ${pin.slice(0, 7)} == ${themeRepo} main`);
  process.exit(0);
}

const compare = await gh(`/repos/${themeRepo}/compare/${pin}...main`);
console.error(
  `theme pin: ${pin.slice(0, 7)} is ${compare.ahead_by ?? "?"} commits behind ` +
    `${themeRepo} main (${head.slice(0, 7)}) — move the pin in package-lock.json`,
);
process.exit(1);
