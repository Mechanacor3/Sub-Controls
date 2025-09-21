(function (app) {
  if (!app) {
    return;
  }

  function initPuzzle() {
    // Placeholder for future spot-the-difference setup.
  }

  function resetPuzzle() {
    // No dynamic state yet; reserved for future implementation.
  }

  function revealHint() {
    return '🔍 Porthole Puzzle: Calibration pending.';
  }

  app.registerPuzzle('spot-diff', {
    init: initPuzzle,
    reset: resetPuzzle,
    reveal: revealHint,
    description: 'Porthole Puzzle',
  });
})(window.SubControls);
