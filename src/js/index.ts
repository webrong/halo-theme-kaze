// === Hero Carousel ===
const slides = document.querySelectorAll<HTMLDivElement>('.hero-slide');
const dots = document.querySelectorAll<HTMLSpanElement>('.hero-dot');
const prevBtn = document.querySelector<HTMLButtonElement>('.hero-prev');
const nextBtn = document.querySelector<HTMLButtonElement>('.hero-next');

if (slides.length > 0) {
  let current = 0;
  let timer: ReturnType<typeof setInterval>;

  const heroBadge = document.getElementById('hero-badge');
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroCtaLabel = document.getElementById('hero-cta-label');
  const heroCtaTitle = document.getElementById('hero-cta-title');
  const heroCta = document.getElementById('hero-cta') as HTMLAnchorElement | null;

  function updateContent(index: number) {
    const slide = slides[index];
    if (!slide) return;
    const badge = slide.dataset.badge;
    const title = slide.dataset.title;
    const subtitle = slide.dataset.subtitle;
    const ctaLabel = slide.dataset.ctaLabel;
    const ctaTitle = slide.dataset.ctaTitle;
    const ctaUrl = slide.dataset.ctaUrl;

    if (badge && heroBadge) heroBadge.textContent = badge;
    if (title && heroTitle) heroTitle.textContent = title;
    if (subtitle && heroSubtitle) heroSubtitle.textContent = subtitle;
    if (ctaLabel && heroCtaLabel) heroCtaLabel.textContent = ctaLabel;
    if (ctaTitle && heroCtaTitle) heroCtaTitle.textContent = ctaTitle;
    if (heroCta) heroCta.href = ctaUrl || '#';
  }

  function goTo(index: number) {
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
    updateContent(current);
  }

  slides[0]?.classList.add('active');
  dots[0]?.classList.add('active');
  updateContent(0);

  function startTimer() {
    timer = setInterval(() => goTo(current + 1), 6000);
  }
  startTimer();

  prevBtn?.addEventListener('click', () => {
    clearInterval(timer);
    goTo(current - 1);
    startTimer();
  });

  nextBtn?.addEventListener('click', () => {
    clearInterval(timer);
    goTo(current + 1);
    startTimer();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      startTimer();
    });
  });
}

// === Client-side category filter ===
const filterPills = document.querySelectorAll<HTMLButtonElement>('.filter-pill');
const postCards = document.querySelectorAll<HTMLElement>('.post-card');

if (filterPills.length > 0 && postCards.length > 0) {
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const category = pill.dataset.category || '';

      postCards.forEach((card) => {
        const cardCategory = card.dataset.category || '';
        if (!category || cardCategory === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// === Post card reading time (client-side) ===
document.querySelectorAll<HTMLElement>('.post-card-reading-time').forEach((el) => {
  const card = el.closest('.post-card');
  if (!card) return;
  const text = card.textContent || '';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  const span = el.querySelector('span');
  if (span) span.textContent = `${minutes} 分钟阅读`;
});
