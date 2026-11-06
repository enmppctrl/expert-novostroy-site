(() => {
  const filters = [...document.querySelectorAll('.team-filter')];
  const cards = [...document.querySelectorAll('.person-card')];

  const showCategory = category => {
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.filter === category)));
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
  };

  const cardForHash = hash => {
    try {
      const target = document.getElementById(decodeURIComponent(hash.replace(/^#/, '')));
      return target && target.classList.contains('person-card') ? target : null;
    } catch {
      return null;
    }
  };

  const revealCard = hash => {
    const card = cardForHash(hash);
    if (!card || !card.hidden) return;
    showCategory('all');
    requestAnimationFrame(() => card.scrollIntoView({ block: 'start' }));
  };

  filters.forEach(button => button.addEventListener('click', () => showCategory(button.dataset.filter)));
  window.addEventListener('hashchange', () => revealCard(window.location.hash));
  window.addEventListener('pageshow', () => revealCard(window.location.hash));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash === window.location.hash) {
      revealCard(url.hash);
    }
  });
})();
