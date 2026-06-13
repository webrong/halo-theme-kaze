import "../css/photography-page.css";
import { setupLightbox, type LightboxPhoto } from "./lightbox";

(function () {
  var PAGE_SIZE = 6;
  var currentPage = 1;
  var activeTag = "";

  var albumGrid = document.getElementById("album-grid");
  var fallbackGrid = document.getElementById("photo-fallback-grid");
  var paginationEl = document.getElementById("photo-pagination");
  var emptyEl = document.getElementById("photo-empty");
  var prevBtn = document.getElementById("photo-page-prev") as HTMLButtonElement | null;
  var nextBtn = document.getElementById("photo-page-next") as HTMLButtonElement | null;
  var numbersEl = document.getElementById("photo-page-numbers");
  var pills = document.querySelectorAll("#photo-filter-pills .filter-pill");

  if (!prevBtn || !nextBtn || !numbersEl) return;
  var _prevBtn = prevBtn;
  var _nextBtn = nextBtn;
  var _numbersEl = numbersEl;

  function getActiveGrid(): Element | null {
    return albumGrid || fallbackGrid;
  }

  function getFilteredCards(): Element[] {
    var grid = getActiveGrid();
    if (!grid) return [];
    var selector = albumGrid ? ".album-card-link" : ".photo-card";
    var all = grid.querySelectorAll(selector);
    if (!activeTag) return Array.from(all);
    return Array.from(all).filter(function (c) {
      return (c.getAttribute("data-tag") || "") === activeTag;
    });
  }

  function render() {
    var grid = getActiveGrid();
    if (!grid) return;
    var selector = albumGrid ? ".album-card-link" : ".photo-card";
    var all = grid.querySelectorAll(selector);
    all.forEach(function (c) {
      (c as HTMLElement).style.display = "none";
    });

    var filtered = getFilteredCards();
    var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * PAGE_SIZE;
    var visible = filtered.slice(start, start + PAGE_SIZE);
    visible.forEach(function (c) {
      (c as HTMLElement).style.display = "";
    });

    if (!paginationEl) return;

    if (filtered.length === 0) {
      paginationEl.style.display = "none";
      if (emptyEl) emptyEl.style.display = "flex";
      return;
    }
    if (emptyEl) emptyEl.style.display = "none";

    if (totalPages <= 1) {
      paginationEl.style.display = "none";
      return;
    }
    paginationEl.style.display = "flex";

    _prevBtn.disabled = currentPage === 1;
    _nextBtn.disabled = currentPage === totalPages;

    _numbersEl.innerHTML = "";
    for (var i = 1; i <= totalPages; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "page-btn" + (i === currentPage ? " active" : "");
      btn.textContent = String(i);
      (function (page: number) {
        btn.addEventListener("click", function () {
          currentPage = page;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      })(i);
      _numbersEl.appendChild(btn);
    }
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) {
        p.classList.remove("active");
      });
      pill.classList.add("active");
      activeTag = pill.getAttribute("data-tag") || "";
      currentPage = 1;
      render();
    });
  });

  _prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  _nextBtn.addEventListener("click", function () {
    var filtered = getFilteredCards();
    var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage < totalPages) {
      currentPage++;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  render();

  // Replace group internal names with display names on album badges
  var groupMapEl = document.getElementById("group-map");
  if (groupMapEl) {
    var nameToDisplay: Record<string, string> = {};
    groupMapEl.querySelectorAll("span").forEach(function (s) {
      var n = s.getAttribute("data-name");
      var d = s.getAttribute("data-display");
      if (n && d) nameToDisplay[n] = d;
    });
    document.querySelectorAll(".album-card-tag[data-group]").forEach(function (tag) {
      var groupName = tag.getAttribute("data-group") || "";
      if (nameToDisplay[groupName]) {
        var span = tag.querySelector("span");
        if (span) span.textContent = nameToDisplay[groupName];
      }
    });
  }

  // --- Fallback lightbox ---
  if (!fallbackGrid) return;
  const grid = fallbackGrid;
  var lb = document.getElementById("photo-lightbox");
  if (!lb) return;
  var lbImg = document.getElementById("photo-lb-img") as HTMLImageElement | null;
  var lbTitle = document.getElementById("photo-lb-title");
  var lbCounter = document.getElementById("photo-lb-counter");
  var lbClose = document.getElementById("photo-lb-close");
  var lbPrev = document.getElementById("photo-lb-prev");
  var lbNext = document.getElementById("photo-lb-next");
  if (!lbImg || !lbTitle || !lbCounter || !lbClose || !lbPrev || !lbNext) return;

  var photos: LightboxPhoto[] = [];

  const lbController = setupLightbox({
    container: lb,
    imageEl: lbImg,
    captionEl: lbTitle,
    counterEl: lbCounter,
    closeBtn: lbClose,
    prevBtn: lbPrev,
    nextBtn: lbNext,
    getPhotos: () => photos,
  });

  grid.querySelectorAll<HTMLElement>(".photo-card").forEach(function (card, idx) {
    card.style.cursor = "pointer";
    card.addEventListener("click", function () {
      photos = [];
      grid.querySelectorAll<HTMLElement>(".photo-card").forEach(function (c) {
        photos.push({
          src: c.getAttribute("data-src") || "",
          caption: c.getAttribute("data-caption") || "",
        });
      });
      lbController.open(idx);
    });
  });
})();
