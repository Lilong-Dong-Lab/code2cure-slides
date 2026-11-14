import { homedir } from "node:os";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-chromium";

const COVER_URL = process.env.COVER_URL || "http://localhost:5230/1";
const MIN_CLEARANCE = 8;
const EXPECTED_TITLE = "第十讲 NumPy与Pandas进阶";

function discoverChromium() {
  const preferred = join(
    homedir(),
    "Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell",
  );
  if (existsSync(preferred)) return preferred;

  const root = join(homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(root)) return null;
  for (const entry of readdirSync(root).sort().reverse()) {
    if (!entry.startsWith("chromium_headless_shell-")) continue;
    const arm64 = join(root, entry, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");
    if (existsSync(arm64)) return arm64;
  }
  return null;
}

const executablePath = discoverChromium();
if (!executablePath) {
  console.error("No arm64 chrome-headless-shell found under ~/Library/Caches/ms-playwright");
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });

try {
  await page.goto(COVER_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForSelector(".slidev-layout.keynote-cover .cover-title h1", { timeout: 30_000 });
  await page.waitForTimeout(800);

  const result = await page.evaluate(() => {
    const layout = [...document.querySelectorAll(".slidev-layout.keynote-cover")].find(
      (el) => el.getBoundingClientRect().width > 100,
    );
    if (!layout) return { error: "no visible keynote-cover layout" };

    const h1 = layout.querySelector(".cover-title h1");
    const titleBlock = layout.querySelector(".cover-title");
    const path = layout.querySelector(".cover-wave path");
    if (!h1 || !path || !titleBlock) {
      return { error: "missing h1, cover-title, or cover-wave path" };
    }

    const layoutRect = layout.getBoundingClientRect();
    const slideWidth = layoutRect.width;
    const scale = slideWidth / 1024;
    const bbox = path.getBBox();
    // SVG viewBox is 1024×768 canvas space; getBBox is already canvas units.
    const waveBottomCanvas = bbox.y + bbox.height;

    const h1Rect = h1.getBoundingClientRect();
    const h1TopCanvas = (h1Rect.top - layoutRect.top) / scale;
    const clearance = h1TopCanvas - waveBottomCanvas;

    const style = getComputedStyle(h1);
    const lineHeightPx = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.15;
    const lines = Math.max(1, Math.round(h1Rect.height / lineHeightPx));

    const measure = document.createElement("span");
    measure.style.cssText =
      "position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit";
    measure.textContent = h1.textContent ?? "";
    h1.appendChild(measure);
    const naturalWidth = measure.getBoundingClientRect().width / scale;
    measure.remove();

    const titleStyle = getComputedStyle(titleBlock);
    const columnWidth = titleBlock.getBoundingClientRect().width / scale;

    return {
      text: (h1.textContent ?? "").trim(),
      lines,
      clearance: Math.round(clearance * 10) / 10,
      waveBottomCanvas: Math.round(waveBottomCanvas * 10) / 10,
      h1TopCanvas: Math.round(h1TopCanvas * 10) / 10,
      bottomCss: titleStyle.bottom,
      columnWidth: Math.round(columnWidth * 10) / 10,
      naturalWidth: Math.round(naturalWidth * 10) / 10,
      scale: Math.round(scale * 1000) / 1000,
      slideWidth: Math.round(slideWidth * 10) / 10,
    };
  });

  if (result.error) {
    console.error(JSON.stringify({ ok: false, error: result.error, url: COVER_URL }, null, 2));
    process.exit(1);
  }

  const clearanceOk = result.clearance >= MIN_CLEARANCE;
  const linesOk = result.lines <= 1;
  const titleOk = result.text === EXPECTED_TITLE;
  const ok = clearanceOk && linesOk && titleOk;
  const verdict = ok ? "GREEN" : "RED";

  const payload = {
    ok,
    verdict,
    url: COVER_URL,
    expectedTitle: EXPECTED_TITLE,
    minClearance: MIN_CLEARANCE,
    ...result,
    checks: {
      clearanceOk,
      linesOk,
      titleOk,
    },
  };

  console.log(JSON.stringify(payload, null, 2));
  process.exit(ok ? 0 : 1);
} finally {
  await browser.close();
}
