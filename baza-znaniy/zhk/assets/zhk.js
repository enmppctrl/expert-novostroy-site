(() => {
  const PAGE_SIZE = 12;
  const collator = new Intl.Collator('ru-RU', { sensitivity: 'base', numeric: true });
  const complexes = Array.isArray(window.ZHK_COMPLEXES)
    ? window.ZHK_COMPLEXES.slice().sort((a, b) => collator.compare(a.name, b.name))
    : [];
  const input = document.getElementById('complex-search');
  const developerFilter = document.getElementById('developer-filter');
  const locationFilter = document.getElementById('district-filter');
  const developerOptions = document.getElementById('developer-options');
  const locationOptions = document.getElementById('location-options');
  const list = document.getElementById('complex-list');
  const status = document.getElementById('search-status');
  const emptyState = document.getElementById('empty-state');
  const pagination = document.getElementById('catalog-pagination');

  if (!input || !developerFilter || !locationFilter || !developerOptions || !locationOptions || !list || !status || !emptyState || !pagination) return;

  const normalize = (value) => String(value || '').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
  const isKnownDeveloper = (value) => {
    const normalized = normalize(value);
    return normalized && !/^(?:не подтвержден(?:о|а)?|не указан(?:о|а)?|нет данных)$/.test(normalized);
  };
  const cleanAddress = (value) => {
    if (!value) return '';
    const withoutParentheticalNotes = String(value).replace(/\s*\(([^()]*)\)/g, (note, content) =>
      /точк|метк|координат|карточк|яндекс карт|еисжс|адрес[^)]*не указан|официальн\w* сайт|проектн\w* адрес|строительн\w* адрес/i.test(content) ? '' : note
    );
    return withoutParentheticalNotes
      .split(';')
      .filter((part, index) => index === 0 || !/^\s*(?:точк\w*|метк\w*|координат\w*|карточк\w*|в\s+(?:еисжс|документац|яндекс карт)|по данным|согласно|адрес[^;]*не указан)/i.test(part))
      .join(';')
      .replace(/\s*;\s*$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };
  const catalogImagePath = (path) => {
    const rootImagePrefix = '/zhk/assets/images/';
    return path && path.startsWith(rootImagePrefix)
      ? `/expert-novostroy-site/zhk/assets/images/${path.slice(rootImagePrefix.length)}`
      : path;
  };
  let currentPage = 1;

  const addOptions = (datalist, values) => {
    values.slice().sort((a, b) => collator.compare(a, b)).forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      datalist.append(option);
    });
  };

  addOptions(developerOptions, [...new Set(complexes.map((item) => item.developer).filter(isKnownDeveloper))]);
  addOptions(locationOptions, [...new Set(complexes.map((item) => item.location).filter(Boolean))]);

  const createCard = (complex) => {
    const card = document.createElement('article');
    card.className = 'complex-card';

    const visual = document.createElement('a');
    visual.className = 'complex-card-visual';
    visual.href = complex.slug ? `/expert-novostroy-site/zhk/${encodeURIComponent(complex.slug)}/${encodeURIComponent(complex.slug)}.html` : '/expert-novostroy-site/baza-znaniy/zhk/zhk.html';
    visual.setAttribute('aria-label', `Открыть страницу ЖК «${complex.name}»`);
    if (complex.image) {
      const image = document.createElement('img');
      image.src = catalogImagePath(complex.image);
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      visual.append(image);
    } else {
      visual.classList.add('complex-card-visual--placeholder');
      const placeholder = document.createElement('span');
      placeholder.className = 'complex-card-placeholder';
      placeholder.setAttribute('aria-hidden', 'true');
      visual.append(placeholder);
    }

    const overlay = document.createElement('div');
    overlay.className = 'complex-card-overlay';
    const location = document.createElement('span');
    location.className = 'complex-card-context';
    location.textContent = complex.location || '';
    const title = document.createElement('h3');
    title.className = 'complex-card-title';
    title.textContent = /[«»"„“]/.test(complex.name) ? `ЖК ${complex.name}` : `ЖК «${complex.name}»`;
    overlay.append(location, title);
    if (isKnownDeveloper(complex.developer)) {
      const developer = document.createElement('span');
      developer.className = 'complex-card-developer';
      developer.textContent = `Застройщик — ${complex.developer}`;
      overlay.append(developer);
    }
    const addressText = cleanAddress(complex.address);
    if (addressText) {
      const address = document.createElement('p');
      address.className = 'complex-card-address';
      address.textContent = `Адрес: ${addressText}`;
      overlay.append(address);
    }
    visual.append(overlay);

    card.append(visual);

    return card;
  };

  const getFilteredComplexes = () => {
    const query = normalize(input.value);
    const developerQuery = normalize(developerFilter.value);
    const locationQuery = normalize(locationFilter.value);

    return complexes.filter((complex) => {
      const searchable = normalize([
        complex.name,
        complex.city,
        complex.location,
        complex.address,
        complex.developer
      ].join(' '));
      const matchesQuery = !query || searchable.includes(query);
      const matchesDeveloper = !developerQuery || normalize(complex.developer).includes(developerQuery);
      const matchesLocation = !locationQuery || normalize(complex.location).includes(locationQuery);
      return matchesQuery && matchesDeveloper && matchesLocation;
    });
  };

  const createPageButton = (label, page, options = {}) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = options.current ? 'pagination-page is-current' : 'pagination-page';
    button.textContent = label;
    button.setAttribute('aria-label', options.ariaLabel || `Страница ${page}`);
    if (options.current) button.setAttribute('aria-current', 'page');
    if (options.disabled) button.disabled = true;
    button.addEventListener('click', () => {
      currentPage = page;
      render();
      document.getElementById('catalog-title').scrollIntoView({ block: 'start' });
    });
    return button;
  };

  const renderPagination = (pageCount) => {
    pagination.replaceChildren();
    pagination.hidden = pageCount <= 1;
    if (pageCount <= 1) return;

    pagination.append(createPageButton('Назад', Math.max(1, currentPage - 1), {
      ariaLabel: 'Предыдущая страница',
      disabled: currentPage === 1
    }));

    let firstPage = Math.max(1, currentPage - 2);
    let lastPage = Math.min(pageCount, firstPage + 4);
    firstPage = Math.max(1, lastPage - 4);

    for (let page = firstPage; page <= lastPage; page += 1) {
      pagination.append(createPageButton(String(page), page, { current: page === currentPage }));
    }

    pagination.append(createPageButton('Дальше', Math.min(pageCount, currentPage + 1), {
      ariaLabel: 'Следующая страница',
      disabled: currentPage === pageCount
    }));
  };

  const render = () => {
    const filtered = getFilteredComplexes();
    const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
    currentPage = Math.min(Math.max(currentPage, 1), Math.max(pageCount, 1));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

    list.replaceChildren(...visible.map(createCard));
    emptyState.hidden = filtered.length > 0;
    status.textContent = `Найдено жилых комплексов: ${filtered.length}.`;
    renderPagination(pageCount);
  };

  const resetAndRender = () => {
    currentPage = 1;
    render();
  };

  input.addEventListener('input', resetAndRender);
  developerFilter.addEventListener('input', resetAndRender);
  locationFilter.addEventListener('input', resetAndRender);

  render();
})();
