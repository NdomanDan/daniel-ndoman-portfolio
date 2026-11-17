document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = [...document.querySelectorAll('[data-reveal]')];

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const tiltSurface = document.querySelector('[data-tilt]');
const canTilt = window.matchMedia('(pointer: fine)').matches && !reducedMotion.matches;

if (tiltSurface && canTilt) {
  let animationFrame = 0;
  let targetX = 0;
  let targetY = 0;

  const renderTilt = () => {
    tiltSurface.style.transform = `perspective(1000px) rotateY(${targetX * 4}deg) rotateX(${targetY * -4}deg)`;
    animationFrame = 0;
  };

  tiltSurface.addEventListener('pointermove', (event) => {
    const bounds = tiltSurface.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    targetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (!animationFrame) animationFrame = requestAnimationFrame(renderTilt);
  });

  tiltSurface.addEventListener('pointerleave', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    tiltSurface.style.transform = '';
  });
}

const viewer = document.querySelector('#image-viewer');
const viewerLinks = [...document.querySelectorAll('[data-lightbox]')];

if (viewer && viewerLinks.length) {
  const viewerImage = viewer.querySelector('#viewer-image');
  const viewerTitle = viewer.querySelector('#viewer-title');
  const viewerCaption = viewer.querySelector('#viewer-caption');
  const viewerCount = viewer.querySelector('#viewer-count');
  const viewerMedia = viewer.querySelector('.viewer-media');
  const closeButton = viewer.querySelector('[data-viewer-close]');
  const previousButton = viewer.querySelector('[data-viewer-prev]');
  const nextButton = viewer.querySelector('[data-viewer-next]');
  const zoomButton = viewer.querySelector('[data-viewer-zoom]');
  let currentIndex = 0;

  const resetZoom = () => {
    viewerMedia.classList.remove('is-zoomed');
    zoomButton.setAttribute('aria-pressed', 'false');
    zoomButton.textContent = 'Zoom 100 %';
    viewerMedia.scrollTo({ top: 0, left: 0 });
  };

  const showImage = (index) => {
    currentIndex = (index + viewerLinks.length) % viewerLinks.length;
    const link = viewerLinks[currentIndex];
    const thumbnail = link.querySelector('img');
    const caption = link.closest('figure')?.querySelector('figcaption')?.textContent.trim() || thumbnail.alt;
    viewerImage.src = link.href;
    viewerImage.alt = thumbnail.alt;
    viewerImage.width = Number(thumbnail.getAttribute('width'));
    viewerImage.height = Number(thumbnail.getAttribute('height'));
    viewerTitle.textContent = link.dataset.viewerTitle || caption.replace(/Agrandir$/i, '').trim();
    viewerCaption.textContent = thumbnail.alt;
    viewerCount.textContent = `Capture ${currentIndex + 1} sur ${viewerLinks.length}`;
    resetZoom();
  };

  viewerLinks.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showImage(index);
      viewer.showModal();
      document.body.classList.add('viewer-open');
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', () => viewer.close());
  previousButton.addEventListener('click', () => showImage(currentIndex - 1));
  nextButton.addEventListener('click', () => showImage(currentIndex + 1));
  zoomButton.addEventListener('click', () => {
    const isZoomed = viewerMedia.classList.toggle('is-zoomed');
    zoomButton.setAttribute('aria-pressed', String(isZoomed));
    zoomButton.textContent = isZoomed ? 'Adapter à l’écran' : 'Zoom 100 %';
  });

  viewer.addEventListener('click', (event) => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (event.key === 'ArrowRight') showImage(currentIndex + 1);
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    resetZoom();
  });
}
