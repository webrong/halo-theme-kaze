const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const figure = document.querySelector(".photo-detail-figure");
    const img = document.querySelector(".photo-detail-img");
    const layout = document.querySelector(".photo-detail-layout");
    const figRect = figure ? figure.getBoundingClientRect() : null;
    const imgRect = img ? img.getBoundingClientRect() : null;
    const layoutRect = layout ? layout.getBoundingClientRect() : null;
    const imgStyle = img ? window.getComputedStyle(img) : null;
    const figStyle = figure ? window.getComputedStyle(figure) : null;
    const layoutStyle = layout ? window.getComputedStyle(layout) : null;
    return {
      layout: {
        width: layoutRect ? Math.round(layoutRect.width) : null,
        cols: layoutStyle ? layoutStyle.gridTemplateColumns : null,
        padding: layoutStyle ? layoutStyle.padding : null,
      },
      figure: {
        x: figRect ? Math.round(figRect.x) : null,
        width: figRect ? Math.round(figRect.width) : null,
        height: figRect ? Math.round(figRect.height) : null,
        display: figStyle ? figStyle.display : null,
        textAlign: figStyle ? figStyle.textAlign : null,
        justifyContent: figStyle ? figStyle.justifyContent : null,
        alignItems: figStyle ? figStyle.alignItems : null,
        margin: figStyle ? figStyle.margin : null,
        padding: figStyle ? figStyle.padding : null,
        overflow: figStyle ? figStyle.overflow : null,
      },
      img: {
        x: imgRect ? Math.round(imgRect.x) : null,
        left: imgRect ? Math.round(imgRect.left) : null,
        right: imgRect ? Math.round(imgRect.right) : null,
        width: imgRect ? Math.round(imgRect.width) : null,
        height: imgRect ? Math.round(imgRect.height) : null,
        naturalW: img ? img.naturalWidth : null,
        naturalH: img ? img.naturalHeight : null,
        display: imgStyle ? imgStyle.display : null,
        width_css: imgStyle ? imgStyle.width : null,
        height_css: imgStyle ? imgStyle.height : null,
        objectFit: imgStyle ? imgStyle.objectFit : null,
        margin: imgStyle ? imgStyle.margin : null,
        marginLeft: imgStyle ? imgStyle.marginLeft : null,
        marginRight: imgStyle ? imgStyle.marginRight : null,
      },
      gap: {
        figToImgLeft: (figRect && imgRect) ? Math.round(imgRect.left - figRect.left) : null,
        figToImgRight: (figRect && imgRect) ? Math.round(figRect.right - imgRect.right) : null,
        figToImgTop: (figRect && imgRect) ? Math.round(imgRect.top - figRect.top) : null,
        figToImgBottom: (figRect && imgRect) ? Math.round(figRect.bottom - imgRect.bottom) : null,
      },
    };
  });
  console.log(JSON.stringify(info, null, 2));

  // Also test with a portrait-ish / different photo if exists
  const urls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".photo-neighbor-thumb")).map((a) => a.getAttribute("href"));
  });
  console.log("\nNeighbor URLs:", JSON.stringify(urls));

  // Test each neighbor to find different aspect ratios
  for (const u of urls.slice(0, 3)) {
    await page.goto("http://localhost:8090" + u, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);
    const nfo = await page.evaluate(() => {
      const figure = document.querySelector(".photo-detail-figure");
      const img = document.querySelector(".photo-detail-img");
      const figRect = figure ? figure.getBoundingClientRect() : null;
      const imgRect = img ? img.getBoundingClientRect() : null;
      return {
        url: location.pathname,
        figW: figRect ? Math.round(figRect.width) : null,
        figH: figRect ? Math.round(figRect.height) : null,
        imgW: imgRect ? Math.round(imgRect.width) : null,
        imgH: imgRect ? Math.round(imgRect.height) : null,
        natW: img ? img.naturalWidth : null,
        natH: img ? img.naturalHeight : null,
        leftGap: (figRect && imgRect) ? Math.round(imgRect.left - figRect.left) : null,
        rightGap: (figRect && imgRect) ? Math.round(figRect.right - imgRect.right) : null,
        topGap: (figRect && imgRect) ? Math.round(imgRect.top - figRect.top) : null,
        bottomGap: (figRect && imgRect) ? Math.round(figRect.bottom - imgRect.bottom) : null,
      };
    });
    console.log(JSON.stringify(nfo));
  }

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
