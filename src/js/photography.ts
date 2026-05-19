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
  if (fallbackGrid) {
    var lb = document.getElementById("photo-lightbox");
    if (lb) {
      var lbImg = document.getElementById("photo-lb-img") as HTMLImageElement | null;
      var lbTitle = document.getElementById("photo-lb-title");
      var lbCounter = document.getElementById("photo-lb-counter");
      var lbClose = document.getElementById("photo-lb-close");
      var lbPrev = document.getElementById("photo-lb-prev");
      var lbNext = document.getElementById("photo-lb-next");
      if (!lbImg || !lbTitle || !lbCounter || !lbClose || !lbPrev || !lbNext) return;
      var _lbImg = lbImg;
      var _lbTitle = lbTitle;
      var _lbCounter = lbCounter;
      var _lbClose = lbClose;
      var _lbPrev = lbPrev;
      var _lbNext = lbNext;
      var _fallbackGrid = fallbackGrid;
      var photos: { src: string; caption: string }[] = [];
      var lbIndex = 0;

      function lbShow(i: number) {
        lbIndex = i;
        _lbImg.src = photos[i].src;
        _lbTitle.textContent = photos[i].caption;
        _lbCounter.textContent = i + 1 + " / " + photos.length;
      }

      var lbEl = lb;

      fallbackGrid.querySelectorAll(".photo-card").forEach(function (card, idx) {
        (card as HTMLElement).style.cursor = "pointer";
        card.addEventListener("click", function () {
          photos = [];
          _fallbackGrid.querySelectorAll(".photo-card").forEach(function (c) {
            photos.push({
              src: c.getAttribute("data-src") || "",
              caption: c.getAttribute("data-caption") || "",
            });
          });
          lbShow(idx);
          lbEl.classList.add("active");
          document.body.style.overflow = "hidden";
        });
      });

      _lbClose.addEventListener("click", function () {
        lbEl.classList.remove("active");
        document.body.style.overflow = "";
      });
      _lbPrev.addEventListener("click", function () {
        lbShow((lbIndex - 1 + photos.length) % photos.length);
      });
      _lbNext.addEventListener("click", function () {
        lbShow((lbIndex + 1) % photos.length);
      });
      lbEl.addEventListener("click", function (e) {
        if (e.target === lbEl) {
          lbEl.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
      document.addEventListener("keydown", function (e) {
        if (!lbEl.classList.contains("active")) return;
        if (e.key === "Escape") {
          lbEl.classList.remove("active");
          document.body.style.overflow = "";
        }
        if (e.key === "ArrowLeft") lbShow((lbIndex - 1 + photos.length) % photos.length);
        if (e.key === "ArrowRight") lbShow((lbIndex + 1) % photos.length);
      });
    }
  }
})();
