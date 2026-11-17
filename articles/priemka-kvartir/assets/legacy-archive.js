(() => {
  const grid = document.getElementById('legacyArchiveGrid');
  const search = document.getElementById('legacyArchiveSearch');
  const pagination = document.getElementById('legacyArchivePagination');
  if (!grid || !search || !pagination) return;

  const cards = [...grid.querySelectorAll('.legacy-archive-card')];
  const count = document.getElementById('legacyArchiveCount');
  const shown = document.getElementById('legacyArchiveShown');
  const status = document.getElementById('legacyArchiveStatus');
  const pageSize = 12;
  let page = 1;

  function filteredCards() {
    const terms = search.value.trim().toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
    return cards.filter(card => {
      const haystack = `${card.dataset.search || ''} ${card.textContent}`.toLocaleLowerCase('ru');
      return terms.every(term => haystack.includes(term));
    });
  }

  function makeButton(label, target, disabled = false, current = false, aria = label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'legacy-page-button';
    button.textContent = label;
    button.disabled = disabled;
    button.setAttribute('aria-label', aria);
    if (current) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => {
      page = target;
      render();
    });
    return button;
  }

  function renderPagination(total) {
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    page = Math.min(page, pageCount);
    pagination.replaceChildren();
    pagination.append(makeButton('←', Math.max(1, page - 1), page === 1, false, 'Предыдущая страница'));
    const first = Math.max(1, page - 2);
    const last = Math.min(pageCount, page + 2);
    if (first > 1) {
      pagination.append(makeButton('1', 1, false, page === 1, 'Страница 1'));
      if (first > 2) {
        const gap = document.createElement('span');
        gap.className = 'legacy-page-button';
        gap.textContent = '…';
        gap.setAttribute('aria-hidden', 'true');
        pagination.append(gap);
      }
    }
    for (let value = first; value <= last; value++) {
      pagination.append(makeButton(String(value), value, false, value === page, `Страница ${value}`));
    }
    if (last < pageCount) {
      if (last < pageCount - 1) {
        const gap = document.createElement('span');
        gap.className = 'legacy-page-button';
        gap.textContent = '…';
        gap.setAttribute('aria-hidden', 'true');
        pagination.append(gap);
      }
      pagination.append(makeButton(String(pageCount), pageCount, false, page === pageCount, `Страница ${pageCount}`));
    }
    pagination.append(makeButton('→', Math.min(pageCount, page + 1), page === pageCount, false, 'Следующая страница'));
  }

  function render() {
    const matches = filteredCards();
    const start = (page - 1) * pageSize;
    const visible = new Set(matches.slice(start, start + pageSize));
    cards.forEach(card => { card.hidden = !visible.has(card); });
    count.textContent = String(matches.length);
    shown.textContent = String(visible.size);
    const first = matches.length ? start + 1 : 0;
    const last = Math.min(start + pageSize, matches.length);
    status.textContent = matches.length ? `Показаны результаты ${first}–${last} из ${matches.length}` : 'По запросу ничего не найдено';
    renderPagination(matches.length);
  }

  search.addEventListener('input', () => {
    page = 1;
    render();
  });
  render();
})();
