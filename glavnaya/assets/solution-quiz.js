(() => {
  const dialog = document.getElementById('solutionQuiz');
  const form = document.getElementById('solutionQuizForm');
  if (!dialog || !form) return;

  const steps = [...dialog.querySelectorAll('[data-quiz-step]')];
  const progressSteps = [...dialog.querySelectorAll('[data-quiz-progress-step]')];
  const choices = [...dialog.querySelectorAll('input[name="scenario"]')];
  const branches = [...dialog.querySelectorAll('[data-quiz-branch]')];
  const backButton = dialog.querySelector('#quizBack');
  const nextButton = dialog.querySelector('#quizNext');
  const submitButton = dialog.querySelector('#quizSubmit');
  const progressFill = dialog.querySelector('#quizProgressFill');
  const stepCounter = dialog.querySelector('#quizStepCounter');
  const stepName = dialog.querySelector('#quizStepName');
  const followupHeading = dialog.querySelector('#quizFollowupQuestion');
  const selectedScenarioLabel = dialog.querySelector('#quizSelectedScenario');
  const choiceError = dialog.querySelector('#quizChoiceError');
  const sendStatus = dialog.querySelector('#quizSendStatus');
  let currentStep = 1;

  const stepNames = ['Ситуация', 'Детали', 'Контакты'];
  const followupQuestions = {
    delay: 'Уточним срок передачи квартиры',
    invited: 'Уточним дату приёмки',
    remote: 'Уточним детали дистанционной приёмки',
    defects: 'Уточним, какие недостатки не устраняют',
    expertise: 'Уточним задачу строительной экспертизы',
    court: 'Уточним предмет и этап спора'
  };

  function selectedChoice() {
    return choices.find(choice => choice.checked) || null;
  }

  function updateChoiceStyles() {
    choices.forEach(choice => {
      choice.closest('.quiz-option').classList.toggle('is-selected', choice.checked);
    });
    if (selectedChoice()) choiceError.hidden = true;
  }

  function activateBranch() {
    const choice = selectedChoice();
    if (!choice) return;
    followupHeading.textContent = followupQuestions[choice.value];
    branches.forEach(branch => {
      const active = branch.dataset.quizBranch === choice.value;
      branch.hidden = !active;
      branch.querySelectorAll('input, select, textarea').forEach(control => {
        control.disabled = !active;
      });
    });
  }

  function updateSummary() {
    const choice = selectedChoice();
    selectedScenarioLabel.textContent = choice
      ? choice.closest('.quiz-option').querySelector('.quiz-option-copy').textContent.trim()
      : '';
  }

  function showStep(number) {
    currentStep = number;
    steps.forEach(step => {
      const active = Number(step.dataset.quizStep) === number;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });
    progressSteps.forEach(item => {
      const itemNumber = Number(item.dataset.quizProgressStep);
      const current = itemNumber === number;
      item.classList.toggle('is-current', current);
      item.classList.toggle('is-complete', itemNumber < number);
      if (current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    progressFill.style.width = `${((number - 1) / 2) * 100}%`;
    stepCounter.textContent = `Шаг ${number} из 3`;
    stepName.textContent = stepNames[number - 1];
    dialog.querySelector('.quiz-progress').setAttribute('aria-label', `Шаг ${number} из 3`);
    backButton.hidden = number === 1;
    nextButton.hidden = number === 3;
    submitButton.hidden = number !== 3;
    if (number === 2) activateBranch();
    if (number === 3) updateSummary();
    const heading = steps[number - 1].querySelector('h3');
    if (heading && dialog.open) heading.focus({ preventScroll: true });
    dialog.querySelector('.solution-quiz-panel').scrollTop = 0;
  }

  function resetQuiz() {
    form.reset();
    sendStatus.replaceChildren();
    choiceError.hidden = true;
    updateChoiceStyles();
    branches.forEach(branch => {
      branch.hidden = true;
      branch.querySelectorAll('input, select, textarea').forEach(control => {
        control.disabled = true;
      });
    });
    showStep(1);
  }

  document.querySelectorAll('[data-open-solution-quiz]').forEach(opener => {
    opener.addEventListener('click', event => {
      event.preventDefault();
      resetQuiz();
      dialog.showModal();
      const firstChoice = choices[0];
      if (firstChoice) firstChoice.focus({ preventScroll: true });
    });
  });

  dialog.querySelector('[data-quiz-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', resetQuiz);

  choices.forEach(choice => choice.addEventListener('change', updateChoiceStyles));

  nextButton.addEventListener('click', () => {
    if (currentStep === 1 && !selectedChoice()) {
      choiceError.hidden = false;
      choices[0].focus();
      return;
    }
    showStep(Math.min(3, currentStep + 1));
  });

  backButton.addEventListener('click', () => showStep(Math.max(1, currentStep - 1)));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (currentStep !== 3) {
      if (currentStep === 1 && !selectedChoice()) {
        choiceError.hidden = false;
        choices[0].focus();
        return;
      }
      showStep(Math.min(3, currentStep + 1));
      return;
    }
    if (!form.reportValidity()) return;
    sendStatus.replaceChildren(
      document.createTextNode('Чтобы оставить заявку, позвоните нам: ')
    );
    const phone = document.createElement('a');
    phone.href = 'tel:+74951528580';
    phone.textContent = '+7 (495) 152-85-80';
    sendStatus.append(phone);
  });

  resetQuiz();
})();
