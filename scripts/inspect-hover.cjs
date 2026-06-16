const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  // Hover first card and inspect hover state
  const card = await page.$(".photo-card");
  if (card) {
    await card.hover();
    await page.waitForTimeout(500);
    const hoverInfo = await page.evaluate(() => {
      const c = document.querySelector(".photo-card");
      const overlay = c?.querySelector(".photo-card-overlay");
      const eye = c?.querySelector(".photo-card-eye");
      const caption = c?.querySelector(".photo-card-caption");
      const img = c?.querySelector("img");
      const ovS = overlay ? window.getComputedStyle(overlay) : null;
      const eyeS = eye ? window.getComputedStyle(eye) : null;
      const capS = caption ? window.getComputedStyle(caption) : null;
      const imgS = img ? window.getComputedStyle(img) : null;
      return {
        overlayOpacity: ovS ? ovS.opacity : null,
        overlayBg: ovS ? ovS.backgroundColor : null,
        eyeTransform: eyeS ? eyeS.transform : null,
        eyeBoxShadow: eyeS ? eyeS.boxShadow : null,
        captionOpacity: capS ? capS.opacity : null,
        captionTransform: capS ? capS.transform : null,
        imgFilter: imgS ? imgS.filter : null,
      };
    });
    console.log("=== Hover state ===");
    console.log(JSON.stringify(hoverInfo, null, 2));

    // Screenshot the hover state of first card
    const box = await card.boundingBox();
    if (box) {
      await page.screenshot({
        path: "screens/v3-photos-hover-card.png",
        clip: { x: Math.max(0, box.x - 16), y: Math.max(0, box.y - 16), width: box.width + 32, height: box.height + 32 },
      });
    }
    await page.screenshot({ path: "screens/v3-photos-hover-full.png" });
  }

  // Screenshot final clean states
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await page.screenshot({ path: "screens/v3-photos-desktop.png" });

  await page.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screens/v3-photo-detail-desktop.png" });

  // Mobile
  const m = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await m.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await m.waitForTimeout(1500);
  await m.screenshot({ path: "screens/v3-photos-mobile.png" });

  await m.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await m.waitForTimeout(1500);
  await m.screenshot({ path: "screens/v3-photo-detail-mobile.png" });

  await browser.close();
  console.log("Done.");
})().catch((e) => { console.error(e); process.exit(1); });
