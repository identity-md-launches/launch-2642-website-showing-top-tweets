import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const url =
  process.argv[2] ??
  JSON.parse(await readFile("test/scratch/validation-preview.json", "utf8"))
    .url;
const browser = await chromium.launch({ headless: true });
const measurements = [];
const luminance = ([red, green, blue]) => {
  const f = (n) => {
    const v = n / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(red) + 0.7152 * f(green) + 0.0722 * f(blue);
};
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1,
    });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const samples = await page.evaluate(() => {
      const first = document.querySelector(".hero h1");
      const nodes = [
        first.childNodes[0],
        ...[".hero h1 span", ".hero-content p", ".hero-caption"].flatMap(
          (selector) =>
            [...(document.querySelector(selector)?.childNodes ?? [])].filter(
              (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
            ),
        ),
      ];
      return nodes.flatMap((node) => {
        const el = node.parentElement;
        const range = document.createRange();
        range.selectNodeContents(node);
        const style = getComputedStyle(el);
        const size = parseFloat(style.fontSize);
        return [...range.getClientRects()]
          .filter((r) => r.width > 0 && r.height > 0)
          .map((r) => ({
            text: node.textContent,
            color: style.color,
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            threshold:
              size >= 24 || (size >= 18.66 && parseInt(style.fontWeight) >= 700)
                ? 3
                : 4.5,
          }));
      });
    });
    await page.addStyleTag({
      content:
        ".hero h1,.hero-content p,.hero-caption {visibility:hidden !important;}",
    });
    const png = PNG.sync.read(await page.screenshot());
    for (const sample of samples) {
      const rgb = sample.color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
      const foreground = luminance(rgb);
      let minimum = Infinity;
      for (
        let y = Math.max(0, Math.floor(sample.y));
        y < Math.min(png.height, Math.ceil(sample.y + sample.height));
        y++
      ) {
        for (
          let x = Math.max(0, Math.floor(sample.x));
          x < Math.min(png.width, Math.ceil(sample.x + sample.width));
          x++
        ) {
          const i = (y * png.width + x) * 4;
          const background = luminance([
            png.data[i],
            png.data[i + 1],
            png.data[i + 2],
          ]);
          minimum = Math.min(
            minimum,
            (Math.max(foreground, background) + 0.05) /
              (Math.min(foreground, background) + 0.05),
          );
        }
      }
      measurements.push({
        viewport: width,
        text: sample.text,
        foreground: sample.color,
        minimumContrast: Number(minimum.toFixed(2)),
        required: sample.threshold,
        passed: minimum >= sample.threshold,
      });
    }
    await page.close();
  }
  await mkdir("test/scratch/validation", { recursive: true });
  await writeFile(
    "test/scratch/validation/hero-contrast.json",
    JSON.stringify(measurements, null, 2),
  );
  console.log(JSON.stringify(measurements, null, 2));
  assert(
    measurements.every((sample) => sample.passed),
    "Text over artwork has insufficient conservative background contrast",
  );
} finally {
  await browser.close();
}
