const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Inspect photos list page
  await page.goto("http://localhost:8090/photos", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const listInfo = await page.evaluate(() => {
    const grid = document.querySelector("#photos-grid");
    const cards = document.querySelectorAll(".photo-card");
    const header = document.querySelector(".photos-header");
    const pills = document.querySelectorAll(".filter-pill");
    const sub = document.querySelector(".photos-header-sub");
    const firstCard = cards[0];
    const firstCardRect = firstCard ? firstCard.getBoundingClientRect() : null;
    const firstCardMedia = firstCard ? firstCard.querySelector(".photo-card-media") : null;
    const firstCardCaption = firstCard ? firstCard.querySelector(".photo-card-caption") : null;
    const firstCardImg = firstCard ? firstCard.querySelector("img") : null;
    const styles = firstCard ? window.getComputedStyle(firstCard) : null;
    const imgStyles = firstCardImg ? window.getComputedStyle(firstCardImg) : null;
    return {
      gridCols: grid ? window.getComputedStyle(grid).gridTemplateColumns : null,
      gridGap: grid ? window.getComputedStyle(grid).gap : null,
      cardCount: cards.length,
      cardAspect: styles ? styles.aspectRatio : null,
      cardBg: styles ? styles.backgroundColor : null,
      cardW: firstCardRect ? Math.round(firstCardRect.width) : null,
      cardH: firstCardRect ? Math.round(firstCardRect.height) : null,
      hasMedia: !!firstCardMedia,
      hasCaption: !!firstCardCaption,
      captionText: firstCardCaption ? firstCardCaption.textContent.trim() : null,
      imgObjectFit: imgStyles ? imgStyles.objectFit : null,
      imgW: firstCardImg ? firstCardImg.getBoundingClientRect().width : null,
      imgH: firstCardImg ? firstCardImg.getBoundingClientRect().height : null,
      headerPresent: !!header,
      subText: sub ? sub.textContent.trim() : null,
      pillCount: pills.length,
      firstPillText: pills[0] ? pills[0].textContent.trim() : null,
      hasCountBadge: !!document.querySelector(".filter-pill-count"),
      countBadgeText: document.querySelector(".filter-pill-count")?.textContent?.trim(),
    };
  });
  console.log("=== /photos list page ===");
  console.log(JSON.stringify(listInfo, null, 2));

  // Inspect detail page
  await page.goto("http://localhost:8090/photos/photo-2utpn9if", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const detailInfo = await page.evaluate(() => {
    const figure = document.querySelector(".photo-detail-figure");
    const img = document.querySelector(".photo-detail-img");
    const exifPanel = document.querySelector(".photo-exif-panel");
    const exifTitle = document.querySelector(".photo-exif-title");
    const exifIcon = document.querySelector(".photo-exif-title-icon");
    const exifRows = document.querySelectorAll(".photo-exif-row");
    const details = document.querySelector(".photo-exif-details");
    const neighbors = document.querySelectorAll(".photo-neighbor-thumb");
    const navPrev = document.querySelector(".photo-nav-prev");
    const navNext = document.querySelector(".photo-nav-next");
    const figStyles = figure ? window.getComputedStyle(figure) : null;
    const imgStyles = img ? window.getComputedStyle(img) : null;
    return {
      figureBg: figStyles ? figStyles.backgroundColor : null,
      figureRadius: figStyles ? figStyles.borderRadius : null,
      imgBg: imgStyles ? imgStyles.backgroundColor : null,
      imgMaxH: imgStyles ? imgStyles.maxHeight : null,
      imgObjectFit: imgStyles ? imgStyles.objectFit : null,
      imgNaturalW: img ? img.naturalWidth : null,
      imgNaturalH: img ? img.naturalHeight : null,
      imgRenderedW: img ? Math.round(img.getBoundingClientRect().width) : null,
      imgRenderedH: img ? Math.round(img.getBoundingClientRect().height) : null,
      exifPanelPresent: !!exifPanel,
      exifTitleText: exifTitle ? exifTitle.textContent.trim() : null,
      exifIconPresent: !!exifIcon,
      exifRowCount: exifRows.length,
      exifSample: exifRows[0] ? exifRows[0].textContent.trim() : null,
      detailsOpen: details ? details.hasAttribute("open") : null,
      neighborCount: neighbors.length,
      neighborActive: document.querySelectorAll(".photo-neighbor-thumb.active").length,
      navPrevPresent: !!navPrev,
      navNextPresent: !!navNext,
      navPrevDisabled: navPrev ? navPrev.classList.contains("disabled") : null,
      navNextDisabled: navNext ? navNext.classList.contains("disabled") : null,
    };
  });
  console.log("\n=== /photos/{name} detail page ===");
  console.log(JSON.stringify(detailInfo, null, 2));

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
