import "../css/moments-page.css";
import { setupLightbox, type LightboxPhoto } from "./lightbox";

(function () {
  // --- Moment photo lightbox ---
  const lbEl = document.getElementById("moment-lightbox");
  if (lbEl) {
    const lbImg = document.getElementById("moment-lb-img") as HTMLImageElement | null;
    if (lbImg) {
      let lbPhotos: LightboxPhoto[] = [];

      const ctrl = setupLightbox({
        container: lbEl,
        imageEl: lbImg,
        counterEl: document.getElementById("moment-lb-counter"),
        closeBtn: document.getElementById("moment-lb-close"),
        prevBtn: document.getElementById("moment-lb-prev"),
        nextBtn: document.getElementById("moment-lb-next"),
        thumbsEl: document.getElementById("moment-lb-thumbs"),
        bottomBar: document.getElementById("moment-lb-bottom") as HTMLElement | null,
        getPhotos: () => lbPhotos,
      });

      document.querySelectorAll("[data-moment-photos]").forEach((grid) => {
        const btns = grid.querySelectorAll<HTMLElement>(".moment-photo-btn");
        btns.forEach((btn, idx) => {
          btn.addEventListener("click", () => {
            lbPhotos = [];
            btns.forEach((b) => {
              lbPhotos.push({ src: b.getAttribute("data-src") || "" });
            });
            ctrl.open(idx);
          });
        });
      });
    }
  }

  // --- Set photo grid count (photos + videos) ---
  document.querySelectorAll("[data-moment-photos]").forEach((grid) => {
    const count = grid.querySelectorAll(".moment-photo-btn, .moment-video").length;
    (grid as HTMLElement).setAttribute("data-count", String(count));
  });

  // --- Video play ---
  document.querySelectorAll<HTMLElement>(".moment-video-play").forEach((btn) => {
    const container = btn.closest(".moment-video");
    const video = container?.querySelector("video") as HTMLVideoElement | null;
    if (!video) return;
    btn.addEventListener("click", () => {
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
    video.addEventListener("play", () => btn.classList.add("playing"));
    video.addEventListener("pause", () => btn.classList.remove("playing"));
  });

  // --- Hashtag highlighting (safe: only modifies text nodes) ---
  document.querySelectorAll("[data-highlight-hashtags]").forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let n: Text | null;
    while ((n = walker.nextNode() as Text | null)) nodes.push(n);
    nodes.forEach((textNode) => {
      const text = textNode.textContent || "";
      if (!/#[\p{L}\d_]+/u.test(text)) return;
      const frag = document.createDocumentFragment();
      const parts = text.split(/(#[\p{L}\d_]+)/u);
      parts.forEach((part) => {
        if (/^#[\p{L}\d_]+$/u.test(part)) {
          const span = document.createElement("span");
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

  // --- Like button with Halo API upvote (optimistic + rollback + debounce) ---
  document.querySelectorAll<HTMLElement>(".moment-actions .like-btn").forEach((btn) => {
    let inflight = false;
    btn.addEventListener("click", () => {
      if (inflight) return;
      if (btn.classList.contains("liked")) return; // no unvote API
      const momentName = btn.getAttribute("data-moment-name");
      if (!momentName) return;
      const svg = btn.querySelector("svg");
      const span = btn.querySelector("span");
      const count = parseInt(span?.textContent || "0") || 0;
      inflight = true;
      btn.classList.add("liked");
      svg?.setAttribute("fill", "currentColor");
      if (span) span.textContent = String(count + 1);
      btn.classList.add("like-pulse");
      setTimeout(() => btn.classList.remove("like-pulse"), 350);
      fetch("/apis/api.halo.run/v1alpha1/trackers/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "moment.halo.run",
          plural: "moments",
          name: momentName,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("upvote failed");
        })
        .catch(() => {
          btn.classList.remove("liked");
          svg?.setAttribute("fill", "none");
          if (span) span.textContent = String(count);
        })
        .finally(() => {
          inflight = false;
        });
    });
  });

  // --- Comment button toggle ---
  document.querySelectorAll<HTMLElement>(".moment-actions .comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const momentName = btn.getAttribute("data-moment-name");
      if (!momentName) return;
      const commentsEl = document.getElementById("moment-comments-" + momentName);
      if (!commentsEl) return;
      const isActive = commentsEl.classList.contains("active");
      if (isActive) {
        commentsEl.classList.remove("active");
      } else {
        commentsEl.classList.add("active");
        commentsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });

  // --- Build month nav from dividers with counts (full moments page only) ---
  const dividers = document.querySelectorAll(".moment-month-divider");
  const navList = document.getElementById("moments-month-links");
  if (navList && dividers.length > 0) {
    dividers.forEach((div) => {
      let count = 0;
      let el: Element | null = div.nextElementSibling;
      while (el && !el.classList.contains("moment-month-divider")) {
        if (el.classList.contains("moment-card")) count++;
        el = el.nextElementSibling;
      }
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + div.id;
      const label = document.createElement("span");
      label.textContent = div.querySelector("span")?.textContent || "";
      a.appendChild(label);
      const badge = document.createElement("span");
      badge.className = "moments-month-count";
      badge.textContent = String(count);
      a.appendChild(badge);
      li.appendChild(a);
      navList.appendChild(li);
    });
  }
})();
