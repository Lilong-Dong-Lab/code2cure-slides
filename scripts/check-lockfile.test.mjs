import assert from "node:assert/strict";
import test from "node:test";
import { checkLockfile } from "./check-lockfile.mjs";

test("the theme pin stays on git+https and a node_modules entry has a version", () => {
  const errors = checkLockfile({
    packages: {
      "": { name: "code2cure-slides" },
      "packages/medbio-bioinfo-tools": {
        dependencies: { gsap: "^3.13.0" },
      },
      "node_modules/slidev-theme-hebmu": {
        version: "0.2.0",
        resolved:
          "git+https://github.com/Lilong-Dong-Lab/slidev-theme-hebmu.git#e1ff57708937be230805794d637280a5fd6ca535",
      },
      "node_modules/gsap": { version: "3.15.0" },
      "node_modules/medbio-bioinfo-tools": {
        resolved: "packages/medbio-bioinfo-tools",
        link: true,
      },
    },
  });

  assert.deepEqual(errors, []);
});

test("a git+ssh theme pin is rejected", () => {
  const errors = checkLockfile({
    packages: {
      "node_modules/slidev-theme-hebmu": {
        version: "0.2.0",
        resolved:
          "git+ssh://git@github.com/Lilong-Dong-Lab/slidev-theme-hebmu.git#e1ff57708937be230805794d637280a5fd6ca535",
      },
    },
  });

  assert.equal(errors.length, 1);
  assert.match(errors[0], /git\+ssh/);
});

test("a node_modules entry with no version is rejected", () => {
  const errors = checkLockfile({
    packages: {
      "packages/medbio-bioinfo-tools/node_modules/gsap": { dev: true },
    },
  });

  assert.equal(errors.length, 1);
  assert.match(errors[0], /gsap/);
});
