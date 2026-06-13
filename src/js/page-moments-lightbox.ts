import { setupLightbox, type LightboxPhoto } from "./lightbox";

(function () {
  const lb = document.getElementById("momentLightbox");
  const lbImg = document.getElementById("momentLbImg") as HTMLImageElement | null;
  if (!lb || !lbImg) return;

  let photos: LightboxPhoto[] = [];

  const ctrl = setupLightbox({
    container: lb,
    imageEl: lbImg,
    closeBtn: document.getElementById("momentLbClose"),
    getPhotos: () => photos,
  });

  document
    .querySelectorAll<HTMLImageElement>('[data-action="moment-photo"]')
    .forEach(function (img) {
      img.addEventListener("click", function () {
        photos = [{ src: img.src, alt: img.alt }];
        ctrl.open(0);
      });
    });
})();
