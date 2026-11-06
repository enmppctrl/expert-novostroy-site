(() => {
  const modalSelector = '.document-modal';
  let activeModal = null;
  let returnFocusTo = null;
  let previousBodyOverflow = '';

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (activeModal === modal) {
      document.body.style.overflow = previousBodyOverflow;
      activeModal = null;
      if (returnFocusTo && returnFocusTo.isConnected) returnFocusTo.focus();
      returnFocusTo = null;
    }
  };

  const openModal = (modal, trigger) => {
    if (!modal) return;
    if (activeModal && activeModal !== modal) closeModal(activeModal);
    returnFocusTo = trigger;
    previousBodyOverflow = document.body.style.overflow;
    activeModal = modal;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeButton = modal.querySelector('.document-modal-close');
    if (closeButton) closeButton.focus();
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-modal-open]');
    if (trigger) {
      const modal = document.getElementById(trigger.dataset.modalOpen);
      openModal(modal, trigger);
      return;
    }

    const closeButton = event.target.closest('.document-modal-close');
    if (closeButton) {
      closeModal(closeButton.closest(modalSelector));
      return;
    }

    if (event.target.matches(modalSelector)) closeModal(event.target);
  });

  document.addEventListener('keydown', (event) => {
    if (!activeModal) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal(activeModal);
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = [...activeModal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      activeModal.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === activeModal)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
