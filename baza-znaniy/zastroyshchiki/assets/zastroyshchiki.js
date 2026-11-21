(() => {
  const input = document.getElementById('developer-directory-search');
  const status = document.getElementById('developer-directory-status');
  const emptyState = document.getElementById('developer-directory-empty');
  const cityNav = document.querySelector('.developer-city-filter-list');
  const letterGroups = Array.from(document.querySelectorAll('[data-letter-section]'));
  const companies = Array.from(document.querySelectorAll('[data-developer]'));
  const totalComplexes = document.querySelectorAll('[data-complex]').length;
  const totalCompanies = companies.length;

  if (!input || !status || !emptyState || !letterGroups.length) return;

  const normalize = value => String(value || '').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
  const plural = (count, forms) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
    return forms[2];
  };
  const formatNumber = count => new Intl.NumberFormat('ru-RU').format(count);
  const cityLinks = Array.from(cityNav?.querySelectorAll('[data-city-filter]') || []);
  const cityNames = new Map(cityLinks.map(link => [link.dataset.cityFilter, link.textContent.trim()]));
  const searchParams = new URLSearchParams(window.location.search);
  const requestedCity = searchParams.get('city') || '';
  const requestedQuery = searchParams.get('q') || '';
  if (requestedQuery) input.value = requestedQuery;
  const activeCity = cityNames.has(requestedCity) ? requestedCity : '';
  const activeCityName = cityNames.get(activeCity) || '';
  const cityFilter = document.getElementById('developer-city-filter');

  cityLinks.forEach(link => {
    if (link.dataset.cityFilter === activeCity && activeCity) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
      if (cityFilter) cityFilter.open = true;
    }
  });

  const openTarget = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    let node = target;
    while (node && node !== document.body) {
      if (node.matches?.('details')) node.open = true;
      node = node.parentElement;
    }
    target.scrollIntoView({ block: 'start' });
  };

  if (window.location.hash) window.requestAnimationFrame(openTarget);
  window.addEventListener('hashchange', () => window.requestAnimationFrame(openTarget));

  const filterDirectory = () => {
    const query = normalize(input.value);
    const filtering = Boolean(query || activeCity);
    let visibleCompanies = 0;
    let visibleComplexes = 0;

    companies.forEach(company => {
      const companyName = normalize(company.querySelector('.developer-directory-name')?.textContent || '');
      const companyMatches = Boolean(query && companyName.includes(query));
      const projects = Array.from(company.querySelectorAll('[data-complex]'));
      let matchingProjects = 0;

      projects.forEach(project => {
        const cityMatches = !activeCity || project.dataset.city === activeCity;
        const searchable = normalize(`${project.textContent || ''} ${project.dataset.search || ''}`);
        const textMatches = !query || searchable.includes(query);
        const matches = cityMatches && (companyMatches || textMatches);
        project.classList.toggle('is-hidden', !matches);
        if (matches) matchingProjects += 1;
      });

      const matches = matchingProjects > 0;
      company.classList.toggle('is-hidden', !matches);
      if (matches) {
        visibleCompanies += 1;
        visibleComplexes += matchingProjects;
      }

      if (filtering && matches && company.dataset.filterOpened !== 'true') {
        company.open = true;
        company.dataset.filterOpened = 'true';
      } else if (!filtering && company.dataset.filterOpened === 'true') {
        company.open = false;
        delete company.dataset.filterOpened;
      }
    });

    letterGroups.forEach(group => {
      const hasVisibleCompanies = Array.from(group.querySelectorAll('[data-developer]'))
        .some(company => !company.classList.contains('is-hidden'));
      group.classList.toggle('is-hidden', !hasVisibleCompanies);
      if (filtering && hasVisibleCompanies && group.dataset.filterOpened !== 'true') {
        group.open = true;
        group.dataset.filterOpened = 'true';
      } else if (!filtering && group.dataset.filterOpened === 'true') {
        group.open = false;
        delete group.dataset.filterOpened;
      }
    });

    emptyState.hidden = visibleCompanies !== 0;
    if (activeCity && query) {
      status.textContent = visibleComplexes
        ? `В городе ${activeCityName} найдено ${formatNumber(visibleComplexes)} ${plural(visibleComplexes, ['ЖК', 'ЖК', 'ЖК'])} · ${formatNumber(visibleCompanies)} ${plural(visibleCompanies, ['застройщик', 'застройщика', 'застройщиков'])}`
        : `В городе ${activeCityName} ничего не найдено по этому запросу`;
    } else if (activeCity) {
      status.textContent = visibleComplexes
        ? `В городе ${activeCityName} найдено ${formatNumber(visibleComplexes)} ЖК · ${formatNumber(visibleCompanies)} ${plural(visibleCompanies, ['застройщик', 'застройщика', 'застройщиков'])}`
        : `ЖК в городе ${activeCityName}`;
    } else if (query) {
      status.textContent = visibleComplexes
        ? `Найдено ${formatNumber(visibleComplexes)} ЖК · ${formatNumber(visibleCompanies)} ${plural(visibleCompanies, ['застройщик', 'застройщика', 'застройщиков'])}`
        : 'По этому запросу ничего не найдено';
    } else {
      status.textContent = `Всего ${formatNumber(totalComplexes)} ЖК · ${formatNumber(totalCompanies)} ${plural(totalCompanies, ['застройщик', 'застройщика', 'застройщиков'])}`;
    }
  };

  input.addEventListener('input', filterDirectory);
  filterDirectory();
})();

document.getElementById('lead-form')?.addEventListener('submit', event => {
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
  location.href = `mailto:info@expert-novostroy.ru?subject=${encodeURIComponent('Консультация по приёмке квартиры')}&body=${encodeURIComponent(lines.join('\n'))}`;
});
