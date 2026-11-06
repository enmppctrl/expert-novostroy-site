(() => {
  const controls = document.getElementById('catalog-controls');
  const search = document.getElementById('defect-search');
  const cards = [...document.querySelectorAll('.defect-card')];
  const buttons = [...document.querySelectorAll('.filter-button')];
  const empty = document.getElementById('empty-results');
  let activeGroup = 'all';
  const normalize = value => value.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();

  const updateCatalog = () => {
    const query = normalize(search.value);
    let visible = 0;
    cards.forEach(card => {
      const matchesGroup = activeGroup === 'all' || card.dataset.group === activeGroup;
      const matchesQuery = normalize(card.textContent).includes(query);
      card.hidden = !(matchesGroup && matchesQuery);
      if (!card.hidden) visible += 1;
    });
    empty.hidden = visible !== 0;
  };

  buttons.forEach(button => button.addEventListener('click', () => {
    activeGroup = button.dataset.filter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    updateCatalog();
  }));
  search.addEventListener('input', updateCatalog);
  controls.hidden = false;

  document.getElementById('lead-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      `Имя: ${data.get('name')}`,
      `Телефон: ${data.get('phone')}`,
      `Жилой комплекс: ${data.get('complex') || 'не указан'}`,
      `Площадь: ${data.get('area') || 'не указана'}`,
      `Ситуация: ${data.get('comment') || 'не указана'}`,
      `Дополнительно: ${data.getAll('scenario').join(', ') || 'не указано'}`
    ];
    location.href = `mailto:info@expert-novostroy.ru?subject=${encodeURIComponent('Консультация по недостаткам квартиры')}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
})();
