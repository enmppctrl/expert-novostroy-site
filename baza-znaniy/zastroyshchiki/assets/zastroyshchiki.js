(() => {
  const input = document.getElementById('developer-directory-search');
  const citySelect = document.getElementById('developer-city-select');
  const resetButton = document.getElementById('developer-directory-reset');
  const status = document.getElementById('developer-directory-status');
  const emptyState = document.getElementById('developer-directory-empty');
  const allList = document.getElementById('developer-directory-all');
  const companies = Array.from(document.querySelectorAll('#developer-directory-list [data-developer]'));
  const totalComplexes = document.querySelectorAll('#developer-directory-list [data-complex]').length;
  const totalCompanies = companies.length;
  let selectedDeveloper = '';
  if (!input || !citySelect || !resetButton || !status || !emptyState || !allList || !companies.length) return;
  const normalize = value => String(value || '').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
  const plural = (count, forms) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
    return forms[2];
  };
  const formatNumber = count => new Intl.NumberFormat('ru-RU').format(count);
  const directory = companies.map(element => {
    const name = normalize(element.querySelector('.developer-directory-name')?.textContent || '');
    return {
      element,
      id: element.id,
      name,
      projects: Array.from(element.querySelectorAll('[data-complex]')).map(project => ({
        element: project,
        city: project.dataset.city || '',
        searchable: normalize((project.textContent || '') + ' ' + name + ' ' + (project.dataset.cityLabel || ''))
      }))
    };
  });
  let inputTimer = 0;
  const matchesQuery = (text, query) => {
    if (Array.from(query).length > 3) return text.includes(query);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^a-zа-я0-9])' + escaped + '($|[^a-zа-я0-9])', 'i').test(text);
  };
  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) input.value = params.get('q');
  if (params.get('city') && Array.from(citySelect.options).some(option => option.value === params.get('city'))) citySelect.value = params.get('city');
  const openHashTarget = () => {
    if (!window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;
    let node = target;
    while (node && node !== document.body) {
      if (node.matches?.('details')) node.open = true;
      node = node.parentElement;
    }
    target.scrollIntoView({ block: 'start' });
  };
  const filterDirectory = () => {
    const query = normalize(input.value);
    const city = citySelect.value;
    const active = Boolean(query || city);
    let visibleCompanies = 0;
    let visibleComplexes = 0;
    directory.forEach(entry => {
      const company = entry.element;
      const companyMatches = selectedDeveloper ? entry.id === selectedDeveloper : Boolean(query && entry.name.includes(query));
      const projects = entry.projects;
      let matched = 0;
      projects.forEach(projectEntry => {
        const project = projectEntry.element;
        const cityMatches = !city || projectEntry.city === city;
        const textMatches = selectedDeveloper ? entry.id === selectedDeveloper : !query || companyMatches || matchesQuery(projectEntry.searchable, query);
        const visible = cityMatches && textMatches;
        project.classList.toggle('is-hidden', !visible);
        if (visible) matched++;
      });
      const visible = matched > 0;
      company.classList.toggle('is-hidden', !visible);
      if (visible) {
        visibleCompanies++;
        visibleComplexes += matched;
      }
      const count = company.querySelector('.developer-directory-count');
      if (count) {
        const total = Number(company.dataset.totalComplexes || projects.length || 1);
        count.textContent = active && matched < total ? formatNumber(matched) + ' из ' + formatNumber(total) + ' ЖК' : formatNumber(total) + ' ЖК';
      }
    });
    if (query && !selectedDeveloper && visibleComplexes <= 20) {
      companies.forEach(company => {
        if (!company.classList.contains('is-hidden') && company.matches('details')) company.open = true;
      });
    }
    if (active) allList.open = true;
    emptyState.hidden = visibleComplexes > 0;
    if (query && city) status.textContent = visibleComplexes ? 'Найдено ' + formatNumber(visibleComplexes) + ' ЖК · ' + formatNumber(visibleCompanies) + ' ' + plural(visibleCompanies, ['застройщик','застройщика','застройщиков']) : 'В этом городе ничего не найдено по этому запросу';
    else if (query) status.textContent = visibleComplexes ? 'Найдено ' + formatNumber(visibleComplexes) + ' ЖК · ' + formatNumber(visibleCompanies) + ' ' + plural(visibleCompanies, ['застройщик','застройщика','застройщиков']) : 'По этому запросу ничего не найдено';
    else if (city) status.textContent = visibleComplexes ? 'В городе ' + citySelect.selectedOptions[0].textContent.split(' · ')[0] + ' — ' + formatNumber(visibleComplexes) + ' ЖК · ' + formatNumber(visibleCompanies) + ' ' + plural(visibleCompanies, ['застройщик','застройщика','застройщиков']) : 'В этом городе ЖК не найдены';
    else status.textContent = formatNumber(totalComplexes) + ' ЖК · ' + formatNumber(totalCompanies) + ' ' + plural(totalCompanies, ['застройщик','застройщика','застройщиков']);
  };
  input.addEventListener('input', () => {
    selectedDeveloper = '';
    companies.forEach(company => {
      if (company.matches('details')) company.open = false;
    });
    window.clearTimeout(inputTimer);
    inputTimer = window.setTimeout(filterDirectory, 120);
  });
  citySelect.addEventListener('change', () => {
    window.clearTimeout(inputTimer);
    filterDirectory();
  });
  resetButton.addEventListener('click', () => {
    window.clearTimeout(inputTimer);
    input.value = '';
    citySelect.value = '';
    selectedDeveloper = '';
    companies.forEach(company => {
      if (company.matches('details')) company.open = false;
    });
    history.replaceState(null, '', window.location.pathname);
    filterDirectory();
    input.focus();
  });
  document.querySelectorAll('[data-developer-filter]').forEach(card => card.addEventListener('click', event => {
    window.clearTimeout(inputTimer);
    const id = card.dataset.developerFilter;
    const company = document.getElementById(id);
    if (!company) return;
    event.preventDefault();
    companies.forEach(item => {
      if (item !== company && item.matches('details')) item.open = false;
    });
    selectedDeveloper = id;
    input.value = company.querySelector('.developer-directory-name')?.textContent.trim() || '';
    citySelect.value = '';
    filterDirectory();
    allList.open = true;
    if (company.matches('details')) company.open = true;
    history.replaceState(null, '', window.location.pathname + '#' + id);
    company.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }));
  filterDirectory();
  if (window.location.hash) window.requestAnimationFrame(openHashTarget);
  window.addEventListener('hashchange', () => window.requestAnimationFrame(openHashTarget));
})();

document.getElementById('lead-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const lines = [
    'Имя: ' + data.get('name'),
    'Телефон: ' + data.get('phone'),
    'Жилой комплекс: ' + (data.get('complex') || 'не указан'),
    'Площадь: ' + (data.get('area') || 'не указана'),
    'Ситуация: ' + (data.get('comment') || 'не указана'),
    'Дополнительно: ' + (data.getAll('scenario').join(', ') || 'не указано')
  ];
  location.href = 'mailto:info@expert-novostroy.ru?subject=' + encodeURIComponent('Консультация по приёмке квартиры') + '&body=' + encodeURIComponent(lines.join(String.fromCharCode(10)));
});
