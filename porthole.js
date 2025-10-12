(function (global) {
  const KEYWORD = 'PERISCOPE';

  let hooksRegistered = false;
  const changes = [


    {
      id: 'change1',
      still: 'change1.webp',
      alt: 'Still frame highlighting change scenario one.',
      options: ['thing 1-1', 'thing 1-2', 'thing 1-3', 'thing 1-4'],
      correctIndex: 0,
    },
    {
      id: 'change2',
      still: 'change2.webp',
      alt: 'Still frame highlighting change scenario two.',
      options: ['thing 2-1', 'thing 2-2', 'thing 2-3', 'thing 2-4'],
      correctIndex: 0,
    },
    {
      id: 'change3',
      still: 'change3.webp',
      alt: 'Still frame highlighting change scenario three.',
      options: ['thing 3-1', 'thing 3-2', 'thing 3-3', 'thing 3-4'],
      correctIndex: 0,
    },
    {
      id: 'change4',
      still: 'change4.webp',
      alt: 'Still frame highlighting change scenario four.',
      options: ['thing 4-1', 'thing 4-2', 'thing 4-3', 'thing 4-4'],
      correctIndex: 0,
    },
  ];

  const state = {
    container: null,
    observeButton: null,
    video: null,
    still: null,
    progressMessage: null,
    successBanner: null,
    keywordNode: null,
    checklist: null,
    optionList: null,
    fieldset: null,
    currentChange: null,
    eventsBound: false,
  };

  function ensureElements() {
    const container = document.querySelector('.porthole-puzzle');
    if (!container) {
      return false;
    }

    state.container = container;
    state.observeButton = container.querySelector('#porthole-observe-button');
    state.video = container.querySelector('#porthole-video');
    state.still = container.querySelector('#porthole-still');
    state.progressMessage = container.querySelector('#porthole-progress-message');
    state.successBanner = container.querySelector('#porthole-success');
    state.keywordNode = container.querySelector('#porthole-keyword');
    state.checklist = container.querySelector('#porthole-checklist');
    state.optionList = container.querySelector('#porthole-option-list');
    state.fieldset = state.checklist ? state.checklist.querySelector('fieldset') : null;

    return Boolean(
      state.observeButton &&
        state.video &&
        state.still &&
        state.progressMessage &&
        state.successBanner &&
        state.keywordNode &&
        state.checklist &&
        state.optionList
    );
  }

  function bindEvents() {
    if (state.eventsBound) {
      return;
    }

    if (!state.observeButton || !state.video || !state.checklist) {
      return;
    }

    state.eventsBound = true;
    state.observeButton.addEventListener('click', handleObserveClick);
    state.video.addEventListener('ended', handleVideoEnded);
    state.checklist.addEventListener('change', handleOptionSelection);
  }

  function handleObserveClick() {
    if (!state.video || !state.observeButton) {
      return;
    }

    hideSuccess();
    state.currentChange = null;
    setMessage('Playing baseline feed...');
    setChecklistEnabled(false);
    clearOptions();

    state.video.hidden = false;
    state.video.currentTime = 0;
    state.video.pause();
    state.video.play().catch(() => {
      state.observeButton.disabled = false;
      setMessage('Press Observe again to retry the baseline feed.');
    });

    if (state.still) {
      state.still.hidden = true;
      state.still.removeAttribute('src');
      state.still.setAttribute('alt', 'Still frame awaiting observation');
    }

    state.observeButton.disabled = true;
  }

  function handleVideoEnded() {
    state.observeButton.disabled = false;
    displayRandomChange();
  }

  function displayRandomChange() {
    if (!state.optionList || !state.video || !state.still) {
      return;
    }

    const change = changes[Math.floor(Math.random() * changes.length)];
    state.currentChange = change;

    state.video.pause();
    state.video.hidden = true;
    state.video.currentTime = 0;

    state.still.src = change.still;
    state.still.alt = change.alt;
    state.still.hidden = false;

    populateOptions(change);
    setChecklistEnabled(true);
    if (state.observeButton) {
      state.observeButton.disabled = false;
    }
    setMessage('Select the detail that changed from the list.');
  }

  function populateOptions(change) {
    if (!state.optionList) {
      return;
    }

    state.optionList.innerHTML = '';

    change.options.forEach((label, index) => {
      const optionId = `${change.id}-option-${index}`;
      const listItem = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = optionId;
      checkbox.name = 'porthole-option';
      checkbox.value = String(index);
      checkbox.dataset.correct = index === change.correctIndex ? 'true' : 'false';

      const labelNode = document.createElement('label');
      labelNode.setAttribute('for', optionId);
      labelNode.textContent = label;

      listItem.appendChild(checkbox);
      listItem.appendChild(labelNode);
      state.optionList.appendChild(listItem);
    });
  }

  function handleOptionSelection(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') {
      return;
    }

    if (state.fieldset && state.fieldset.disabled) {
      target.checked = false;
      return;
    }

    if (!state.optionList) {
      return;
    }

    const checkboxes = state.optionList.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(box => {
      if (box !== target) {
        box.checked = false;
      }
    });

    if (target.dataset.correct === 'true') {
      showSuccess();
      setMessage('Change confirmed. Signal ready to transmit.');
    } else {
      hideSuccess();
      setMessage('That detail matches the baseline feed. Try another option.');
    }
  }

  function setChecklistEnabled(enabled) {
    if (state.fieldset) {
      state.fieldset.disabled = !enabled;
    }
  }

  function clearOptions() {
    if (state.optionList) {
      state.optionList.innerHTML = '';
    }
  }

  function setMessage(message) {
    if (state.progressMessage) {
      state.progressMessage.textContent = message;
    }
  }

  function showSuccess() {
    if (state.successBanner) {
      state.successBanner.classList.add('visible');
    }
    if (state.keywordNode) {
      state.keywordNode.textContent = KEYWORD;
    }
    if (global.SubControls && typeof global.SubControls.setKeywordBanner === 'function') {
      global.SubControls.setKeywordBanner(`🔓 UNLOCKED: ${KEYWORD}`, 'spot-diff');
    }
  }

  function hideSuccess() {
    if (state.successBanner) {
      state.successBanner.classList.remove('visible');
    }
    if (state.keywordNode) {
      state.keywordNode.textContent = '';
    }
    if (global.SubControls && typeof global.SubControls.clearKeywordBanner === 'function') {
      global.SubControls.clearKeywordBanner('spot-diff');
    }
  }

  function resetState() {
    hideSuccess();
    state.currentChange = null;
    setMessage('Press Observe to review the live feed.');

    if (state.video) {
      state.video.pause();
      state.video.currentTime = 0;
      state.video.hidden = false;
    }

    if (state.still) {
      state.still.hidden = true;
      state.still.removeAttribute('src');
      state.still.setAttribute('alt', 'Still frame awaiting observation');
    }

    clearOptions();
    setChecklistEnabled(false);

    if (state.observeButton) {
      state.observeButton.disabled = false;
    }
  }

  function preparePuzzle() {
    if (!ensureElements()) {
      return false;
    }

    bindEvents();
    return true;
  }

  function initialisePuzzle() {
    if (!preparePuzzle()) {
      return;
    }

    resetState();
  }

  function resetPuzzle() {
    if (!preparePuzzle()) {
      return;
    }

    resetState();
  }

  function revealPuzzle() {
    if (!preparePuzzle()) {
      return;
    }

    if (!state.currentChange) {
      displayRandomChange();
    }

    const correctOption = state.optionList.querySelector("input[data-correct='true']");
    if (correctOption) {
      correctOption.checked = true;
      showSuccess();
      setMessage('Change confirmed. Signal ready to transmit.');
    }
  }

  global.initializePortholePuzzle = initialisePuzzle;
  global.resetPortholePuzzle = resetPuzzle;
  global.revealPortholeSolution = revealPuzzle;

  function registerSubControlsHooks() {
    if (hooksRegistered) {
      return;
    }

    const sc = global.SubControls;
    if (!sc) {
      return;
    }

    hooksRegistered = true;

    if (typeof sc.unregisterResetHook === 'function' && sc.__portholeResetHook) {
      sc.unregisterResetHook(sc.__portholeResetHook);
    }
    if (typeof sc.registerResetHook === 'function') {
      sc.__portholeResetHook = resetPuzzle;
      sc.registerResetHook(resetPuzzle);
    }

    if (typeof sc.unregisterRevealHook === 'function' && sc.__portholeRevealHook) {
      sc.unregisterRevealHook(sc.__portholeRevealHook);
    }
    if (typeof sc.registerRevealHook === 'function') {
      sc.__portholeRevealHook = revealPuzzle;
      sc.registerRevealHook(revealPuzzle);
    }
  }

  registerSubControlsHooks();

  if (global.document && typeof global.document.addEventListener === 'function') {
    global.document.addEventListener('DOMContentLoaded', registerSubControlsHooks);
  }
})(window);
