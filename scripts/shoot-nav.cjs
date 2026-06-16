const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Large photo (4:3)
  await page.goto("http://localhost:8090/photos/photo-tlhnhxa7", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screens/nav-issue-large-photo.png" });
  console.log("Shot large photo (viewport only, no scroll)");

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
