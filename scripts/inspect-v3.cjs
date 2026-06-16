const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const pageW = document.documentElement.clientWidth;
    const els = [
      ".photo-detail-page",
      ".photo-detail-back",
      ".photo-detail-figure",
      ".photo-detail-img",
      ".photo-detail-info",
      ".photo-detail-title",
      ".photo-exif-strip",
      ".photo-exif-chip",
      ".photo-exif-details",
      ".photo-neighbors",
      ".photo-detail-nav",
    ];
    const result = { pageWidth: pageW };
    for (const sel of els) {
      const el = document.querySelector(sel);
      if (!el) { result[sel] = null; continue; }
      const r = el.getBoundingClientRect();
      result[sel] = {
        x: Math.round(r.x),
        width: Math.round(r.width),
        leftGap: Math.round(r.x),
        rightGap: Math.round(pageW - r.right),
        isCentered: Math.abs(r.x - (pageW - r.right)) < 5,
      };
    }
    // chip count
    result.chipCount = document.querySelectorAll(".photo-exif-chip").length;
    result.neighborCount = document.querySelectorAll(".photo-neighbor-thumb").length;
    // image natural size
    const img = document.querySelector(".photo-detail-img");
    result.img = img ? {
      natW: img.naturalWidth, natH: img.naturalHeight,
      renderW: Math.round(img.getBoundingClientRect().width),
      renderH: Math.round(img.getBoundingClientRect().height),
    } : null;
    return result;
  });
  console.log(JSON.stringify(info, null, 2));

  // Mobile
  const m = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await m.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await m.waitForTimeout(1500);
  const mInfo = await m.evaluate(() => {
    const pageW = 390;
    const fig = document.querySelector(".photo-detail-figure");
    const strip = document.querySelector(".photo-exif-strip");
    const r1 = fig.getBoundingClientRect();
    const r2 = strip ? strip.getBoundingClientRect() : null;
    return {
      figLeft: Math.round(r1.x), figRight: Math.round(pageW - r1.right),
      figW: Math.round(r1.width),
      stripLeft: r2 ? Math.round(r2.x) : null,
      stripRight: r2 ? Math.round(pageW - r2.right) : null,
      chipCount: document.querySelectorAll(".photo-exif-chip").length,
    };
  });
  console.log("\nMobile:", JSON.stringify(mInfo, null, 2));

  // Screenshot
  await page.screenshot({ path: "screens/v4-detail-desktop.png" });
  await page.screenshot({ path: "screens/v4-detail-desktop-full.png", fullPage: true });
  await m.screenshot({ path: "screens/v4-detail-mobile.png" });
  await m.screenshot({ path: "screens/v4-detail-mobile-full.png", fullPage: true });

  await browser.close();
  console.log("Done.");
})().catch((e) => { console.error(e); process.exit(1); });
