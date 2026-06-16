const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();

  // Desktop viewport shots (above the fold)
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  console.log("1. /photos desktop viewport...");
  await page.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screens/v2-photos-desktop.png" });

  // Scroll to show grid
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screens/v2-photos-desktop-grid.png" });

  // Hover first card
  const card = await page.$(".photo-card");
  if (card) {
    await page.evaluate(() => window.scrollTo(0, 250));
    await card.hover();
    await page.waitForTimeout(400);
    const box = await card.boundingBox();
    if (box) {
      await page.screenshot({
        path: "screens/v2-photos-hover.png",
        clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 20), width: box.width + 40, height: box.height + 40 },
      });
    }
  }

  // Detail page
  console.log("2. /photos/{name} desktop viewport...");
  await page.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screens/v2-photo-detail-desktop.png" });

  // Mobile detail
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const mpage = await mctx.newPage();
  console.log("3. /photos/{name} mobile viewport...");
  await mpage.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await mpage.waitForTimeout(2000);
  await mpage.screenshot({ path: "screens/v2-photo-detail-mobile.png" });

  // Mobile list
  console.log("4. /photos mobile viewport...");
  await mpage.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await mpage.waitForTimeout(2000);
  await mpage.screenshot({ path: "screens/v2-photos-mobile.png" });

  await browser.close();
  console.log("Done.");
})().catch((e) => { console.error(e); process.exit(1); });
