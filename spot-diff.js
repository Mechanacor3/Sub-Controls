(function (app) {
  if (!app) {
    return;
  }

  const KEYWORD = 'PERISCOPE';

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
    callIfAvailable('resetPortholePuzzle');
  }

  function revealHint() {
    callIfAvailable('revealPortholeSolution');
    return `🔍 Porthole Puzzle Keyword: ${KEYWORD}`;
  }

  app.registerPuzzle('spot-diff', {
    init: initPuzzle,
    reset: resetPuzzle,
    reveal: revealHint,
    description: 'Porthole Puzzle',
  });
})(window.SubControls);
