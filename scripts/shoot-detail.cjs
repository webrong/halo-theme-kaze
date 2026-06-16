const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const photos = ["photo-2utpn9if", "photo-tlhnhxa7", "photo-btwsjnms", "photo-fwxlsvmi"];
  for (let i = 0; i < photos.length; i++) {
    await page.goto("http://localhost:8090/photos/" + photos[i], { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `screens/center-detail-${i + 1}.png` });
    // Also clip just the figure area
    const fig = await page.$(".photo-detail-figure");
    if (fig) {
      const box = await fig.boundingBox();
      if (box) {
        await page.screenshot({
          path: `screens/center-fig-${i + 1}.png`,
          clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 },
        });
      }
    }
    console.log(`Shot ${photos[i]}`);
  }

  await browser.close();
  console.log("Done.");
})().catch((e) => { console.error(e); process.exit(1); });
