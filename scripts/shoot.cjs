const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // 1. List page - desktop
  console.log("Shooting /photos (desktop)...");
  await page.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screens/photos-desktop.png", fullPage: true });

  // Hover a photo card to capture hover state
  const card = await page.$(".photo-card");
  if (card) {
    await card.hover();
    await page.waitForTimeout(400);
    await page.screenshot({ path: "screens/photos-hover.png", clip: { x: 0, y: 100, width: 1440, height: 700 } });
  }

  // 2. List page - mobile
  await ctx.close();
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mpage = await mctx.newPage();
  console.log("Shooting /photos (mobile)...");
  await mpage.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await mpage.waitForTimeout(1500);
  await mpage.screenshot({ path: "screens/photos-mobile.png", fullPage: true });

  // 3. Detail page - find first photo link
  console.log("Shooting /photos/{name} (desktop)...");
  const dctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const dpage = await dctx.newPage();
  await dpage.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await dpage.waitForTimeout(1000);
  const firstLink = await dpage.$(".photo-card");
  let detailUrl = null;
  if (firstLink) {
    detailUrl = await firstLink.evaluate((el) => el.getAttribute("href"));
  }
  console.log("Detail URL:", detailUrl);

  if (detailUrl) {
    await dpage.goto("http://localhost:8090" + detailUrl, { waitUntil: "networkidle", timeout: 30000 });
    await dpage.waitForTimeout(1500);
    await dpage.screenshot({ path: "screens/photo-detail-desktop.png", fullPage: true });
    // Also viewport-only to see above-the-fold
    await dpage.screenshot({ path: "screens/photo-detail-viewport.png" });
  }

  // 4. Detail page - mobile
  const dmctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const dmpage = await dmctx.newPage();
  if (detailUrl) {
    console.log("Shooting /photos/{name} (mobile)...");
    await dmpage.goto("http://localhost:8090" + detailUrl, { waitUntil: "networkidle", timeout: 30000 });
    await dmpage.waitForTimeout(1500);
    await dmpage.screenshot({ path: "screens/photo-detail-mobile.png", fullPage: true });
  }

  await browser.close();
  console.log("Done. Screenshots in screens/");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
