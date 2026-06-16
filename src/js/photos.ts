import "../css/photography-page.css";

// Auto-redirect naked /photos to paginated URL.
// Backend plugin-photos defaults to size=1000 when no size param, so pagination
// never triggers. Redirect to ?page=1&size=12 before rendering the grid.
(function () {
  const p = new URLSearchParams(window.location.search);
  if (!p.has("size")) {
    p.set("page", "1");
    p.set("size", "12");
    window.location.replace(window.location.pathname + "?" + p.toString());
    return; // stop further execution; page is about to reload
  }
})();

(function () {
  // ----- Group filter pill highlight -----
  const url = new URL(window.location.href);
  const activeGroup = url.searchParams.get("group") || "";
  const pills = document.querySelectorAll<HTMLElement>("#photo-filter-pills .filter-pill");
  pills.forEach((pill) => {
    try {
      const href = pill.getAttribute("href") || "";
      const param = new URL(href, window.location.origin).searchParams.get("group") || "";
      if (param === activeGroup) {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
      }
    } catch {
      // ignore malformed href
    }
  });

  // ----- Lightbox -----
  const lightbox = document.getElementById("photos-lightbox");
  const lbImg = document.getElementById("photos-lb-img") as HTMLImageElement | null;
  const lbTitle = document.getElementById("photos-lb-title");
  const lbCounter = document.getElementById("photos-lb-counter");
  const lbDescription = document.getElementById("photos-lb-description");
  const lbExifGrid = document.getElementById("photos-lb-exif-grid");
  const lbExifPanel = document.getElementById("photos-lb-exif");
  const lbClose = document.getElementById("photos-lb-close");
  const lbPrev = document.getElementById("photos-lb-prev");
  const lbNext = document.getElementById("photos-lb-next");
  const lbZoomIn = document.getElementById("photos-lb-zoom-in");
  const lbZoomOut = document.getElementById("photos-lb-zoom-out");
  const lbReset = document.getElementById("photos-lb-reset");
  const lbZoomLevel = document.getElementById("photos-lb-zoom-level");
  if (!lightbox || !lbImg) return;

  const cards = Array.from(document.querySelectorAll<HTMLElement>(".photo-card"));
  const EXIF_KEYS: Array<[string, string]> = [
    ["make-model", ""],
    ["lens", "镜头"],
    ["focal", "焦距"],
    ["focal35", "等效焦距"],
    ["fnumber", "光圈"],
    ["exposure", "快门"],
    ["iso", "ISO"],
    ["date", "拍摄时间"],
    ["size", "尺寸"],
  ];

  let current = 0;

  // ===== Zoom state =====
  // scale: 1 = fit-to-area; >1 = zoomed in. offsetX/Y: translate in px.
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  const MIN_SCALE = 1;
  const MAX_SCALE = 6;
  const ZOOM_STEP = 1.3;

  function getPhoto(i: number) {
    const card = cards[i];
    if (!card) return null;
    return {
      src: card.getAttribute("data-src") || "",
      caption: card.getAttribute("data-caption") || "",
      description: card.getAttribute("data-description") || "",
      exif: {
        make: card.getAttribute("data-make") || "",
        model: card.getAttribute("data-model") || "",
        lens: card.getAttribute("data-lens") || "",
        focal: card.getAttribute("data-focal") || "",
        focal35: card.getAttribute("data-focal35") || "",
        fnumber: card.getAttribute("data-fnumber") || "",
        exposure: card.getAttribute("data-exposure") || "",
        iso: card.getAttribute("data-iso") || "",
        date: card.getAttribute("data-date") || "",
        size: card.getAttribute("data-size") || "",
      },
    };
  }

  function renderExif(p: NonNullable<ReturnType<typeof getPhoto>>) {
    if (lbDescription) {
      lbDescription.textContent = p.description;
      lbDescription.style.display = p.description ? "" : "none";
    }
    if (!lbExifGrid) return;
    lbExifGrid.innerHTML = "";

    const rows: Array<{ label: string; value: string }> = [];
    const makeModel = [p.exif.make, p.exif.model].filter(Boolean).join(" ");
    if (makeModel) rows.push({ label: "设备", value: makeModel });

    for (const [key, label] of EXIF_KEYS) {
      if (key === "make-model") continue;
      let val = (p.exif as any)[key];
      if (!val) continue;
      if (key === "focal" || key === "focal35") val = `${val} mm`;
      else if (key === "fnumber") val = `f/${val}`;
      rows.push({ label, value: String(val) });
    }

    if (rows.length === 0) {
      if (lbExifPanel) lbExifPanel.style.display = "none";
      return;
    }
    if (lbExifPanel) lbExifPanel.style.display = "";
    for (const row of rows) {
      const div = document.createElement("div");
      div.className = "lightbox-exif-row";
      const dt = document.createElement("span");
      dt.className = "lightbox-exif-label";
      dt.textContent = row.label;
      const dd = document.createElement("span");
      dd.className = "lightbox-exif-value";
      dd.textContent = row.value;
      div.appendChild(dt);
      div.appendChild(dd);
      lbExifGrid.appendChild(div);
    }
  }

  // ===== Zoom helpers =====
  function applyTransform() {
    lbImg!.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    if (lbZoomLevel) {
      lbZoomLevel.textContent = scale === 1 ? "适应" : Math.round(scale * 100) + "%";
    }
    // grab cursor when zoomed in (draggable)
    lbImg!.style.cursor = scale > 1 ? "grab" : "";
  }

  function resetZoom() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    applyTransform();
  }

  function clampOffset() {
    if (scale <= 1) {
      offsetX = 0;
      offsetY = 0;
      return;
    }
    const img = lbImg!;
    const imgRect = img.getBoundingClientRect();
    const area = img.parentElement!;
    const areaRect = area.getBoundingClientRect();
    // displayed size at current scale
    const dispW = (imgRect.width / scale) * scale;
    const dispH = (imgRect.height / scale) * scale;
    // overflow beyond area
    const overX = Math.max(0, (dispW - areaRect.width) / 2);
    const overY = Math.max(0, (dispH - areaRect.height) / 2);
    offsetX = Math.max(-overX, Math.min(overX, offsetX));
    offsetY = Math.max(-overY, Math.min(overY, offsetY));
  }

  // Zoom toward a point (clientX/Y). factor > 1 zoom in, < 1 zoom out.
  function zoomAt(clientX: number, clientY: number, factor: number) {
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    if (newScale === scale) return;
    const img = lbImg!;
    const imgRect = img.getBoundingClientRect();
    // pointer position relative to image center (current transform applied)
    const cx = clientX - (imgRect.left + imgRect.width / 2);
    const cy = clientY - (imgRect.top + imgRect.height / 2);
    // keep the point under cursor stationary: offset shifts proportionally
    const ratio = newScale / scale;
    offsetX = cx - ratio * (cx - offsetX);
    offsetY = cy - ratio * (cy - offsetY);
    scale = newScale;
    if (scale === 1) {
      offsetX = 0;
      offsetY = 0;
    } else {
      clampOffset();
    }
    applyTransform();
  }

  function zoomButton(factor: number) {
    // zoom centered on image center
    const img = lbImg!;
    const imgRect = img.getBoundingClientRect();
    zoomAt(imgRect.left + imgRect.width / 2, imgRect.top + imgRect.height / 2, factor);
  }

  // ===== Drag to pan (when zoomed in) =====
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOffsetX0 = 0;
  let dragOffsetY0 = 0;

  lbImg.addEventListener("mousedown", (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOffsetX0 = offsetX;
    dragOffsetY0 = offsetY;
    lbImg.classList.add("dragging");
    lbImg.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    offsetX = dragOffsetX0 + (e.clientX - dragStartX);
    offsetY = dragOffsetY0 + (e.clientY - dragStartY);
    clampOffset();
    applyTransform();
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    lbImg.classList.remove("dragging");
    lbImg.style.cursor = scale > 1 ? "grab" : "";
  });

  // Wheel zoom
  lbImg.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    zoomAt(e.clientX, e.clientY, factor);
  }, { passive: false });

  // Double-click toggle between fit and 2x (centered on click point)
  lbImg.addEventListener("dblclick", (e) => {
    if (scale > 1) {
      resetZoom();
    } else {
      zoomAt(e.clientX, e.clientY, 2);
    }
  });

  // Zoom buttons
  lbZoomIn?.addEventListener("click", (e) => {
    e.stopPropagation();
    zoomButton(ZOOM_STEP);
  });
  lbZoomOut?.addEventListener("click", (e) => {
    e.stopPropagation();
    zoomButton(1 / ZOOM_STEP);
  });
  lbReset?.addEventListener("click", (e) => {
    e.stopPropagation();
    resetZoom();
  });

  function show(i: number) {
    if (cards.length === 0) return;
    current = (i + cards.length) % cards.length;
    const p = getPhoto(current);
    if (!p) return;
    lbImg!.src = p.src;
    lbImg!.alt = p.caption;
    if (lbTitle) lbTitle.textContent = p.caption;
    if (lbCounter) lbCounter.textContent = `${current + 1} / ${cards.length}`;
    renderExif(p);
    // reset zoom on photo change
    resetZoom();
  }

  function open(i: number) {
    show(i);
    lightbox!.classList.add("active");
    lightbox!.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox!.classList.remove("active");
    lightbox!.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg!.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    resetZoom();
  }

  cards.forEach((card, i) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      open(i);
    });
  });

  lbClose?.addEventListener("click", close);
  lbPrev?.addEventListener("click", (e) => {
    e.stopPropagation();
    show(current - 1);
  });
  lbNext?.addEventListener("click", (e) => {
    e.stopPropagation();
    show(current + 1);
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox!.classList.contains("active")) return;
    const target = e.target as HTMLElement;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "+" || e.key === "=") zoomButton(ZOOM_STEP);
    else if (e.key === "-") zoomButton(1 / ZOOM_STEP);
    else if (e.key === "0") resetZoom();
  });
})();
