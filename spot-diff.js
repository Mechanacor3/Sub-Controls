(function (app) {
  if (!app) {
    return;
  }

  const KEYWORD = 'PERISCOPE';

  function ensurePortholeHooks() {
    if (typeof app.registerResetHook === 'function') {
      if (!app.__portholeResetHook) {
        app.__portholeResetHook = () => {
          const reset = window.resetPortholePuzzle;
          if (typeof reset === 'function') {
            reset();
          }
        };
      }
      app.registerResetHook(app.__portholeResetHook);
    }

    if (typeof app.registerRevealHook === 'function') {
      if (!app.__portholeRevealHook) {
        app.__portholeRevealHook = () => {
          const reveal = window.revealPortholeSolution;
          if (typeof reveal === 'function') {
            reveal();
          }
        };
      }
      app.registerRevealHook(app.__portholeRevealHook);
    }
  }

  ensurePortholeHooks();

  function callIfAvailable(handlerName) {
    const handler = window[handlerName];
    if (typeof handler === 'function') {
      handler();
    }
  }

  function initPuzzle() {
    callIfAvailable('initializePortholePuzzle');
  }

  function resetPuzzle() {
    const reset = window.resetPortholePuzzle;
    if (typeof reset === 'function' && app && app.__portholeResetHook === reset) {
      return;
    }
    callIfAvailable('resetPortholePuzzle');
  }

  function revealHint() {
    const reveal = window.revealPortholeSolution;
    if (!(typeof reveal === 'function' && app && app.__portholeRevealHook === reveal)) {
      callIfAvailable('revealPortholeSolution');
    }
    return `🔍 Porthole Puzzle Keyword: ${KEYWORD}`;
  }

  app.registerPuzzle('spot-diff', {
    init: initPuzzle,
    reset: resetPuzzle,
    reveal: revealHint,
    description: 'Porthole Puzzle',
  });
})(window.SubControls);
