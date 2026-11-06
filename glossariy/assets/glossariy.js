(() => {
  const search = document.getElementById('glossary-search');
  const reset = document.getElementById('glossary-reset');
  const count = document.querySelector('#glossary-count span');
  const empty = document.getElementById('glossary-empty');
  const groups = Array.from(document.querySelectorAll('.glossary-group'));
  const terms = Array.from(document.querySelectorAll('.glossary-term'));
  const alphabetLinks = document.querySelectorAll('.glossary-alphabet a');
  const topicButtons = Array.from(document.querySelectorAll('.glossary-topic'));
  const topicMatchers = {
    deal: /дду|дкп|договор|уступк|цесс|эскроу|ипотек|брон|рассрочк|первоначальн|семейн|дольщик|долев/,
    documents: /зос|рвэ|рнс|проект|гпзу|госстройнадзор|егрн|кадастр|регистр|росреестр|техническ|гост|снип|свод правил|застройщик|экспертиз проектн|градостроитель|гк рф|грк рф|зк рф|земельный/,
    handover: /акт|передач|ключ|приемк|осмотр|уведомлен|обмер|площадь квартиры|объект долевого|устранен недостат/,
    quality: /дефект|недостат|отделк|гарант|смет|тепловиз|фотофиксац|обследован|гидроизоляц|шумоизоляц|перепланиров|переустройств|отклонение|white box|вайтбокс/,
    home: /жкх|жку|мкд|общее имущество|осс|моп|тсж|управляющ|кр сои|к р сои|крсои|одн|одпу|жилой комплекс|жк рф|жск|придом|коммун|гвс|хвс|итп|машино-мест|лицевой|квитанц/
  };
  let activeTopic = 'all';

  if (!search || !reset || !count || !empty) return;

  const normalize = (value) => value
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

  const applyFilter = () => {
    const queryTokens = normalize(search.value).split(/\s+/).filter(Boolean);
    let visibleCount = 0;

    terms.forEach((term) => {
      const searchableText = normalize(`${term.textContent} ${term.dataset.term || ''}`);
      const topicText = normalize(`${term.querySelector('h3')?.textContent || ''} ${term.dataset.term || ''}`);
      const matchesQuery = !queryTokens.length || queryTokens.every((token) => searchableText.includes(token));
      const matchesTopic = activeTopic === 'all' || topicMatchers[activeTopic]?.test(topicText);
      const isVisible = matchesQuery && matchesTopic;
      term.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    groups.forEach((group) => {
      group.hidden = !group.querySelector('.glossary-term:not([hidden])');
    });

    count.textContent = String(visibleCount);
    empty.hidden = visibleCount > 0;
  };

  const setTopic = (topic) => {
    activeTopic = topic;
    topicButtons.forEach((button) => {
      const isActive = button.dataset.topic === topic;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    applyFilter();
  };

  search.addEventListener('input', applyFilter);
  reset.addEventListener('click', () => {
    search.value = '';
    setTopic('all');
    search.focus();
  });

  topicButtons.forEach((button) => {
    button.addEventListener('click', () => setTopic(button.dataset.topic || 'all'));
  });

  alphabetLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (!search.value && activeTopic === 'all') return;
      search.value = '';
      setTopic('all');
    });
  });

  applyFilter();
})();
