import {
  existsSync,
  createReadStream,
  statSync,
  readdirSync,
  copyFileSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve, join, extname, relative } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const require = createRequire(import.meta.url);

const MIME_TYPES: Record<string, string> = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    entry.isDirectory() ? collectFiles(full, out) : out.push(full);
  }
  return out;
}

function resolveThemePublicDir(): string | undefined {
  try {
    const themePackageJson = require.resolve("slidev-theme-hebmu/package.json");
    return resolve(dirname(themePackageJson), "public");
  } catch {
    const fallback = resolve(
      import.meta.dirname,
      "node_modules/slidev-theme-hebmu/public",
    );
    return existsSync(fallback) ? fallback : undefined;
  }
}

function themeStaticPlugin(): Plugin {
  const themePublicDir = resolveThemePublicDir();

  let outDir: string | undefined;

  return {
    name: "theme-static-assets",

    configureServer(server) {
      if (!themePublicDir || !existsSync(themePublicDir)) return;

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (!url || !url.startsWith("/theme/")) return next();

        const relativePath = url.slice("/theme/".length);
        const filePath = resolve(themePublicDir, relativePath);
        if (!filePath.startsWith(themePublicDir + "/")) return next();

        try {
          const stat = statSync(filePath);
          if (!stat.isFile()) return next();

          const ext = extname(filePath).toLowerCase();
          const mime = MIME_TYPES[ext];
          if (mime) res.setHeader("Content-Type", mime);

          res.setHeader("Content-Length", stat.size);
          res.setHeader("Cache-Control", "no-cache");
          createReadStream(filePath).pipe(res);
        } catch {
          next();
        }
      });
    },

    writeBundle(options) {
      if (!themePublicDir || !existsSync(themePublicDir) || !options.dir) {
        return;
      }
      outDir = options.dir;

      const files = collectFiles(themePublicDir);
      for (const absFile of files) {
        const rel = relative(themePublicDir, absFile);
        const dest = join(outDir, "theme", rel);
        mkdirSync(resolve(dest, ".."), { recursive: true });
        copyFileSync(absFile, dest);
      }
    },

    // Slidev's build copies the pnpm symlink tree into dist/.../theme/node_modules/
    closeBundle() {
      if (!outDir) return;
      const nm = join(outDir, "theme", "node_modules");
      if (existsSync(nm)) rmSync(nm, { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  plugins: [themeStaticPlugin()],
});
