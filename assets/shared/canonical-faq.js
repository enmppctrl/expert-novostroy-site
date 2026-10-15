(() => {
  const itemSelector = '.faq-item, .accordion-item.faq';
  const buttonSelector = 'button.faq-question, button.faq-button, button.accordion-button';
  const panelSelector = '.faq-answer, .faq-panel, .accordion-collapse';
  const items = [...document.querySelectorAll(itemSelector)];
  if (!items.length) return;

  const instances = [];
  const usedIds = new Set([...document.querySelectorAll('[id]')].map(element => element.id));
  let generatedId = 0;

  const uniqueId = prefix => {
    let id;
    do {
      generatedId += 1;
      id = `canonical-faq-${prefix}-${generatedId}`;
    } while (usedIds.has(id));
    usedIds.add(id);
    return id;
  };

  items.forEach(item => {
    const button = item.querySelector(buttonSelector);
    const panel = [...item.children].find(child => child.matches(panelSelector));
    if (!button || !panel) return;

    item.classList.add('canonical-faq-item');
    panel.dataset.canonicalFaqPanel = '';
    panel.classList.remove('collapse', 'collapsing', 'show');

    if (!button.id || document.querySelectorAll(`#${CSS.escape(button.id)}`).length > 1) {
      button.id = uniqueId('question');
    } else {
      usedIds.add(button.id);
    }
    if (!panel.id || document.querySelectorAll(`#${CSS.escape(panel.id)}`).length > 1) {
      panel.id = uniqueId('answer');
    } else {
      usedIds.add(panel.id);
    }

    button.setAttribute('aria-controls', panel.id);
    button.removeAttribute('data-bs-toggle');
    button.removeAttribute('data-bs-target');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', button.id);
    instances.push({ item, button, panel, group: item.closest('.faq-list') || item.parentElement });
  });

  const setState = (instance, open, animate = true) => {
    const { item, button, panel } = instance;
    item.classList.toggle('is-open', open);
    item.classList.toggle('open', open);
    button.classList.toggle('collapsed', !open);
    button.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;

    if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      panel.style.height = open ? 'auto' : '0px';
      return;
    }

    if (open) {
      panel.style.height = '0px';
      requestAnimationFrame(() => {
        panel.style.height = `${panel.scrollHeight}px`;
      });
    } else {
      panel.style.height = `${panel.scrollHeight}px`;
      requestAnimationFrame(() => {
        panel.style.height = '0px';
      });
    }
  };

  const groups = new Map();
  instances.forEach(instance => {
    if (!groups.has(instance.group)) groups.set(instance.group, []);
    groups.get(instance.group).push(instance);
    instance.panel.addEventListener('transitionend', event => {
      if (event.propertyName === 'height' && instance.item.classList.contains('is-open')) {
        instance.panel.style.height = 'auto';
      }
    });
  });

  groups.forEach(group => {
    group.forEach((instance, index) => setState(instance, index === 0, false));
  });

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest(buttonSelector);
    if (!button) return;
    const instance = instances.find(entry => entry.button === button);
    if (!instance) return;

    event.preventDefault();
    const open = !instance.item.classList.contains('is-open');
    queueMicrotask(() => {
      groups.get(instance.group)?.forEach(other => {
        if (other !== instance && other.item.classList.contains('is-open')) setState(other, false);
      });
      setState(instance, open);
    });
  }, true);

  window.addEventListener('resize', () => {
    instances.forEach(instance => {
      if (instance.item.classList.contains('is-open')) instance.panel.style.height = 'auto';
    });
  }, { passive: true });
})();
