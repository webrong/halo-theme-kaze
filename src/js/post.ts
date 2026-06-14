import "../css/photography-page.css";
import { setupLightbox, type LightboxPhoto } from "./lightbox";

// === Code block wrappers ===
function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.setAttribute("readonly", "");
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) resolve();
      else reject(new Error("execCommand copy failed"));
    } catch (e) {
      reject(e);
    }
  });
}

export {};

document.querySelectorAll(".article-content pre").forEach((pre) => {
  const code = pre.querySelector("code");
  if (!code) return;

  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper";

  const header = document.createElement("div");
  header.className = "code-block-header";

  let lang = "";
  if (code.className) {
    const m = code.className.match(/language-(\w+)/);
    if (m) lang = m[1];
  }
  if (!lang) lang = "code";

  const label = document.createElement("span");
  label.textContent = lang;
  header.appendChild(label);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy';
  btn.addEventListener("click", () => {
    copyText(code.textContent || "")
      .then(() => {
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Copied';
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy';
          btn.classList.remove("copied");
        }, 1500);
      })
      .catch(() => {
        btn.innerHTML = "复制失败";
        setTimeout(() => {
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy';
        }, 1500);
      });
  });
  header.appendChild(btn);

  pre.parentNode?.insertBefore(wrapper, pre);
  wrapper.appendChild(header);
  wrapper.appendChild(pre);
});

// === TOC generation (preserve existing heading.id if present) ===
const articleContent = document.getElementById("article-content");
const tocList = document.getElementById("post-toc-list");

if (articleContent && tocList) {
  const headings = articleContent.querySelectorAll("h2, h3");

  headings.forEach((heading, index) => {
    const text = (heading.textContent || "").trim();
    let id = heading.id;
    if (!id) {
      id =
        "heading-" +
        index +
        "-" +
        text
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fff]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 50);
      heading.id = id;
    }

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = text;
    if (heading.tagName === "H3") a.classList.add("toc-h3");
    a.dataset.headingId = id;
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // IntersectionObserver for active tracking
  if (headings.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tocList.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
            const activeLink = tocList.querySelector(`a[data-heading-id="${CSS.escape(id)}"]`);
            activeLink?.classList.add("active");
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
  }
}

// === Reading progress bar ===
const progressBar = document.querySelector<HTMLElement>(".reading-progress-bar");
if (progressBar) {
  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    },
    { passive: true },
  );
}

// === Left action buttons ===
const likeBtn = document.querySelector<HTMLButtonElement>(".like-btn");
const likeCountEl = document.getElementById("like-count");
let likeInFlight = false;
likeBtn?.addEventListener("click", () => {
  if (likeInFlight) return;
  const wasActive = likeBtn.classList.contains("active");
  const svg = likeBtn.querySelector("svg");
  const postName = likeBtn.getAttribute("data-post-name");
  if (wasActive) {
    // Currently no unvote API — ignore second click instead of desyncing UI
    return;
  }
  if (!postName) return;
  likeInFlight = true;
  likeBtn.classList.add("active");
  svg?.setAttribute("fill", "currentColor");
  likeBtn.classList.add("like-pulse");
  setTimeout(() => likeBtn.classList.remove("like-pulse"), 350);
  if (likeCountEl)
    likeCountEl.textContent = String((parseInt(likeCountEl.textContent || "0") || 0) + 1);

  fetch("/apis/api.halo.run/v1alpha1/trackers/upvote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group: "content.halo.run", plural: "posts", name: postName }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("upvote failed");
    })
    .catch(() => {
      // Roll back optimistic update
      likeBtn.classList.remove("active");
      svg?.setAttribute("fill", "none");
      if (likeCountEl)
        likeCountEl.textContent = String(
          Math.max(0, (parseInt(likeCountEl.textContent || "0") || 0) - 1),
        );
      showToast("点赞失败，请稍后再试");
    })
    .finally(() => {
      likeInFlight = false;
    });
});

const shareBtn = document.getElementById("share-btn");
shareBtn?.addEventListener("click", () => {
  copyText(window.location.href)
    .then(() => showToast("链接已复制到剪贴板"))
    .catch(() => showToast("复制失败，请手动复制链接"));
});

function showToast(msg: string) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Reading time is calculated server-side in the template (post.content.raw word count).
// No client-side override needed.

// === Article image lightbox ===
(function () {
  const lightbox = document.getElementById("postLightbox");
  const lightboxImg = document.getElementById("postLightboxImg") as HTMLImageElement | null;
  if (!lightbox || !lightboxImg) return;
  const content = document.getElementById("article-content");
  if (!content) return;

  const images = Array.from(content.querySelectorAll("img")) as HTMLImageElement[];
  if (images.length === 0) return;

  const photos: LightboxPhoto[] = images.map((img) => ({ src: img.src, alt: img.alt }));

  const ctrl = setupLightbox({
    container: lightbox,
    imageEl: lightboxImg,
    counterEl: document.getElementById("postLightboxCounter"),
    closeBtn: document.getElementById("postLightboxClose"),
    prevBtn: document.getElementById("postLightboxPrev"),
    nextBtn: document.getElementById("postLightboxNext"),
    getPhotos: () => photos,
  });

  images.forEach((img, idx) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => ctrl.open(idx));
  });
})();
