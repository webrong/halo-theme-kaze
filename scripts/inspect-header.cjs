const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const pageW = document.documentElement.clientWidth;
    const h1 = document.querySelector(".photos-header .section-title");
    const header = document.querySelector(".photos-header");
    const count = document.querySelector(".photos-count");
    const sub = document.querySelector(".photos-header-sub");
    const pills = document.querySelector(".filter-pills");
    const pillsRect = pills ? pills.getBoundingClientRect() : null;
    const countRect = count ? count.getBoundingClientRect() : null;
    const cs = count ? window.getComputedStyle(count) : null;
    return {
      h1Removed: !h1,
      subRemoved: !sub,
      countPresent: !!count,
      countText: count ? count.textContent.trim() : null,
      countFontSize: cs ? cs.fontSize : null,
      countFontWeight: cs ? cs.fontWeight : null,
      countColor: cs ? cs.color : null,
      countX: countRect ? Math.round(countRect.x) : null,
      countRight: countRect ? Math.round(pageW - countRect.right) : null,
      pillsX: pillsRect ? Math.round(pillsRect.x) : null,
      pillsRight: pillsRect ? Math.round(pageW - pillsRect.right) : null,
      pillsLeftOfCount: (pillsRect && countRect) ? pillsRect.x < countRect.x : null,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: "screens/v5-photos-header.png" });

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
