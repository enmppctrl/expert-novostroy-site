(() => {
  const input = document.getElementById('developer-directory-search');
  const status = document.getElementById('developer-directory-status');
  const emptyState = document.getElementById('developer-directory-empty');
  const letterGroups = Array.from(document.querySelectorAll('[data-letter-section]'));
  const companies = Array.from(document.querySelectorAll('[data-developer]'));
  const totalComplexes = document.querySelectorAll('[data-complex]').length;
  const totalCompanies = companies.length;

  if (!input || !status || !emptyState || !letterGroups.length) return;

  const openDeveloperAnchor = () => {
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

  if (window.location.hash) window.requestAnimationFrame(openDeveloperAnchor);
  window.addEventListener('hashchange', () => window.requestAnimationFrame(openDeveloperAnchor));

  const normalize = value => value.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
  const plural = (count, forms) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
    return forms[2];
  };
  const formatNumber = count => new Intl.NumberFormat('ru-RU').format(count);

  status.textContent = `Всего ${formatNumber(totalComplexes)} ЖК · ${formatNumber(totalCompanies)} застройщиков`;

  const filterDirectory = () => {
    const query = normalize(input.value);
    let visibleCompanies = 0;
    let visibleComplexes = 0;

    companies.forEach(company => {
      const companyName = normalize(company.querySelector('.developer-directory-name')?.textContent || '');
      const companyMatches = query !== '' && companyName.includes(query);
      const projects = Array.from(company.querySelectorAll('[data-complex]'));
      let matchingProjects = 0;

      projects.forEach(project => {
        const projectMatches = query !== '' && normalize(project.textContent).includes(query);
        const matches = query === '' || companyMatches || projectMatches;
        project.classList.toggle('is-hidden', !matches);
        if (matches) matchingProjects += 1;
      });

      const matches = query === '' || companyMatches || matchingProjects > 0;
      company.classList.toggle('is-hidden', !matches);

      if (matches) {
        visibleCompanies += 1;
        visibleComplexes += query === '' || companyMatches ? projects.length : matchingProjects;
      }

      if (query && companyMatches && company.dataset.searchOpened === 'true') {
        company.open = false;
        delete company.dataset.searchOpened;
      } else if (query && !companyMatches && matchingProjects > 0) {
        company.open = true;
        company.dataset.searchOpened = 'true';
      } else if (!query && company.dataset.searchOpened === 'true') {
        company.open = false;
        delete company.dataset.searchOpened;
      }
    });

    letterGroups.forEach(group => {
      const hasVisibleCompanies = Array.from(group.querySelectorAll('[data-developer]'))
        .some(company => !company.classList.contains('is-hidden'));
      group.classList.toggle('is-hidden', !hasVisibleCompanies);

      if (query && hasVisibleCompanies) {
        group.open = true;
        group.dataset.searchOpened = 'true';
      } else if (!query && group.dataset.searchOpened === 'true') {
        group.open = false;
        delete group.dataset.searchOpened;
      }
    });

    emptyState.hidden = visibleCompanies !== 0;
    if (query) {
      const companyWord = plural(visibleCompanies, ['застройщик', 'застройщика', 'застройщиков']);
      status.textContent = `Найдено ${formatNumber(visibleComplexes)} ЖК · ${formatNumber(visibleCompanies)} ${companyWord}`;
    } else {
      status.textContent = `Всего ${formatNumber(totalComplexes)} ЖК · ${formatNumber(totalCompanies)} застройщиков`;
    }
  };

  input.addEventListener('input', filterDirectory);
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
