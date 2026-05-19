(function () {
  var launchEl = document.getElementById("site-launch-date");
  var launch = launchEl ? launchEl.getAttribute("data-launch") || "2022-09-01" : "2022-09-01";

  var searchToggle = document.getElementById("searchToggle");
  var searchBar = document.getElementById("searchBar");
  if (searchToggle && searchBar) {
    var sb = searchBar;
    searchToggle.addEventListener("click", function () {
      sb.classList.toggle("active");
    });
  }

  var path = window.location.pathname;
  document.querySelectorAll(".site-nav nav a").forEach(function (link) {
    var href =
      (link as HTMLAnchorElement).getAttribute("data-href") ||
      (link as HTMLAnchorElement).getAttribute("href") ||
      "";
    if (href === path || (path.startsWith(href) && href !== "/")) {
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
  var launchTime = new Date(launch).getTime();
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
