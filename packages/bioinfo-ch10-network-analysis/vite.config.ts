import { existsSync, createReadStream, statSync, readdirSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, join, extname, relative } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

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

function collectFiles(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(full, base));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function themeStaticPlugin(): Plugin {
  const themePublicDir = resolve(
    import.meta.dirname,
    "node_modules/slidev-theme-hebmu/public",
  );

  let outDir: string | undefined;

  return {
    name: "theme-static-assets",

    // Dev: serve /theme/* from theme public dir
    configureServer(server) {
      if (!existsSync(themePublicDir)) return;

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (!url || !url.startsWith("/theme/")) return next();

        const relativePath = url.slice("/theme/".length);
        if (relativePath.includes("..")) return next();

        const filePath = join(themePublicDir, relativePath);
        if (!existsSync(filePath)) return next();

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

    // Build: copy theme public files to dist/<base>/theme/ after bundling
    writeBundle(options) {
      if (!existsSync(themePublicDir)) return;
      outDir = options.dir;
      if (!outDir) return;

      const files = collectFiles(themePublicDir);
      for (const absFile of files) {
        const rel = relative(themePublicDir, absFile);
        const dest = join(outDir, "theme", rel);
        mkdirSync(resolve(dest, ".."), { recursive: true });
        copyFileSync(absFile, dest);
      }
    },

    // Remove the incorrectly-nested directory left by vite-plugin-static-copy
    closeBundle() {
      if (!outDir) return;
      const themeDir = join(outDir, "theme");
      if (!existsSync(themeDir)) return;
      for (const entry of readdirSync(themeDir, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name === "node_modules") {
          rmSync(join(themeDir, entry.name), { recursive: true, force: true });
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [themeStaticPlugin()],
});
