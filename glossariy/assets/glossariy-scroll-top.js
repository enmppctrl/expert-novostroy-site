(() => {
  const hero = document.querySelector('.glossary-hero-section');
  const button = document.querySelector('.glossary-back-to-index');
  if (!hero || !button) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      button.classList.toggle('is-visible', !entry.isIntersecting);
    });
    observer.observe(hero);
    return;
  }

  const updateVisibility = () => {
    button.classList.toggle('is-visible', window.scrollY > hero.offsetHeight);
  };
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility);
  updateVisibility();
})();
