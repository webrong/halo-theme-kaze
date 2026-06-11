// === Code block wrappers ===
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
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy';
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(code.textContent || "").catch(() => {});
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Copied';
    btn.classList.add("copied");
    setTimeout(() => {
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy';
      btn.classList.remove("copied");
    }, 1500);
  });
  header.appendChild(btn);

  pre.parentNode?.insertBefore(wrapper, pre);
  wrapper.appendChild(header);
  wrapper.appendChild(pre);
});

// === TOC generation ===
const articleContent = document.getElementById("article-content");
const tocList = document.getElementById("post-toc-list");

if (articleContent && tocList) {
  const headings = articleContent.querySelectorAll("h2, h3");

  headings.forEach((heading, index) => {
    const id = `heading-${index}`;
    heading.id = id;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = heading.textContent || "";
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
            const activeLink = tocList.querySelector(`a[data-heading-id="${id}"]`);
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
likeBtn?.addEventListener("click", () => {
  const wasActive = likeBtn.classList.contains("active");
  likeBtn.classList.toggle("active");
  const svg = likeBtn.querySelector("svg");
  if (!wasActive) {
    svg?.setAttribute("fill", "currentColor");
    likeBtn.classList.add("like-pulse");
    setTimeout(() => likeBtn.classList.remove("like-pulse"), 350);
    if (likeCountEl)
      likeCountEl.textContent = String((parseInt(likeCountEl.textContent || "0") || 0) + 1);
    const postName = likeBtn.getAttribute("data-post-name");
    if (postName) {
      fetch("/apis/api.halo.run/v1alpha1/trackers/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: "content.halo.run", plural: "posts", name: postName }),
      }).catch(function () {});
    }
  } else {
    svg?.setAttribute("fill", "none");
    if (likeCountEl)
      likeCountEl.textContent = String(
        Math.max(0, (parseInt(likeCountEl.textContent || "0") || 0) - 1),
      );
  }
});

const shareBtn = document.getElementById("share-btn");
shareBtn?.addEventListener("click", () => {
  navigator.clipboard
    .writeText(window.location.href)
    .then(() => {
      showToast("链接已复制到剪贴板");
    })
    .catch(() => {});
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

// === Estimated reading time ===
const articleEl = document.getElementById("article-content");
const readingTimeEl = document.querySelector(".reading-time-text");
if (articleEl && readingTimeEl) {
  const text = articleEl.textContent || "";
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  readingTimeEl.textContent = `${minutes} 分钟阅读`;
}

// === Article image lightbox ===
(function () {
  const lightbox = document.getElementById("postLightbox")!;
  const lightboxImg = document.getElementById("postLightboxImg") as HTMLImageElement;
  const counter = document.getElementById("postLightboxCounter");
  const closeBtn = document.getElementById("postLightboxClose");
  const prevBtn = document.getElementById("postLightboxPrev");
  const nextBtn = document.getElementById("postLightboxNext");
  const content = document.getElementById("article-content");
  if (!content) return;

  const images = Array.from(content.querySelectorAll("img")) as HTMLImageElement[];
  if (images.length === 0) return;

  let currentIdx = 0;

  function showPhoto(idx: number) {
    currentIdx = idx;
    lightboxImg.src = images[idx].src;
    lightboxImg.alt = images[idx].alt || "";
    if (counter) counter.textContent = `${idx + 1} / ${images.length}`;
  }

  function openLightbox(idx: number) {
    showPhoto(idx);
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  images.forEach((img, idx) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => openLightbox(idx));
  });

  closeBtn?.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    showPhoto((currentIdx - 1 + images.length) % images.length);
  });
  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    showPhoto((currentIdx + 1) % images.length);
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPhoto((currentIdx - 1 + images.length) % images.length);
    if (e.key === "ArrowRight") showPhoto((currentIdx + 1) % images.length);
  });
})();
