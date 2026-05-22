(function () {
  document.querySelectorAll("[data-highlight-hashtags]").forEach(function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes: Text[] = [];
    var n: Text | null;
    while ((n = walker.nextNode() as Text | null)) nodes.push(n);
    nodes.forEach(function (textNode) {
      var text = textNode.textContent || "";
      if (!/#[\p{L}\d_]+/u.test(text)) return;
      var frag = document.createDocumentFragment();
      var parts = text.split(/(#[\p{L}\d_]+)/u);
      parts.forEach(function (part) {
        if (/^#[\p{L}\d_]+$/u.test(part)) {
          var span = document.createElement("span");
          span.className = "hashtag";
          span.textContent = part;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      textNode.parentNode?.replaceChild(frag, textNode);
    });
  });

  // Lightbox with prev/next/thumbnails
  var lbEl = document.getElementById("moment-lightbox");
  if (lbEl) {
    var lbImg = document.getElementById("moment-lb-img") as HTMLImageElement;
    var lbCounter = document.getElementById("moment-lb-counter");
    var lbThumbsEl = document.getElementById("moment-lb-thumbs")!;
    var lbBottom = document.getElementById("moment-lb-bottom")!;
    var lbPhotos: string[] = [];
    var lbIndex = 0;

    function lbRenderThumbs() {
      lbThumbsEl.innerHTML = "";
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
        (function (idx) {
          img.addEventListener("click", function () {
            lbShow(idx);
          });
        })(i);
        lbThumbsEl.appendChild(img);
      });
    }

    function lbShow(i: number) {
      if (lbPhotos.length === 0) return;
      lbIndex = i;
      if (lbImg) lbImg.src = lbPhotos[i];
      if (lbCounter) lbCounter.textContent = i + 1 + " / " + lbPhotos.length;
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
          lbEl!.classList.add("active");
          document.body.style.overflow = "hidden";
        });
      });
    });

    function closeLb() {
      lbEl!.classList.remove("active");
      document.body.style.overflow = "";
    }

    var closeBtn = document.getElementById("moment-lb-close");
    if (closeBtn) closeBtn.addEventListener("click", closeLb);

    var lbPrevBtn = document.getElementById("moment-lb-prev");
    if (lbPrevBtn)
      lbPrevBtn.addEventListener("click", function () {
        lbShow((lbIndex - 1 + lbPhotos.length) % lbPhotos.length);
      });

    var lbNextBtn = document.getElementById("moment-lb-next");
    if (lbNextBtn)
      lbNextBtn.addEventListener("click", function () {
        lbShow((lbIndex + 1) % lbPhotos.length);
      });

    lbEl.addEventListener("click", function (e) {
      if (e.target === lbEl) closeLb();
    });

    document.addEventListener("keydown", function (e) {
      if (!lbEl!.classList.contains("active")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") lbShow((lbIndex - 1 + lbPhotos.length) % lbPhotos.length);
      if (e.key === "ArrowRight") lbShow((lbIndex + 1) % lbPhotos.length);
    });
  }

  // Like with API
  document.querySelectorAll(".moment-actions .like-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var momentName = btn.getAttribute("data-moment-name");
      var svg = btn.querySelector("svg");
      var span = btn.querySelector("span");
      var count = parseInt(span?.textContent || "0") || 0;
      if (btn.classList.contains("liked")) {
        btn.classList.remove("liked");
        svg?.setAttribute("fill", "none");
        if (span) span.textContent = String(count - 1);
      } else {
        btn.classList.add("liked");
        svg?.setAttribute("fill", "currentColor");
        if (span) span.textContent = String(count + 1);
        btn.classList.add("like-pulse");
        setTimeout(function () {
          btn.classList.remove("like-pulse");
        }, 350);
        if (momentName) {
          fetch("/apis/api.halo.run/v1alpha1/trackers/upvote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group: "moment.halo.run", plural: "moments", name: momentName }),
          }).catch(function () {});
        }
      }
    });
  });

  // Video play
  document.querySelectorAll(".moment-video-play").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var container = btn.closest(".moment-video");
      var video = container?.querySelector("video") as HTMLVideoElement | null;
      if (!video) return;
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
    var container = btn.closest(".moment-video");
    var video = container?.querySelector("video");
    if (video) {
      video.addEventListener("play", function () {
        btn.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        btn.classList.remove("playing");
      });
    }
  });

  // Set photo grid count (photos + videos)
  document.querySelectorAll("[data-moment-photos]").forEach(function (grid) {
    var count = grid.querySelectorAll(".moment-photo-btn, .moment-video").length;
    (grid as HTMLElement).setAttribute("data-count", String(count));
  });

  // Comment toggle
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
})();
