import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const themeKey = "slidev-theme-hebmu";
const httpsPin = "git+https://github.com/Lilong-Dong-Lab/slidev-theme-hebmu.git";

export function checkLockfile(lock) {
  const errors = [];
  const packages = lock.packages ?? {};

  for (const [name, entry] of Object.entries(packages)) {
    if (name.includes(themeKey)) {
      const resolved = entry?.resolved ?? "";
      if (resolved.startsWith("git+ssh://") || !resolved.startsWith(httpsPin)) {
        errors.push(
          `${name} resolved must start with ${httpsPin} (found ${resolved || "nothing"})`,
        );
      }
    }

    if (
      name.includes("node_modules") &&
      entry?.link !== true &&
      typeof entry?.version !== "string"
    ) {
      errors.push(`${name} has no version`);
    }
  }

  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
  const errors = checkLockfile(lock);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }
}
