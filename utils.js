(function (global) {
  if (!global) {
    return;
  }

  const puzzles = new Map();
  const resetHooks = new Set();
  const revealHooks = new Set();
  const keywordBanner = document.getElementById('keyword-banner');
  const devTools = document.getElementById('dev-tools');
  const devOutput = document.getElementById('dev-output');
  let keywordBannerEl = null;
  let devToolsEl = null;
  let devOutputEl = null;
  let keywordOwner = null;

  function getDocument() {
    return typeof document === 'undefined' ? null : document;
  }

  function onDocumentReady(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    const doc = getDocument();
    if (!doc) {
      return;
    }

    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function activateTab(targetId) {
    const doc = getDocument();
    if (!doc) {
      return;
    }

    const buttons = Array.from(doc.querySelectorAll('nav .tab'));
    const sections = Array.from(doc.querySelectorAll('section'));

    buttons.forEach(button => {
      button.classList.toggle('active', button.dataset.target === targetId);
    });

    sections.forEach(section => {
      section.classList.toggle('active', section.id === targetId);
    });
  }

  function setupTabs() {
    const doc = getDocument();
    if (!doc) {
      return;
    }

    const buttons = Array.from(doc.querySelectorAll('nav .tab'));
    const sections = Array.from(doc.querySelectorAll('section'));
    const defaultSection = doc.querySelector('section.active');
    const defaultId = defaultSection ? defaultSection.id : sections[0]?.id;

    buttons.forEach(button => {
      button.addEventListener('click', () => activateTab(button.dataset.target));
    });

    if (defaultId) {
      activateTab(defaultId);
    }
  }

  function setupTaskLinks() {
    const doc = getDocument();
    if (!doc) {
      return;
    }

    const links = Array.from(doc.querySelectorAll('.task-link[data-target]'));
    links.forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        const targetId = link.dataset.target;
        if (targetId) {
          activateTab(targetId);
        }
      });
    });
  }

  function normaliseRandom(raw) {
    if (!Number.isFinite(raw)) {
      return Math.random();
    }

    const fractional = raw % 1;
    if (fractional === 0 && raw !== 0) {
      return 0;
    }

    return fractional < 0 ? fractional + 1 : fractional;
  }

  function registerPuzzle(id, handlers) {
    if (!id) {
      throw new Error('Puzzle id is required when registering a puzzle.');
    }

    const entry = {
      init: handlers?.init ?? null,
      reset: handlers?.reset ?? null,
      reveal: handlers?.reveal ?? null,
      description: handlers?.description ?? '',
    };

    puzzles.set(id, entry);

    if (typeof entry.init === 'function') {
      onDocumentReady(() => entry.init());
    }
  }

  function invokeHooks(collection) {
    collection.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('SubControls hook error:', error);
      }
    });
  }

  function registerHook(collection, handler) {
    if (typeof handler !== 'function') {
      return () => {};
    }

    collection.add(handler);

    return () => {
      collection.delete(handler);
    };
  }

  function unregisterHook(collection, handler) {
    if (typeof handler !== 'function') {
      return;
    }

    collection.delete(handler);
  }

  function registerResetHook(handler) {
    return registerHook(resetHooks, handler);
  }

  function registerRevealHook(handler) {
    return registerHook(revealHooks, handler);
  }

  function unregisterResetHook(handler) {
    unregisterHook(resetHooks, handler);
  }

  function unregisterRevealHook(handler) {
    unregisterHook(revealHooks, handler);
  }

  function resetAllPuzzles() {
    clearKeywordBanner();
    setDevOutput('');

    invokeHooks(resetHooks);

    puzzles.forEach(entry => {
      if (typeof entry.reset === 'function') {
        entry.reset();
      }
    });
  }

  function revealAllSolutions() {
    const sections = [];

    invokeHooks(revealHooks);

    puzzles.forEach((entry, id) => {
      if (typeof entry.reveal === 'function') {
        sections.push(entry.reveal());
      } else if (entry.description) {
        sections.push(`${entry.description}: Reveal not yet implemented.`);
      } else {
        sections.push(`${id}: Reveal not available.`);
      }
    });

    setDevOutput(sections.join('<br>'));
  }

  function getKeywordBanner() {
    const doc = getDocument();
    if (!doc) {
      keywordBannerEl = null;
      return null;
    }

    if (!keywordBannerEl || !doc.contains(keywordBannerEl)) {
      keywordBannerEl = doc.getElementById('keyword-banner');
    }

    return keywordBannerEl;
  }

  function getDevTools() {
    const doc = getDocument();
    if (!doc) {
      devToolsEl = null;
      return null;
    }

    if (!devToolsEl || !doc.contains(devToolsEl)) {
      devToolsEl = doc.getElementById('dev-tools');
    }

    return devToolsEl;
  }

  function getDevOutput() {
    const doc = getDocument();
    if (!doc) {
      devOutputEl = null;
      return null;
    }

    if (!devOutputEl || !doc.contains(devOutputEl)) {
      devOutputEl = doc.getElementById('dev-output');
    }

    return devOutputEl;
  }

  function setKeywordBanner(message, owner) {
    const banner = getKeywordBanner();
    if (!banner) {
      return;
    }

    banner.textContent = message ?? '';
    banner.style.display = message ? 'block' : 'none';
    keywordOwner = message ? owner ?? null : null;
  }

  function clearKeywordBanner(owner) {
    if (owner && keywordOwner && keywordOwner !== owner) {
      return;
    }
    setKeywordBanner('', null);
  }

  function toggleDevTools() {
    const tools = getDevTools();
    if (!tools) {
      return;
    }

    tools.style.display = tools.style.display === 'none' ? 'block' : 'none';
  }

  function setDevOutput(content) {
    const output = getDevOutput();
    if (!output) {
      return;
    }

    output.innerHTML = content;
  }

  function getDevOutputElement() {
    return getDevOutput();
  }

  function getKeywordBannerElement() {
    return getKeywordBanner();
  }

  function primeDomCaches() {
    getKeywordBanner();
    getDevTools();
    getDevOutput();
  }

  onDocumentReady(() => {
    primeDomCaches();
    setupTabs();
    setupTaskLinks();
  });

  const api = {
    normaliseRandom,
    registerPuzzle,
    resetAllPuzzles,
    revealAllSolutions,
    setKeywordBanner,
    clearKeywordBanner,
    toggleDevTools,
    setDevOutput,
    getDevOutputElement,
    getKeywordBannerElement,
    registerResetHook,
    registerRevealHook,
    unregisterResetHook,
    unregisterRevealHook,
  };

  global.SubControls = Object.assign(global.SubControls || {}, api);
  global.toggleDevTools = toggleDevTools;
  global.resetGame = resetAllPuzzles;
  global.revealSolution = revealAllSolutions;
})(window);
