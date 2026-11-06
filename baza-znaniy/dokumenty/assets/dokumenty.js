(() => {
  const form = document.getElementById('leadForm');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const lines = [
      `Имя: ${fields.get('name')}`,
      `Телефон: ${fields.get('phone')}`,
      `Жилой комплекс: ${fields.get('complex') || 'не указан'}`,
      `Площадь: ${fields.get('area') || 'не указана'}`,
      `Ситуация: ${fields.get('comment') || 'не указана'}`,
      `Интересы: ${fields.getAll('interest').join(', ') || 'не указаны'}`
    ];
    const subject = encodeURIComponent('Консультация: документы и оценка');
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:info@expert-novostroy.ru?subject=${subject}&body=${body}`;
  });
})();
