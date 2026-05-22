(function () {
  var launchEl = document.getElementById("site-launch-date");
  var launch = launchEl ? launchEl.getAttribute("data-launch") || "2022-09-01" : "2022-09-01";

  var searchToggle = document.getElementById("searchToggle");
  var searchBar = document.getElementById("searchBar");
  var searchInput = document.getElementById("searchInput") as HTMLInputElement | null;
  var searchResults = document.getElementById("searchResults");
  if (searchToggle && searchBar) {
    var sb = searchBar;
    var st = searchToggle;
    var _si = searchInput;
    var _sr = searchResults;
    var debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function openSearch() {
      sb.classList.add("active");
      document.body.style.overflow = "hidden";
      if (_si) _si.focus();
    }
    function closeSearch() {
      sb.classList.remove("active");
      document.body.style.overflow = "";
      if (_sr) _sr.innerHTML = "";
      if (_si) _si.value = "";
    }
    st.addEventListener("click", function () {
      if (sb.classList.contains("active")) {
        closeSearch();
      } else {
        openSearch();
      }
    });
    sb.addEventListener("click", function (e) {
      if (e.target === sb) closeSearch();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sb.classList.contains("active")) closeSearch();
    });

    // Live search
    if (_si && _sr) {
      var liveInput = _si;
      var liveResults = _sr;
      function escapeHtml(s: string) {
        var d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
      }
      liveInput.addEventListener("input", function () {
        if (debounceTimer) clearTimeout(debounceTimer);
        var keyword = liveInput.value.trim();
        if (!keyword) {
          liveResults.innerHTML = "";
          return;
        }
        debounceTimer = setTimeout(function () {
          fetch("/apis/api.halo.run/v1alpha1/indices/-/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword: keyword, limit: 8, highlightPreTag: "<B>", highlightPostTag: "</B>" }),
          })
            .then(function (res) { return res.json(); })
            .then(function (data) {
              var hits: Array<{ title: string; permalink: string; description: string; content: string; type: string }> = data.hits || [];
              if (hits.length === 0) {
                liveResults.innerHTML = '<div class="search-result-empty">未找到相关内容</div>';
                return;
              }
              var typeLabel: Record<string, string> = {
                "post.content.halo.run": "文章",
                "singlepage.content.halo.run": "页面",
                "moment.moment.halo.run": "瞬间",
              };
              liveResults.innerHTML = hits.map(function (hit) {
                var label = typeLabel[hit.type] || "";
                var desc = hit.description || hit.content || "";
                // Strip HTML tags for description, keep <B> highlights
                var cleanDesc = desc.replace(/<(?!\/?B\b)[^>]*>/gi, "");
                // Truncate
                if (cleanDesc.length > 120) cleanDesc = cleanDesc.substring(0, 120) + "…";
                return '<a class="search-result-item" href="' + escapeHtml(hit.permalink) + '">' +
                  '<div class="search-result-item-title">' + escapeHtml(hit.title) + '</div>' +
                  '<div class="search-result-item-desc">' + cleanDesc + '</div>' +
                  (label ? '<div class="search-result-item-meta">' + label + '</div>' : '') +
                  '</a>';
              }).join("");
              // Close search on result click
              liveResults.querySelectorAll(".search-result-item").forEach(function (item) {
                item.addEventListener("click", function () { closeSearch(); });
              });
            })
            .catch(function () {
              liveResults.innerHTML = '<div class="search-result-empty">搜索出错，请稍后重试</div>';
            });
        }, 300);
      });
    }
  }

  var path = window.location.pathname;
  document.querySelectorAll(".site-nav nav a").forEach(function (link) {
    var href =
      (link as HTMLAnchorElement).getAttribute("data-href") ||
      (link as HTMLAnchorElement).getAttribute("href") ||
      "";
    if (href === path || (path.startsWith(href) && href !== "/" && (path.length === href.length || path.charAt(href.length) === "/"))) {
      link.classList.add("active");
    }
    if (href === "/" && path === "/") {
      link.classList.add("active");
    }
  });

  // Dark mode toggle
  var toggle = document.getElementById("themeToggle");
  var stored = localStorage.getItem("theme");
  if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    });
  }

  // Runtime counter
  var parts = launch.split("-");
  var launchTime = new Date(+parts[0], (+parts[1] || 1) - 1, +parts[2] || 1).getTime();
  if (isNaN(launchTime)) return;
  function update() {
    var now = Date.now();
    var diff = now - launchTime;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    var daysEl = document.getElementById("runtime-days");
    var hmsEl = document.getElementById("runtime-hms");
    if (daysEl) daysEl.textContent = String(days);
    if (hmsEl)
      hmsEl.textContent =
        String(hours).padStart(2, "0") +
        ":" +
        String(mins).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0");
  }
  update();
  setInterval(update, 1000);

  // Mobile menu toggle
  var menuToggle = document.getElementById("menuToggle");
  var navEl = document.querySelector(".site-nav nav") as HTMLElement | null;
  if (menuToggle && navEl) {
    var mt = menuToggle;
    var nv = navEl;
    mt.addEventListener("click", function () {
      nv.classList.toggle("mobile-open");
      var expanded = nv.classList.contains("mobile-open");
      mt.setAttribute("aria-expanded", String(expanded));
      document.body.style.overflow = expanded ? "hidden" : "";
    });
    nv.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nv.classList.remove("mobile-open");
        mt.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }
})();
