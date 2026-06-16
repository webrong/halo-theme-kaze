const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();

  const photos = [
    { url: "/photos/photo-2utpn9if", ratio: "16:9 landscape (4096x2304)" },
    { url: "/photos/photo-tlhnhxa7", ratio: "4:3 landscape (4011x3009)" },
    { url: "/photos/photo-btwsjnms", ratio: "4:3 landscape (2304x1728)" },
    { url: "/photos/photo-fwxlsvmi", ratio: "unknown" },
  ];

  // Test multiple viewport heights to find the overlap condition
  const viewports = [
    { w: 1440, h: 900, label: "desktop 900" },
    { w: 1440, h: 768, label: "desktop 768 (short)" },
    { w: 1280, h: 800, label: "laptop 800" },
    { w: 390, h: 844, label: "mobile 844" },
    { w: 390, h: 667, label: "mobile 667 (short)" },
  ];

  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    console.log(`\n===== Viewport ${vp.label} (${vp.w}x${vp.h}) =====`);

    for (const p of photos) {
      try {
        await page.goto("http://localhost:8090" + p.url, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(1500);

        const info = await page.evaluate(() => {
          const vh = window.innerHeight;
          const figure = document.querySelector(".photo-detail-figure");
          const img = document.querySelector(".photo-detail-img");
          const nav = document.querySelector(".photo-detail-nav");
          const neighbors = document.querySelector(".photo-neighbors");
          if (!figure || !img || !nav) return null;

          const fR = figure.getBoundingClientRect();
          const iR = img.getBoundingClientRect();
          const nR = nav.getBoundingClientRect();
          const neR = neighbors ? neighbors.getBoundingClientRect() : null;
          // Check overlap: is nav's top above figure's bottom? Or neighbors overlapping?
          const navOverlapsFigure = nR.top < fR.bottom;
          const neighborsOverlapsFigure = neR ? (neR.top < fR.bottom) : false;
          // Distance from figure bottom to nav top (should be > 0)
          const gapFigToNav = Math.round(nR.top - fR.bottom);
          return {
            imgRatio: (iR.width / iR.height).toFixed(2),
            imgH: Math.round(iR.height),
            imgH_pct_vh: Math.round((iR.height / vh) * 100) + "%",
            figBottom: Math.round(fR.bottom),
            navTop: Math.round(nR.top),
            navH: Math.round(nR.height),
            gapFigToNav,
            navOverlapsFigure,
            neighborsOverlapsFigure,
            isNavInView: nR.top < vh, // is nav top in the first viewport?
            imgFillsViewport: iR.height >= vh * 0.7,
          };
        });
        if (info) {
          console.log(`${p.ratio}: imgH=${info.imgH}px (${info.imgH_pct_vh}), gap=${info.gapFigToNav}px, overlap=${info.navOverlapsFigure}, navInView=${info.isNavInView}, imgFills=${info.imgFillsViewport}`);
        }
      } catch (e) {
        console.log(`${p.ratio}: ERROR ${e.message.slice(0, 50)}`);
      }
    }
    await ctx.close();
  }

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
