(function (global) {
  const app = global?.SubControls;
  if (!global || !app || typeof app.registerPuzzle !== 'function') {
    return;
  }

  const SOLUTION = 'CHART';
  const SUBMIT_LOCK_MS = 700;

  const elements = {
    root: null,
    form: null,
    answer: null,
    submit: null,
    feedback: null,
    success: null,
    keyword: null,
    hintButtons: [],
    hintTexts: new Map(),
  };

  const state = {
    initialized: false,
    attempts: 0,
    solved: false,
    submitLocked: false,
  };

  function cacheElements() {
    if (elements.root) {
      return true;
    }

    const root = document.getElementById('nav-riddle');
    if (!root) {
      return false;
    }

    elements.root = root;
    elements.form = root.querySelector('#nav-form');
    elements.answer = root.querySelector('#nav-answer');
    elements.submit = root.querySelector('#nav-submit');
    elements.feedback = root.querySelector('#nav-feedback');
    elements.success = root.querySelector('#nav-success');
    elements.keyword = elements.success?.querySelector('.keyword') ?? null;
    elements.hintButtons = Array.from(root.querySelectorAll('.nav-hint-toggle'));
    elements.hintTexts = new Map();

    elements.hintButtons.forEach(button => {
      const id = button.dataset.hint;
      if (!id) {
        return;
      }
      const target = root.querySelector(`#${id}`);
      if (target) {
        elements.hintTexts.set(id, target);
      }
    });

    return true;
  }

  function setFeedback(message, type = 'neutral') {
    if (!elements.feedback) {
      return;
    }

    if (!message) {
      elements.feedback.textContent = '';
      elements.feedback.removeAttribute('data-state');
      elements.feedback.style.display = 'none';
      return;
    }

    elements.feedback.textContent = message;
    elements.feedback.dataset.state = type;
    elements.feedback.style.display = 'block';
  }

  function releaseLock() {
    global.setTimeout(() => {
      state.submitLocked = false;
      if (!state.solved && elements.submit) {
        elements.submit.disabled = false;
      }
    }, SUBMIT_LOCK_MS);
  }

  function updateHintAvailability() {
    if (!elements.hintButtons.length) {
      return;
    }

    elements.hintButtons.forEach(button => {
      const id = button.dataset.hint;
      const hint = id ? elements.hintTexts.get(id) : null;
      const isRevealed = hint ? !hint.hasAttribute('hidden') : false;

      if (isRevealed) {
        button.classList.add('revealed');
        button.disabled = true;
        button.setAttribute('aria-expanded', 'true');
        return;
      }

      button.classList.remove('revealed');
      button.setAttribute('aria-expanded', 'false');

      if (state.solved) {
        button.disabled = true;
        return;
      }

      const unlockAttempts = Number(button.dataset.unlockAttempts || 0);
      button.disabled = state.attempts < unlockAttempts;
    });
  }

  function handleHintToggle(event) {
    const button = event.currentTarget;
    const id = button?.dataset.hint;
    if (!id) {
      return;
    }

    const target = elements.hintTexts.get(id);
    if (!target) {
      return;
    }

    target.hidden = false;
    button.classList.add('revealed');
    button.disabled = true;
    button.setAttribute('aria-expanded', 'true');

    updateHintAvailability();
  }

  function handleAnswerInput(event) {
    if (!event?.target) {
      return;
    }

    const sanitized = event.target.value.replace(/[^a-z]/gi, '').toUpperCase();
    event.target.value = sanitized;

    if (!state.solved && elements.feedback?.textContent) {
      setFeedback('', 'neutral');
    }
  }

  function applySuccessState() {
    state.solved = true;
    state.submitLocked = false;

    if (elements.answer) {
      elements.answer.value = SOLUTION;
      elements.answer.setAttribute('readonly', 'readonly');
    }

    if (elements.submit) {
      elements.submit.disabled = true;
    }

    if (elements.keyword) {
      elements.keyword.textContent = SOLUTION;
    }

    if (elements.success) {
      elements.success.classList.add('visible');
      elements.success.setAttribute('aria-hidden', 'false');
    }

    setFeedback('Course confirmed. Keyword transmitted to the bridge.', 'success');

    updateHintAvailability();

    if (typeof app.setKeywordBanner === 'function') {
      app.setKeywordBanner(SOLUTION, 'navigation');
    }

    releaseLock();
  }

  function handleSubmit(event) {
    event?.preventDefault?.();

    if (state.solved || state.submitLocked) {
      return;
    }

    state.submitLocked = true;
    if (elements.submit) {
      elements.submit.disabled = true;
    }

    const guess = elements.answer?.value.trim().toUpperCase() ?? '';

    if (!guess) {
      setFeedback('Enter the keyword before transmitting.', 'warning');
      releaseLock();
      return;
    }

    if (guess.length !== SOLUTION.length) {
      setFeedback(`The keyword uses ${SOLUTION.length} letters.`, 'warning');
      releaseLock();
      return;
    }

    if (guess === SOLUTION) {
      applySuccessState();
      return;
    }

    state.attempts += 1;
    setFeedback('That heading drifts off-course. Study the clues and try again.', 'error');
    elements.answer?.focus();
    elements.answer?.select();

    updateHintAvailability();
    releaseLock();
  }

  function resetNavigationPuzzle() {
    if (!cacheElements()) {
      return;
    }

    state.attempts = 0;
    state.solved = false;
    state.submitLocked = false;

    if (elements.form) {
      elements.form.reset();
    }

    if (elements.answer) {
      elements.answer.value = '';
      elements.answer.removeAttribute('readonly');
    }

    if (elements.submit) {
      elements.submit.disabled = false;
    }

    setFeedback('', 'neutral');

    if (elements.success) {
      elements.success.classList.remove('visible');
      elements.success.setAttribute('aria-hidden', 'true');
    }

    elements.hintTexts.forEach(hint => {
      hint.hidden = true;
    });

    elements.hintButtons.forEach(button => {
      button.classList.remove('revealed');
      button.setAttribute('aria-expanded', 'false');
    });

    updateHintAvailability();

    if (typeof app.clearKeywordBanner === 'function') {
      app.clearKeywordBanner('navigation');
    }
  }

  function initializeNavigationPuzzle() {
    if (!cacheElements()) {
      return;
    }

    if (!state.initialized) {
      elements.form?.addEventListener('submit', handleSubmit);
      elements.answer?.addEventListener('input', handleAnswerInput);
      elements.hintButtons.forEach(button => {
        button.addEventListener('click', handleHintToggle);
      });
      state.initialized = true;
    }

    resetNavigationPuzzle();
  }

  function revealNavigationSolution() {
    if (!cacheElements()) {
      return `Nav Riddle keyword: ${SOLUTION}`;
    }

    if (!state.initialized) {
      elements.form?.addEventListener('submit', handleSubmit);
      elements.answer?.addEventListener('input', handleAnswerInput);
      elements.hintButtons.forEach(button => {
        button.addEventListener('click', handleHintToggle);
      });
      state.initialized = true;
    }

    if (elements.answer) {
      elements.answer.value = SOLUTION;
    }

    elements.hintTexts.forEach(hint => {
      hint.hidden = false;
    });

    elements.hintButtons.forEach(button => {
      button.classList.add('revealed');
      button.disabled = true;
      button.setAttribute('aria-expanded', 'true');
    });

    applySuccessState();

    return `Nav Riddle keyword: ${SOLUTION}`;
  }

  app.registerPuzzle('navigation', {
    init: initializeNavigationPuzzle,
    reset: resetNavigationPuzzle,
    reveal: revealNavigationSolution,
    description: 'Navigation Riddle',
  });

  global.initializeNavigationPuzzle = initializeNavigationPuzzle;
  global.resetNavigationPuzzle = resetNavigationPuzzle;
  global.revealNavigationSolution = revealNavigationSolution;
})(window);
