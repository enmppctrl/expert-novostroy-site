(() => {
  const search = document.getElementById('norm-search');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.standard-card')];
  const count = document.getElementById('result-count');
  const empty = document.getElementById('no-results');
  let category = 'all';
  const normalize = value => value.toLowerCase().replace(/ё/g, 'е').trim();

  function updateCatalog() {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const content = normalize(card.textContent + ' ' + card.dataset.search);
      const matches = (category === 'all' || card.dataset.category === category) && terms.every(term => content.includes(term));
      card.hidden = !matches;
      if (matches) visible++;
    }
    count.textContent = `Найдено документов: ${visible}`;
    empty.hidden = visible !== 0;
  }

  search.addEventListener('input', updateCatalog);
  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    updateCatalog();
  }));
  updateCatalog();

  const form = document.getElementById('lead-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const lines = [
      `Имя: ${data.get('name')}`,
      `Телефон: ${data.get('phone')}`,
      `Жилой комплекс: ${data.get('complex') || 'не указан'}`,
      `Площадь: ${data.get('area') || 'не указана'}`,
      `Ситуация: ${data.get('comment') || 'не указана'}`,
      `Интересы: ${data.getAll('interest').join(', ') || 'не указаны'}`
    ];
    window.location.href = `mailto:info@expert-novostroy.ru?subject=${encodeURIComponent('Консультация по замечаниям к квартире')}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
})();
