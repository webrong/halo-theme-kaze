export interface LightboxPhoto {
  src: string;
  caption?: string;
  thumb?: string;
  alt?: string;
}

export interface LightboxOptions {
  container: HTMLElement;
  imageEl: HTMLImageElement;
  captionEl?: HTMLElement | null;
  counterEl?: HTMLElement | null;
  closeBtn?: HTMLElement | null;
  prevBtn?: HTMLElement | null;
  nextBtn?: HTMLElement | null;
  thumbsEl?: HTMLElement | null;
  bottomBar?: HTMLElement | null;
  getPhotos: () => LightboxPhoto[];
}

export interface LightboxController {
  show(i: number): void;
  open(i: number): void;
  close(): void;
  isOpen(): boolean;
}

export function setupLightbox(opts: LightboxOptions): LightboxController {
  const {
    container,
    imageEl,
    captionEl,
    counterEl,
    closeBtn,
    prevBtn,
    nextBtn,
    thumbsEl,
    bottomBar,
    getPhotos,
  } = opts;

  let current = 0;

  function renderThumbs() {
    if (!thumbsEl || !bottomBar) return;
    const photos = getPhotos();
    thumbsEl.innerHTML = "";
    if (photos.length <= 1) {
      bottomBar.style.display = "none";
      return;
    }
    bottomBar.style.display = "";
    photos.forEach((p, i) => {
      const img = document.createElement("img");
      img.className = "lightbox-thumb" + (i === current ? " active" : "");
      img.src = p.thumb || p.src;
      img.alt = "";
      img.addEventListener("click", () => show(i));
      thumbsEl.appendChild(img);
    });
  }

  function show(i: number) {
    const photos = getPhotos();
    if (photos.length === 0) return;
    current = (i + photos.length) % photos.length;
    const p = photos[current];
    imageEl.src = p.src;
    imageEl.alt = p.alt || p.caption || "";
    if (captionEl) captionEl.textContent = p.caption || "";
    if (counterEl) counterEl.textContent = `${current + 1} / ${photos.length}`;
    renderThumbs();
  }

  function open(i: number) {
    show(i);
    container.classList.add("active");
    container.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    container.classList.remove("active");
    container.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    imageEl.src = "";
  }

  function isOpen() {
    return container.classList.contains("active");
  }

  closeBtn?.addEventListener("click", close);
  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    show(current - 1);
  });
  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    show(current + 1);
  });
  container.addEventListener("click", (e) => {
    if (e.target === container) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
  });

  return { show, open, close, isOpen };
}
