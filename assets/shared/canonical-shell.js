(() => {
  const fixed = document.getElementById('headerfixed');
  const canonicalMobileHeader = document.querySelector('body.canonical-header-page .mobile-header');
  const updateFixed = () => {
    if (fixed) {
      const visible = window.scrollY > 160;
      fixed.classList.toggle('show', visible);
      fixed.setAttribute('aria-hidden', String(!visible));
    }
    canonicalMobileHeader?.classList.toggle('is-scrolled', window.scrollY > 0);
  };
  window.addEventListener('scroll', updateFixed, { passive: true });
  updateFixed();

  const navToggles = [...document.querySelectorAll('body.canonical-header-page .nav-toggle')];
  const closeDesktopMenus = except => {
    navToggles.forEach(toggle => {
      const item = toggle.closest('.has-menu');
      if (item !== except) {
        item?.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  };
  navToggles.forEach(toggle => {
    const item = toggle.closest('.has-menu');
    toggle.addEventListener('click', event => {
      event.stopPropagation();
      const open = !item.classList.contains('is-open');
      closeDesktopMenus(item);
      item.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.has-menu')) closeDesktopMenus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDesktopMenus();
  });

  const burger = document.getElementById('mobileBurger');
  const menu = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('mobileMenuBackdrop');
  const setMenu = open => {
    if (!menu) return;
    menu.classList.toggle('open', open);
    backdrop?.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  if (burger && menu) burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  backdrop?.addEventListener('click', () => setMenu(false));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) setMenu(false);
  });

})();
