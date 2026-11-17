(() => {
  const photos = [...document.querySelectorAll('.archive-result-photo[data-gallery]')];
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeButton = document.getElementById('lightboxClose');
  const previousButton = document.getElementById('lightboxPrev');
  const nextButton = document.getElementById('lightboxNext');
  const lightboxMedia = lightbox?.querySelector('.lightbox-media');

  if (!photos.length || !lightbox || !lightboxImage || !lightboxCaption || !closeButton || !previousButton || !nextButton) return;

  let currentIndex = 0;
  let lastFocused = null;
  let previousBodyOverflow = '';
  let touchStart = null;

  const setPhoto = (index) => {
    currentIndex = (index + photos.length) % photos.length;
    const button = photos[currentIndex];
    const image = button.querySelector('img');
    lightboxImage.src = button.dataset.gallery;
    lightboxImage.alt = image?.alt || '';
    lightboxCaption.textContent = button.dataset.caption || image?.alt || '';

    const nextImage = new Image();
    nextImage.src = photos[(currentIndex + 1) % photos.length].dataset.gallery;
  };

  const openLightbox = (index) => {
    currentIndex = index;
    lastFocused = photos[index];
    previousBodyOverflow = document.body.style.overflow;
    setPhoto(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton.focus({ preventScroll: true });
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    document.body.style.overflow = previousBodyOverflow;
    lastFocused?.focus({ preventScroll: true });
  };

  photos.forEach((button, index) => button.addEventListener('click', () => openLightbox(index)));
  closeButton.addEventListener('click', closeLightbox);
  previousButton.addEventListener('click', () => setPhoto(currentIndex - 1));
  nextButton.addEventListener('click', () => setPhoto(currentIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') setPhoto(currentIndex - 1);
    if (event.key === 'ArrowRight') setPhoto(currentIndex + 1);
    if (event.key === 'Tab') {
      const controls = [closeButton, previousButton, nextButton];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  lightboxMedia?.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });

  lightboxMedia?.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setPhoto(currentIndex + (deltaX < 0 ? 1 : -1));
    }
    touchStart = null;
  }, { passive: true });
})();
