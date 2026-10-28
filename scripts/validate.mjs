import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = resolve("dist");
const output = resolve("test/scratch/validation");
const fixture = JSON.parse(await readFile("src/data/posts.json", "utf8"));
await mkdir(output, { recursive: true });
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (pathname === "/__finish" && process.argv.includes("--inspect")) {
      response.end("Inspection complete");
      server.close();
      return;
    }
    if (!pathname.startsWith("/preview/")) {
      response.writeHead(404).end();
      return;
    }
    const relative = pathname.slice("/preview/".length) || "index.html";
    const path = resolve(root, relative);
    if (!path.startsWith(root + "/")) {
      response.writeHead(403).end();
      return;
    }
    response.setHeader(
      "Content-Type",
      mime[extname(path)] || "application/octet-stream",
    );
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "0.0.0.0", done));
const address = server.address();
const url = `http://127.0.0.1:${address.port}/preview/`;
console.log(`Production export preview: ${url}`);
await writeFile(
  resolve("test/scratch/validation-preview.json"),
  JSON.stringify({ url }, null, 2),
);
const results = [];
const limitations = [];
const errors = [];
const record = (name, evidence = "") => {
  results.push({ name, passed: true, evidence });
  console.log(`PASS ${name}${evidence ? ": " + evidence : ""}`);
};
const wait = (page) => page.waitForTimeout(60);
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  const badResponses = [];
  page.on("response", (response) => {
    if (response.status() >= 400 && response.url().startsWith(url))
      badResponses.push(response.url());
  });
  await page.route("**/*", (route) =>
    route.request().url().startsWith(url) ? route.continue() : route.abort(),
  );
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("article").count(), 6);
  record("Initial feed shows six sourced tweets");
  const ordered = fixture.posts.toSorted(
    (a, b) =>
      b.likes - a.likes || Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  assert.equal(
    await page.locator("article").first().getAttribute("data-post-id"),
    ordered[0].id,
  );
  record("Default order uses captured likes");
  const firstRead = page
    .locator("article")
    .first()
    .locator(".tweet-readline a");
  assert.equal(await firstRead.getAttribute("href"), ordered[0].url);
  assert.equal(await firstRead.getAttribute("target"), "_blank");
  record("Original tweet opens through an actual X source link");
  await page.getByRole("button", { name: "Show 6 more tweets" }).click();
  assert.equal(await page.locator("article").count(), 12);
  record("Show more reveals all twelve tweets");
  await page
    .getByRole("combobox", { name: "Sort tweets" })
    .selectOption("newest");
  assert.equal(
    await page.locator("article").first().getAttribute("data-post-id"),
    fixture.posts.toSorted(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    )[0].id,
  );
  record("Newest sort orders real post timestamps");
  await page
    .getByRole("combobox", { name: "Sort tweets" })
    .selectOption("reposts");
  assert.equal(
    await page.locator("article").first().getAttribute("data-post-id"),
    fixture.posts.toSorted((a, b) => b.reposts - a.reposts)[0].id,
  );
  record("Repost sort orders captured repost counts");
  for (const topic of ["AI & agents", "Building", "Community"]) {
    await page
      .getByRole("group", { name: "Filter tweets by topic" })
      .getByRole("button", { name: topic, exact: true })
      .click();
    assert.equal(
      await page.locator("article").count(),
      fixture.posts.filter((post) => post.topic === topic).length,
    );
    assert.equal(
      await page.locator("article .topic-label").first().textContent(),
      topic,
    );
    record(`${topic} filter returns the matching posts`);
  }
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  const search = page.getByRole("searchbox", { name: "Search" });
  await search.fill("  bAnKlEsS  ");
  assert.equal(await page.locator("article").count(), 1);
  record("Search is case-insensitive and trims spaces");
  await search.fill("AI workforce");
  assert.equal(await page.locator("article").count(), 1);
  record("Search matches multiple terms");
  await search.fill("surfcoderepeat");
  assert.equal(
    await page.locator("article").count(),
    fixture.posts.filter((post) => post.handle === "surfcoderepeat").length,
  );
  record("Search finds author handles");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  assert.equal(await search.inputValue(), "");
  assert.equal(
    await search.evaluate((input) => document.activeElement === input),
    true,
  );
  record("Clear search returns focus to the field");
  await search.fill("no-such-swamp-result");
  assert.equal(await page.locator("article").count(), 0);
  assert(
    await page
      .getByRole("heading", { name: "Nothing in this corner of the swamp." })
      .isVisible(),
  );
  record("Empty search explains the state and offers reset");
  await page
    .locator(".empty-state")
    .getByRole("button", { name: "Reset filters" })
    .click();
  assert.equal(await page.locator("article").count(), 6);
  record("Empty-state reset restores feed");
  await page
    .getByRole("group", { name: "Filter tweets by topic" })
    .getByRole("button", { name: "Building", exact: true })
    .click();
  await search.fill("Bankless");
  assert.equal(await page.locator("article").count(), 0);
  record("Topic and search combine correctly");
  await page
    .locator(".empty-state")
    .getByRole("button", { name: "Reset filters" })
    .click();
  const saveButton = page
    .locator("article")
    .first()
    .locator(".bookmark-button");
  const savedId = await page
    .locator("article")
    .first()
    .getAttribute("data-post-id");
  await saveButton.click();
  assert.equal(await saveButton.getAttribute("aria-pressed"), "true");
  record("Bookmark has selected state");
  await page.getByRole("link", { name: /^Saved/ }).click();
  assert.equal(await page.locator("article").count(), 1);
  assert.equal(
    await page.locator("article").getAttribute("data-post-id"),
    savedId,
  );
  assert.equal(new URL(page.url()).hash, "#saved");
  record("Saved navigation shows the saved post");
  assert.equal(await page.locator("h1").count(), 1);
  record("Saved view retains one main page heading");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("article").count(), 1);
  record("Bookmarks survive reload and saved deep-link");
  await page.locator("article .bookmark-button").click();
  assert.equal(await page.locator("article").count(), 0);
  assert(
    await page
      .getByRole("heading", { name: "Keep a little signal." })
      .isVisible(),
  );
  assert.equal(
    await page.locator("#feed").evaluate((el) => document.activeElement === el),
    true,
  );
  record("Unsave reaches useful empty state and preserves keyboard focus");
  await page.getByRole("button", { name: "Explore the feed" }).click();
  assert.equal(await page.locator("article").count(), 6);
  record("Empty saved view returns to the feed");
  await page.locator("article .share-button").first().click();
  await page
    .getByText("Tweet link copied", { exact: true })
    .waitFor({ state: "visible" });
  assert(
    await page.getByText("Tweet link copied", { exact: true }).isVisible(),
  );
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert(fixture.posts.some((post) => post.url === copied));
  record("Share copies the actual source URL");
  await page
    .getByRole("button", { name: "Dismiss copied notification" })
    .click();
  assert.equal(await page.locator(".copy-notice").count(), 0);
  record("Copy confirmation can be dismissed");
  const about = page.getByRole("button", {
    name: "About this feed",
    exact: true,
  });
  await about.click();
  assert(
    await page.getByRole("dialog", { name: "A little context." }).isVisible(),
  );
  assert.equal(
    await page
      .locator("dialog[open]")
      .evaluate((el) => el.contains(document.activeElement)),
    true,
  );
  record("About dialog opens with focus inside");
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator("dialog[open]")
        .evaluate(
          (el) =>
            document.activeElement === document.body ||
            el.contains(document.activeElement),
        ),
      true,
    );
  }
  record(
    "Native modal keeps background page controls out of the keyboard flow",
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  assert.equal(
    await about.evaluate((el) => document.activeElement === el),
    true,
  );
  record("Escape closes dialog and restores trigger focus");
  await about.click();
  await page.getByRole("button", { name: "Close about this feed" }).click();
  record("Dialog close control works");
  const audit = await new AxeBuilder({ page }).analyze();
  await writeFile(
    resolve(output, "axe.json"),
    JSON.stringify(audit.violations, null, 2),
  );
  assert.equal(
    audit.violations.length,
    0,
    JSON.stringify(
      audit.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
      })),
    ),
  );
  record("Axe accessibility scan has no violations");
  for (const [width, height] of [
    [320, 844],
    [390, 844],
    [704, 1000],
    [990, 1000],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    assert(dimensions.scroll <= dimensions.viewport, `Overflow at ${width}`);
    record(`No horizontal overflow at ${width}px`, JSON.stringify(dimensions));
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: resolve(output, `${width}.png`),
        fullPage: false,
      });
    if (process.argv.includes("--capture") && (width === 390 || width === 1440)) {
      await mkdir("docs/screenshots", { recursive: true });
      await page.screenshot({ path: resolve(`docs/screenshots/${width}.jpg`), type: "jpeg", quality: 84, fullPage: false });
    }
    if (width === 390) {
      const product = await page
        .locator("article blockquote")
        .first()
        .boundingBox();
      const action = await page
        .getByRole("link", { name: "Explore top tweets" })
        .boundingBox();
      assert(action && action.y + action.height <= height);
      assert(product && product.y + product.height <= height);
      record(
        "390px first screen shows complete first tweet excerpt and main action",
        JSON.stringify({ product, action }),
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "Explore top tweets" }).click();
  await wait(page);
  assert.equal(
    await page.locator("#feed").evaluate((el) => document.activeElement === el),
    true,
  );
  record("Hero action takes keyboard focus to the feed");
  await search.fill("Venice");
  assert.equal(await page.locator("article").count(), 1);
  record("Mobile search remains usable");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const transitions = await page
    .locator(".button-primary")
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  assert.equal(transitions, "0s");
  record("Reduced motion removes transitions");
  await page.emulateMedia({ forcedColors: "active" });
  await page.keyboard.press("Tab");
  await page
    .getByRole("button", { name: "About this feed", exact: true })
    .focus();
  const focus = await page
    .locator(":focus")
    .evaluate((el) => ({
      style: getComputedStyle(el).outlineStyle,
      width: getComputedStyle(el).outlineWidth,
    }));
  assert.equal(focus.style, "solid");
  assert.equal(focus.width, "2px");
  record("Forced-colors keyboard focus remains visible");
  await page.emulateMedia({
    forcedColors: "none",
    reducedMotion: "no-preference",
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  assert.equal(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
  );
  record("RTL layout has no horizontal overflow");
  await page.evaluate(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.style.fontSize = "200%";
  });
  assert.equal(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
  );
  record("200% text enlargement reflows without horizontal overflow");
  await page.screenshot({
    path: resolve(output, "text-200.png"),
    fullPage: true,
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "";
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const blocked = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await blocked.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
      configurable: true,
    });
  });
  const denied = await blocked.newPage();
  await denied.goto(url, { waitUntil: "networkidle" });
  await denied.locator("article .share-button").first().click();
  assert(
    await denied.getByRole("dialog", { name: "Share this tweet" }).isVisible(),
  );
  const fallback = await denied
    .getByRole("textbox", { name: "Tweet link" })
    .inputValue();
  assert(fixture.posts.some((post) => post.url === fallback));
  record("Denied clipboard opens a selectable real source link");
  await denied.keyboard.press("Escape");
  assert.equal(await denied.locator("dialog[open]").count(), 0);
  record("Share fallback closes with Escape");
  await blocked.close();
  const unavailable = await browser.newContext();
  await unavailable.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("denied");
      },
      configurable: true,
    });
  });
  const volatile = await unavailable.newPage();
  await volatile.goto(url, { waitUntil: "networkidle" });
  assert(
    await volatile
      .getByText(
        "Browser storage is unavailable. Saves stay until this page reloads.",
      )
      .isVisible(),
  );
  await volatile.locator("article .bookmark-button").first().click();
  await volatile.getByRole("link", { name: /^Saved/ }).click();
  assert.equal(await volatile.locator("article").count(), 1);
  record("Blocked localStorage is explained and in-memory saves still work");
  await unavailable.close();
  const malformed = await browser.newContext();
  await malformed.addInitScript(() =>
    localStorage.setItem("the-swamp:saved:v1", "broken-json"),
  );
  const corrupt = await malformed.newPage();
  await corrupt.goto(url, { waitUntil: "networkidle" });
  assert.equal(await corrupt.locator("article").count(), 6);
  assert.equal(await corrupt.locator(".storage-note").count(), 0);
  record("Malformed bookmark data recovers without misleading storage warning");
  await malformed.close();
  const images = await page.evaluate(() =>
    [...document.images]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.src),
  );
  assert.equal(images.length, 0, JSON.stringify(images));
  record("All displayed local images load");
  assert.equal(
    await page.evaluate(() => document.fonts.check('16px "Manrope Variable"')),
    true,
  );
  record("Local Manrope font loads");
  assert.equal(errors.length, 0, JSON.stringify(errors));
  assert.equal(badResponses.length, 0, JSON.stringify(badResponses));
  record("No console page errors or failed local resources");
  await context.close();
  try {
    const safari = await webkit.launch({ headless: true });
    const p = await safari.newPage({ viewport: { width: 390, height: 844 } });
    await p.goto(url, { waitUntil: "networkidle" });
    await p.getByRole("searchbox", { name: "Search" }).fill("Bankless");
    assert.equal(await p.locator("article").count(), 1);
    record("WebKit primary search works");
    await safari.close();
  } catch (error) {
    limitations.push(
      "WebKit could not launch: its required native runtime libraries are unavailable. Safari rendering and interaction remain unverified.",
    );
    console.log("LIMITATION WebKit runtime unavailable");
  }
  await browser.close();
  browser = null;
  await writeFile(
    resolve(output, "results.json"),
    JSON.stringify(
      { passed: results.length, results, limitations, errors },
      null,
      2,
    ),
  );
  console.log(
    `Validation complete: ${results.length} checks passed; ${limitations.length} limitation(s).`,
  );
} catch (error) {
  console.error(error);
  await writeFile(
    resolve(output, "results.json"),
    JSON.stringify(
      {
        passed: results.length,
        results,
        limitations,
        failure: String(error),
        errors,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (process.argv.includes("--inspect")) {
    console.log(
      `Preview available for inspection for at most five minutes: ${url}`,
    );
    const timer = setTimeout(() => server.close(), 300000);
    server.once("close", () => clearTimeout(timer));
  } else await new Promise((done) => server.close(done));
}
