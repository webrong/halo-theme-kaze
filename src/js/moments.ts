(function () {
  // Moment photo lightbox
  const lbEl = document.getElementById("moment-lightbox");
  if (!lbEl) return;
  var lbImg = document.getElementById("moment-lb-img") as HTMLImageElement;
  var lbCounter = document.getElementById("moment-lb-counter");
  var lbThumbsEl = document.getElementById("moment-lb-thumbs");
  var lbBottom = document.getElementById("moment-lb-bottom") as HTMLElement;
  var lbPhotos: string[] = [];
  var lbIndex = 0;

  function lbRenderThumbs() {
    lbThumbsEl!.innerHTML = "";
    if (lbPhotos.length <= 1) {
      lbBottom.style.display = "none";
      return;
    }
    lbBottom.style.display = "block";
    lbPhotos.forEach(function (src, i) {
      var img = document.createElement("img");
      img.className = "lightbox-thumb" + (i === lbIndex ? " active" : "");
      img.src = src;
      img.alt = "";
      (function (idx: number) {
        img.addEventListener("click", function () {
          lbShow(idx);
        });
      })(i);
      lbThumbsEl!.appendChild(img);
    });
  }

  function lbShow(i: number) {
    if (lbPhotos.length === 0) return;
    lbIndex = i;
    lbImg.src = lbPhotos[i];
    lbCounter!.textContent = i + 1 + " / " + lbPhotos.length;
    lbRenderThumbs();
  }

  document.querySelectorAll("[data-moment-photos]").forEach(function (grid) {
    var btns = grid.querySelectorAll(".moment-photo-btn");
    btns.forEach(function (btn, idx) {
      btn.addEventListener("click", function () {
        lbPhotos = [];
        btns.forEach(function (b) {
          lbPhotos.push(b.getAttribute("data-src") || "");
        });
        lbShow(idx);
        lbEl.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });
  });

  document.getElementById("moment-lb-close")!.addEventListener("click", function () {
    lbEl.classList.remove("active");
    document.body.style.overflow = "";
  });
  document.getElementById("moment-lb-prev")!.addEventListener("click", function () {
    lbShow((lbIndex - 1 + lbPhotos.length) % lbPhotos.length);
  });
  document.getElementById("moment-lb-next")!.addEventListener("click", function () {
    lbShow((lbIndex + 1) % lbPhotos.length);
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
    if (e.key === "ArrowLeft") lbShow((lbIndex - 1 + lbPhotos.length) % lbPhotos.length);
    if (e.key === "ArrowRight") lbShow((lbIndex + 1) % lbPhotos.length);
  });

  // Set photo grid count (photos + videos)
  document.querySelectorAll("[data-moment-photos]").forEach(function (grid) {
    var count = grid.querySelectorAll(".moment-photo-btn, .moment-video").length;
    (grid as HTMLElement).setAttribute("data-count", String(count));
  });

  // Video play
  document.querySelectorAll(".moment-video-play").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var container = btn.closest(".moment-video") as HTMLElement;
      var video = container.querySelector("video") as HTMLVideoElement;
      if (video.src === "" || video.src === window.location.href) {
        video.src = video.getAttribute("data-src") || "";
      }
      if (video.paused) {
        video.play();
        btn.classList.add("playing");
        video.setAttribute("controls", "");
      } else {
        video.pause();
        btn.classList.remove("playing");
      }
    });
    var container = btn.closest(".moment-video") as HTMLElement;
    var video = container.querySelector("video") as HTMLVideoElement;
    video.addEventListener("play", function () {
      btn.classList.add("playing");
    });
    video.addEventListener("pause", function () {
      btn.classList.remove("playing");
    });
  });

  // Hashtag highlighting
  document.querySelectorAll("[data-highlight-hashtags]").forEach(function (el) {
    el.innerHTML = el.innerHTML.replace(/(#[\p{L}\d_]+)/gu, '<span class="hashtag">$1</span>');
  });

  // Like button with Halo API upvote
  document.querySelectorAll(".moment-actions .like-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var momentName = btn.getAttribute("data-moment-name");
      var svg = btn.querySelector("svg")!;
      var span = btn.querySelector("span")!;
      var count = parseInt(span.textContent || "0") || 0;
      if (btn.classList.contains("liked")) {
        btn.classList.remove("liked");
        svg.setAttribute("fill", "none");
        span.textContent = String(count - 1);
      } else {
        btn.classList.add("liked");
        svg.setAttribute("fill", "currentColor");
        span.textContent = String(count + 1);
        btn.classList.add("like-pulse");
        setTimeout(function () {
          btn.classList.remove("like-pulse");
        }, 350);
        if (momentName) {
          fetch("/apis/api.halo.run/v1alpha1/trackers/upvote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group: "moment.halo.run", plural: "moments", name: momentName }),
          });
        }
      }
    });
  });

  // Comment button toggle
  document.querySelectorAll(".moment-actions .comment-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var momentName = btn.getAttribute("data-moment-name");
      if (!momentName) return;
      var commentsEl = document.getElementById("moment-comments-" + momentName);
      if (!commentsEl) return;
      var isActive = commentsEl.classList.contains("active");
      if (isActive) {
        commentsEl.classList.remove("active");
      } else {
        commentsEl.classList.add("active");
        commentsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });

  // Build month nav from dividers with counts
  var dividers = document.querySelectorAll(".moment-month-divider");
  var navList = document.getElementById("moments-month-links");
  if (navList && dividers.length > 0) {
    var navRef = navList;
    dividers.forEach(function (div) {
      var count = 0;
      var el = div.nextElementSibling;
      while (el && !el.classList.contains("moment-month-divider")) {
        if (el.classList.contains("moment-card")) count++;
        el = el.nextElementSibling;
      }
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + div.id;
      var label = document.createElement("span");
      label.textContent = div.querySelector("span")!.textContent || "";
      a.appendChild(label);
      var badge = document.createElement("span");
      badge.className = "moments-month-count";
      badge.textContent = String(count);
      a.appendChild(badge);
      li.appendChild(a);
      navRef.appendChild(li);
    });
  }
})();
