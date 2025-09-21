(function (app) {
  if (!app) {
    return;
  }

  function initPuzzle() {
    // Placeholder for navigation riddle setup.
  }

  function resetPuzzle() {
    // No interactive elements yet.
  }

  function revealHint() {
    return "🗺️ Nav Riddle: Captain's clues forthcoming.";
  }

  app.registerPuzzle('navigation', {
    init: initPuzzle,
    reset: resetPuzzle,
    reveal: revealHint,
    description: 'Nav Riddle',
  });
})(window.SubControls);
