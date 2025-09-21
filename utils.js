(function (global) {
  if (!global) {
    return;
  }

  const puzzles = new Map();
  const keywordBanner = document.getElementById('keyword-banner');
  const devTools = document.getElementById('dev-tools');
  const devOutput = document.getElementById('dev-output');
  let keywordOwner = null;

  function onDocumentReady(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function activateTab(targetId) {
    const buttons = Array.from(document.querySelectorAll('nav .tab'));
    const sections = Array.from(document.querySelectorAll('section'));

    buttons.forEach(button => {
      button.classList.toggle('active', button.dataset.target === targetId);
    });

    sections.forEach(section => {
      section.classList.toggle('active', section.id === targetId);
    });
  }

  function setupTabs() {
    const buttons = Array.from(document.querySelectorAll('nav .tab'));
    const sections = Array.from(document.querySelectorAll('section'));
    const defaultSection = document.querySelector('section.active');
    const defaultId = defaultSection ? defaultSection.id : sections[0]?.id;

    buttons.forEach(button => {
      button.addEventListener('click', () => activateTab(button.dataset.target));
    });

    if (defaultId) {
      activateTab(defaultId);
    }
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

  function resetAllPuzzles() {
    clearKeywordBanner();
    setDevOutput('');

    puzzles.forEach(entry => {
      if (typeof entry.reset === 'function') {
        entry.reset();
      }
    });
  }

  function revealAllSolutions() {
    const sections = [];

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

  function setKeywordBanner(message, owner) {
    if (!keywordBanner) return;
    keywordBanner.textContent = message ?? '';
    keywordBanner.style.display = message ? 'block' : 'none';
    keywordOwner = message ? owner ?? null : null;
  }

  function clearKeywordBanner(owner) {
    if (owner && keywordOwner && keywordOwner !== owner) {
      return;
    }
    setKeywordBanner('', null);
  }

  function toggleDevTools() {
    if (!devTools) return;
    devTools.style.display = devTools.style.display === 'none' ? 'block' : 'none';
  }

  function setDevOutput(content) {
    if (!devOutput) return;
    devOutput.innerHTML = content;
  }

  function getDevOutputElement() {
    return devOutput;
  }

  function getKeywordBannerElement() {
    return keywordBanner;
  }

  onDocumentReady(setupTabs);

  const api = {
    registerPuzzle,
    resetAllPuzzles,
    revealAllSolutions,
    setKeywordBanner,
    clearKeywordBanner,
    toggleDevTools,
    setDevOutput,
    getDevOutputElement,
    getKeywordBannerElement,
  };

  global.SubControls = Object.assign(global.SubControls || {}, api);
  global.toggleDevTools = toggleDevTools;
  global.resetGame = resetAllPuzzles;
  global.revealSolution = revealAllSolutions;
})(window);
