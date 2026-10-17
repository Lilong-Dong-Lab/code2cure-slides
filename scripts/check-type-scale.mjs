import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-chromium";

const port = 4179;
const deck = fileURLToPath(new URL("../packages/medbio-bioinfo-tools/", import.meta.url));

function startDeck() {
  const child = spawn("npx", ["slidev", "--port", String(port), "--open", "false"], {
    cwd: deck,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (chunk) => {
    log += chunk;
  });
  child.stderr.on("data", (chunk) => {
    log += chunk;
  });
  return { child, readLog: () => log };
}

async function waitForDeck(readLog) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (readLog().includes(`localhost:${port}`)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Slidev did not print its local URL");
}

async function waitForVisibleText(page, text) {
  await page.waitForFunction((expected) => {
    return [...document.querySelectorAll(".slidev-layout")].some((layout) => {
      return layout.getBoundingClientRect().width > 100 && layout.textContent.includes(expected);
    });
  }, text);
}
async function firstVisible(page, selector) {
  const handles = await page.locator(selector).elementHandles();
  for (const handle of handles) {
    const size = await handle.evaluate((element) => {
      const layout = element.closest(".slidev-layout");
      if (!layout || layout.getBoundingClientRect().width < 100) return null;
      return getComputedStyle(element).fontSize;
    });
    if (size) return size;
  }
  return null;
}

const failures = [];

function expectSize(label, actual, expected) {
  if (actual !== expected) failures.push(`${label}: ${actual ?? "missing"}, expected ${expected}`);
}

const { child, readLog } = startDeck();
let browser;

try {
  await waitForDeck(readLog);
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(`http://localhost:${port}/1`, { waitUntil: "load" });
  await waitForVisibleText(page, "生物信息学常用工具");
  expectSize("cover title", await firstVisible(page, ".cover-title h1"), "60px");

  await page.goto(`http://localhost:${port}/4`, { waitUntil: "load" });
  await waitForVisibleText(page, "金钥匙");
  expectSize("body title", await firstVisible(page, "h1"), "40px");
  expectSize("body list", await firstVisible(page, ".keynote-stage li"), "24px");
  expectSize("body quote", await firstVisible(page, ".keynote-stage blockquote"), "24px");

  await page.goto(`http://localhost:${port}/27`, { waitUntil: "load" });
  await waitForVisibleText(page, "PyMOL");
  expectSize("compact title", await firstVisible(page, "h1"), "40px");
  expectSize("compact paragraph", await firstVisible(page, ".keynote-stage p"), "24px");
  expectSize("compact list", await firstVisible(page, ".keynote-stage li"), "24px");

  await page.goto(`http://localhost:${port}/15`, { waitUntil: "load" });
  await waitForVisibleText(page, "靶点发现");
  const before = await page.evaluate(() => {
    const layout = [...document.querySelectorAll(".slidev-layout")].find(
      (element) => element.getBoundingClientRect().width > 100,
    );
    return layout.querySelector(".medbio-stage").getBoundingClientRect().width;
  });
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction((start) => {
    const layout = [...document.querySelectorAll(".slidev-layout")].find(
      (element) => element.getBoundingClientRect().width > 100,
    );
    const active = layout?.querySelector(".medbio-stage.is-active");
    if (!active) return false;
    return active.getBoundingClientRect().width > start * 1.5;
  }, before);
} finally {
  await browser?.close();
  if (child.pid) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
