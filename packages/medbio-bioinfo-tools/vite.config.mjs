import { copyFileSync, createReadStream, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { defineConfig } from "vite";

const source = resolve(import.meta.dirname, "../../node_modules/slidev-theme-hebmu/public");
const names = new Set(["campus-cover.jpeg", "campus-end.jpeg", "hebmu-logo.png", "favicon.svg"]);

function typeFor(name) {
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

export default defineConfig({
  plugins: [
    {
      name: "hebmu-theme-public",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = (req.url ?? "").split("?")[0];
          const name = pathname.startsWith("/theme/") ? pathname.slice("/theme/".length) : "";
          if (!names.has(name)) return next();
          const file = join(source, name);
          if (!existsSync(file)) return next();
          res.setHeader("Content-Type", typeFor(name));
          createReadStream(file).pipe(res);
        });
      },
      writeBundle(options) {
        const dest = join(options.dir ?? resolve(import.meta.dirname, "dist"), "theme");
        mkdirSync(dest, { recursive: true });
        for (const name of names) {
          const file = join(source, name);
          if (existsSync(file)) copyFileSync(file, join(dest, name));
        }
      },
    },
  ],
});
