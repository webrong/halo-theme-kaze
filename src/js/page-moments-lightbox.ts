(function () {
  var lb = document.getElementById("momentLightbox");
  var lbImg = document.getElementById("momentLbImg") as HTMLImageElement | null;
  if (!lb || !lbImg) return;
  document.querySelectorAll('[data-action="moment-photo"]').forEach(function (img) {
    img.addEventListener("click", function (this: HTMLImageElement) {
      lbImg!.src = this.src;
      lb!.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });
  function closeLb() {
    lb!.classList.remove("active");
    document.body.style.overflow = "";
    lbImg!.src = "";
  }
  var closeBtn = document.getElementById("momentLbClose");
  if (closeBtn) closeBtn.addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLb();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb!.classList.contains("active")) closeLb();
  });
})();
