import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import assert from "node:assert/strict";

const root = resolve(".");
const roots = ["src", "public", "dist", "scripts", "docs"];
const files = [
  ".gitignore",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "index.html",
  "README.md",
  "DESIGN.md",
];
async function walk(path) {
  for (const item of await readdir(path, { withFileTypes: true })) {
    assert(
      !["node_modules", ".cache", ".npm", ".vite", ".git"].includes(item.name),
      `Unnecessary directory in deliverable: ${path}/${item.name}`,
    );
    assert(
      !item.isSymbolicLink(),
      `Deliverable must not contain symlinks: ${path}/${item.name}`,
    );
    const p = join(path, item.name);
    if (item.isDirectory()) await walk(p);
    else files.push(p);
  }
}
for (const path of roots) await walk(path);
let total = 0;
let runtimeBytes = 0;
for (const path of files) total += (await stat(path)).size;
assert(total < 8388608, `Submission is too large: ${total} bytes`);
for (const path of ["public", "dist"]) {
  const subset = files.filter((f) => f.startsWith(path + "/"));
  const bytes = (
    await Promise.all(subset.map(async (f) => (await stat(f)).size))
  ).reduce((sum, n) => sum + n, 0);
  assert(
    bytes <= 2 * 1024 * 1024,
    `${path} exceeds its explicit 2 MiB path budget`,
  );
  runtimeBytes += bytes;
  console.log(
    `${path}: ${subset.length} files, ${bytes.toLocaleString()} bytes`,
  );
}
assert(total - runtimeBytes <= 1048576, "Source/configuration/lockfile/documentation exceeds its explicit 1 MiB path budget");
const html = await readFile("dist/index.html", "utf8");
assert(/<title>.+<\/title>/.test(html), "Title is required");
for (const name of ["description", "og:title", "og:image"])
  assert(html.includes(`"${name}"`), `Missing ${name}`);
assert(html.includes('rel="icon"'), "Favicon is required");
const localRefs = [
  ...html.matchAll(/(?:src|href|content)="(\.\/[^"?]+)(?:\?[^\"]*)?"/g),
].map((match) => match[1]);
for (const reference of localRefs) await stat(resolve(root, "dist", reference));
assert(
  !/(?:src|href)="\/(?!\/)/.test(html),
  "Root-relative asset URL in export",
);
assert(!html.includes("/src/"), "Export references source");
assert(
  files.some((f) => f.endsWith(".woff2")),
  "Locally bundled font is required",
);
assert(
  files.some((f) => f.endsWith("swamp-squad.webp")),
  "Squad artwork is required",
);
console.log(
  `Static references: ${localRefs.length} local references resolved.`,
);
console.log(
  `Submission: ${files.length} files, ${total.toLocaleString()} bytes (${(total / 1048576).toFixed(2)} MiB / 8 MiB).`,
);
