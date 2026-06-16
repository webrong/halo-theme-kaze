const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const flow = await page.evaluate(() => {
    const pageW = document.documentElement.clientWidth;
    const els = [
      ".photography-page",
      ".section-header",
      ".photo-detail-layout",
      ".photo-detail-figure",
      ".photo-exif-panel",
      ".photo-neighbors",
      ".photo-detail-nav",
      ".photo-comments",
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
        isCentered: Math.abs(r.x - (pageW - r.right)) < 4,
      };
    }
    // Also capture the page content max-width
    const pp = document.querySelector(".photography-page");
    if (pp) {
      const ps = window.getComputedStyle(pp);
      result.pageMaxWidth = ps.maxWidth;
      result.pagePadding = ps.paddingLeft + " / " + ps.paddingRight;
    }
    return result;
  });
  console.log(JSON.stringify(flow, null, 2));

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
