// Ground truth for slide numbers: asks the running deck what each page shows.
// When check-type-scale fails after a deck edit, re-map its goto targets with:
//   node scripts/probe-slides.mjs                    # default needles
//   node scripts/probe-slides.mjs 单细胞测序 WGCNA    # custom needles
//
// Slidev mounts the current page plus its neighbours, so this reads
// .slidev-page-N itself — never document.body, which unions the neighbours.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-chromium";

const port = 4182;
const deck = fileURLToPath(new URL("../packages/medbio-bioinfo-tools/", import.meta.url));
const needles = process.argv.slice(2).length ? process.argv.slice(2) : ["金钥匙", "PyMOL", "靶点发现"];
const ansiColor = /\u001B\[[0-9;]*m/g;

const child = spawn("npx", ["slidev", "--port", String(port), "--open", "false"], {
  cwd: deck,
  detached: true,
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
child.stdout.on("data", (chunk) => (log += chunk.toString().replace(ansiColor, "")));
child.stderr.on("data", (chunk) => (log += chunk.toString().replace(ansiColor, "")));

function killDeck() {
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}
process.on("exit", killDeck);

try {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline && !log.includes(`localhost:${port}`)) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!log.includes(`localhost:${port}`)) {
    console.error(`Slidev did not print its local URL within 90s. Deck log tail:\n${log.slice(-4000)}`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  async function readPage(n) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto(`http://localhost:${port}/${n}`, {
          waitUntil: "domcontentloaded",
          timeout: 20_000,
        });
        await page.waitForSelector(`.slidev-page-${n}`, { timeout: 12_000 });
        await page.waitForTimeout(600);
        const info = await page.evaluate(({ idx, ns }) => {
          const el = document.querySelector(`.slidev-page-${idx}`);
          if (!el || el.getBoundingClientRect().width < 1) return null;
          const text = el.textContent;
          return {
            hits: ns.filter((needle) => text.includes(needle)).join(",") || "—",
            active: el.querySelector(".pipeline-stage.is-active") ? "active✓" : "",
            compact: el.querySelector(".keynote-stage p") ? "compact✓" : "",
            head: text.replace(/\s+/g, " ").slice(0, 44),
          };
        }, { idx: n, ns: needles });
        if (info && !info.head.trim() && attempt < 2) continue; // still hydrating
        return info;
      } catch {
        if (attempt === 2) return null;
      }
    }
    return null;
  }

  let missingStreak = 0;
  for (let n = 1; n <= 60 && missingStreak < 2; n++) {
    const info = await readPage(n);
    if (!info) {
      missingStreak++;
      continue;
    }
    missingStreak = 0;
    console.log(
      `p${String(n).padStart(2)} ${info.hits.padEnd(12)} ${info.active.padEnd(8)} ${info.compact.padEnd(9)} ${info.head}`,
    );
  }

  await browser.close();
} finally {
  killDeck();
}
