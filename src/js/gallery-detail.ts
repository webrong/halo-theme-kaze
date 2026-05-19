(function() {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg') as HTMLImageElement;
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var thumbsContainer = document.getElementById('lightboxThumbs');
  if (!lightbox || !lightboxImg || !thumbsContainer) return;

  var photos: Array<{src: string; caption: string; thumb: string}> = [];
  var currentIndex = 0;

  document.querySelectorAll('.photo-card').forEach(function(card, index) {
    var el = card as HTMLElement;
    photos.push({
      src: el.getAttribute('data-src') || '',
      caption: el.getAttribute('data-caption') || '',
      thumb: el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).src : ''
    });
    el.addEventListener('click', function() {
      currentIndex = index;
      showPhoto(currentIndex);
      lightbox!.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  photos.forEach(function(p, i) {
    var thumb = document.createElement('img');
    thumb.src = p.thumb || p.src;
    thumb.alt = '';
    thumb.className = 'lightbox-thumb';
    thumb.addEventListener('click', function() { showPhoto(i); });
    thumbsContainer!.appendChild(thumb);
  });

  function showPhoto(i: number) {
    if (photos.length === 0) return;
    currentIndex = i;
    lightboxImg.src = photos[i].src;
    lightboxImg.alt = photos[i].caption;
    if (lightboxCaption) lightboxCaption.textContent = photos[i].caption;
    if (lightboxCounter) lightboxCounter.textContent = (i + 1) + ' / ' + photos.length;
    var thumbs = thumbsContainer!.querySelectorAll('.lightbox-thumb');
    thumbs.forEach(function(t, ti) {
      t.classList.toggle('active', ti === i);
    });
  }

  var closeBtn = document.getElementById('lightboxClose');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  var prevBtn = document.getElementById('lightboxPrev');
  if (prevBtn) prevBtn.addEventListener('click', function() {
    showPhoto((currentIndex - 1 + photos.length) % photos.length);
  });

  var nextBtn = document.getElementById('lightboxNext');
  if (nextBtn) nextBtn.addEventListener('click', function() {
    showPhoto((currentIndex + 1) % photos.length);
  });

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (!lightbox!.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPhoto((currentIndex - 1 + photos.length) % photos.length);
    if (e.key === 'ArrowRight') showPhoto((currentIndex + 1) % photos.length);
  });

  function closeLightbox() {
    lightbox!.classList.remove('active');
    document.body.style.overflow = '';
  }
})();
