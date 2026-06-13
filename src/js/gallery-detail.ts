import "../css/photography-page.css";
import { setupLightbox, type LightboxPhoto } from "./lightbox";

(function () {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg") as HTMLImageElement | null;
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxCounter = document.getElementById("lightboxCounter");
  const thumbsContainer = document.getElementById("lightboxThumbs");
  if (!lightbox || !lightboxImg || !thumbsContainer) return;

  const photos: LightboxPhoto[] = [];

  document.querySelectorAll<HTMLElement>(".photo-card").forEach((card, index) => {
    const img = card.querySelector("img") as HTMLImageElement | null;
    photos.push({
      src: card.getAttribute("data-src") || "",
      caption: card.getAttribute("data-caption") || "",
      thumb: img ? img.src : "",
    });
    card.addEventListener("click", () => lb.open(index));
  });

  const lb = setupLightbox({
    container: lightbox,
    imageEl: lightboxImg,
    captionEl: lightboxCaption,
    counterEl: lightboxCounter,
    closeBtn: document.getElementById("lightboxClose"),
    prevBtn: document.getElementById("lightboxPrev"),
    nextBtn: document.getElementById("lightboxNext"),
    thumbsEl: thumbsContainer,
    getPhotos: () => photos,
  });
})();
