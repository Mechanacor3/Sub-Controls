(function (app) {
  if (!app) {
    return;
  }

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const colorEmojis = {
    red: '🐙',
    blue: '🐳',
    green: '🐢',
    yellow: '🐠',
    purple: '🪼',
    orange: '🐡',
  };
  const keywords = ['RUDDER', 'PERISCOPE', 'HELM', 'BALLAST'];

  let puzzleBox = null;
  let board = null;
  let colorPicker = null;

  let solution = [];
  let activeKeyword = null;
  let guesses = [];
  let scores = [];
  let currentRow = 0;
  let solved = false;
  let pendingCheck = null;

  const generationOverrides = {
    rng: Math.random,
    solution: null,
    keyword: null,
    solutionFactory: null,
    keywordFactory: null,
  };

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

  function getRng() {
    return typeof generationOverrides.rng === 'function' ? generationOverrides.rng : Math.random;
  }

  function generateSolution(rngFn = Math.random) {
    const rng = typeof rngFn === 'function' ? rngFn : Math.random;
    return Array.from({ length: 4 }, () => {
      const raw = rng();
      const value = normaliseRandom(typeof raw === 'number' ? raw : Math.random());
      const index = Math.min(colors.length - 1, Math.floor(value * colors.length));
      return colors[index];
    });
  }

  function validateSolution(candidate) {
    if (!Array.isArray(candidate) || candidate.length < 4) {
      return null;
    }
    const validated = candidate.slice(0, 4).filter(color => colors.includes(color));
    return validated.length === 4 ? validated : null;
  }

  function pickSolution() {
    if (typeof generationOverrides.solutionFactory === 'function') {
      const generated = generationOverrides.solutionFactory({ colors: colors.slice() });
      const validated = validateSolution(generated);
      if (validated) {
        return validated;
      }
    }

    const preset = validateSolution(generationOverrides.solution);
    if (preset) {
      return preset;
    }

    return generateSolution(getRng());
  }

  function pickKeyword() {
    if (typeof generationOverrides.keywordFactory === 'function') {
      const result = generationOverrides.keywordFactory({ keywords: keywords.slice() });
      if (typeof result === 'string' && result.trim()) {
        return result.trim();
      }
    }

    if (typeof generationOverrides.keyword === 'string' && generationOverrides.keyword.trim()) {
      return generationOverrides.keyword.trim();
    }

    const rng = getRng();
    const raw = rng();
    const value = normaliseRandom(typeof raw === 'number' ? raw : Math.random());
    const index = Math.min(keywords.length - 1, Math.floor(value * keywords.length));
    return keywords[index];
  }

  function setControlUnlockState(options = {}) {
    if (!options || typeof options !== 'object') {
      return getControlUnlockState();
    }

    if (Object.prototype.hasOwnProperty.call(options, 'rng')) {
      generationOverrides.rng = typeof options.rng === 'function' ? options.rng : Math.random;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'solutionFactory')) {
      generationOverrides.solutionFactory =
        typeof options.solutionFactory === 'function' ? options.solutionFactory : null;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'keywordFactory')) {
      generationOverrides.keywordFactory =
        typeof options.keywordFactory === 'function' ? options.keywordFactory : null;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'solution')) {
      generationOverrides.solution = validateSolution(options.solution);
      if (generationOverrides.solution) {
        solution = generationOverrides.solution.slice();
        activeKeyword = null;
        solved = false;
      }
    }

    if (Object.prototype.hasOwnProperty.call(options, 'keyword')) {
      generationOverrides.keyword =
        typeof options.keyword === 'string' && options.keyword.trim() ? options.keyword.trim() : null;
      if (generationOverrides.keyword) {
        activeKeyword = null;
      }
    }

    if (options.apply === true) {
      resetPuzzle();
    }

    return getControlUnlockState();
  }

  function getControlUnlockState() {
    return {
      solution: solution.slice(),
      keyword: activeKeyword,
      solved,
      overrides: {
        rng: generationOverrides.rng,
        solution: generationOverrides.solution ? generationOverrides.solution.slice() : null,
        keyword: generationOverrides.keyword ?? null,
        solutionFactory: generationOverrides.solutionFactory ?? null,
        keywordFactory: generationOverrides.keywordFactory ?? null,
      },
    };
  }

  function renderBoard() {
    if (!board) return;
    board.innerHTML = '';
    guesses.forEach((guess, index) => {
      if (solved && index > currentRow) return;

      const row = document.createElement('div');
      row.className = 'guess-row';

      for (let i = 0; i < 4; i++) {
        const slot = document.createElement('div');
        slot.className = 'guess-slot';
        if (guess[i]) {
          slot.classList.add('filled');
          slot.style.backgroundColor = guess[i];
          slot.style.border = '2px solid white';
          slot.textContent = colorEmojis[guess[i]] ?? '';
          const isUndoable =
            !solved && index === currentRow && i === guess.length - 1 && guess.length <= 4;
          if (isUndoable) {
            slot.classList.add('undoable');
            slot.title = 'Undo last color';
            slot.addEventListener('click', undoLastSelection);
          }
        } else {
          slot.textContent = '';
          if (index === currentRow) {
            slot.style.border = '2px dashed #ccc';
          }
        }
        row.appendChild(slot);
      }

      const blackBox = document.createElement('div');
      blackBox.className = 'score-box';
      blackBox.textContent = `🔵 ${scores[index].black}`;
      row.appendChild(blackBox);

      const whiteBox = document.createElement('div');
      whiteBox.className = 'score-box';
      whiteBox.textContent = `⚪ ${scores[index].white}`;
      row.appendChild(whiteBox);

      board.appendChild(row);
    });
  }

  function handleColorClick(color) {
    if (solved) return;
    if (guesses[currentRow].length < 4) {
      guesses[currentRow].push(color);
      renderBoard();
      if (guesses[currentRow].length === 4) {
        pendingCheck = setTimeout(() => {
          pendingCheck = null;
          checkGuess();
        }, 300);
      }
    }
  }

  function undoLastSelection() {
    if (solved) return;

    const currentGuess = guesses[currentRow];
    if (!currentGuess || !currentGuess.length) {
      return;
    }

    if (pendingCheck) {
      clearTimeout(pendingCheck);
      pendingCheck = null;
    }

    currentGuess.pop();
    renderBoard();
  }

  function renderColorPicker() {
    if (!colorPicker) return;
    colorPicker.innerHTML = '';
    colors.forEach(color => {
      const peg = document.createElement('div');
      peg.className = 'peg';
      peg.style.backgroundColor = color;
      peg.textContent = colorEmojis[color] ?? '';
      peg.addEventListener('click', () => handleColorClick(color));
      colorPicker.appendChild(peg);
    });
  }

  function checkGuess() {
    if (pendingCheck) {
      clearTimeout(pendingCheck);
      pendingCheck = null;
    }
    const guess = guesses[currentRow];
    if (!guess || guess.length < 4) {
      return;
    }
    let black = 0;
    let white = 0;
    const solutionCopy = [...solution];
    const guessCopy = [...guess];

    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === solutionCopy[i]) {
        black++;
        solutionCopy[i] = null;
        guessCopy[i] = null;
      }
    }

    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] && solutionCopy.includes(guessCopy[i])) {
        white++;
        solutionCopy[solutionCopy.indexOf(guessCopy[i])] = null;
      }
    }

    scores[currentRow] = { black, white };

    if (black === 4) {
      solved = true;
      const keyword = pickKeyword();
      activeKeyword = keyword;
      app.setKeywordBanner(`🔓 UNLOCKED: ${keyword}`, 'control-unlock');
      showSuccess(keyword);
      return;
    }

    if (currentRow === guesses.length - 1) {
      alert(`💥 Game over! The correct code was: ${solution.join(', ')}`);
    }

    currentRow++;
    renderBoard();
  }

  function showSuccess(keyword) {
    if (!puzzleBox) return;
    puzzleBox.innerHTML = `<h2>✅ Code Cracked!</h2>
      <p style='font-size:1.2rem;'>The final code was:</p>
      <div style='
        display:flex;
        justify-content:center;
        gap:1rem;
        margin-bottom: 1rem;
      '>
        ${solution
          .map(
            color =>
              `<div
                style='
                  width:2rem;
                  height:2rem;
                  border-radius:50%;
                  background:${color};
                  border:2px solid #fff;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:1.3rem;
                  text-shadow:0 0 4px rgba(1, 22, 39, 0.65);
                '
              >${colorEmojis[color] ?? ''}</div>`
          )
          .join('')}
      </div>
      <p style='margin-top:1rem; font-size:2rem; font-weight:bold; text-align:center; color:#90e0ef;'>🔓 ${keyword}</p>`;
  }

  function initialiseState() {
    guesses = Array.from({ length: 10 }, () => []);
    scores = Array.from({ length: 10 }, () => ({ black: 0, white: 0 }));
    currentRow = 0;
    solution = pickSolution();
    activeKeyword = null;
    solved = false;
    pendingCheck = null;
  }

  function buildPuzzleMarkup() {
    return `
      <h2>⚓ Control Unlock</h2>
      <p>Guess the hidden 4-color signal used by the submarine crew to unlock the vault. You have 10 tries to break the code!</p>
      <div class="board" id="board"></div>
      <div class="color-picker" id="color-picker"></div>
    `;
  }

  function resetPuzzle() {
    if (!puzzleBox) return;

    app.clearKeywordBanner('control-unlock');
    puzzleBox.innerHTML = buildPuzzleMarkup();
    board = puzzleBox.querySelector('#board');
    colorPicker = puzzleBox.querySelector('#color-picker');

    initialiseState();
    renderColorPicker();
    renderBoard();
  }

  function revealSolutionText() {
    const display = solution.length ? solution.join(', ') : 'Not initialised';
    return `🔐 Control Unlock Code: ${display}`;
  }

  function initPuzzle() {
    puzzleBox = document.getElementById('puzzle-box');
    resetPuzzle();
  }

  app.registerPuzzle('control-unlock', {
    init: initPuzzle,
    reset: resetPuzzle,
    reveal: revealSolutionText,
    description: 'Control Unlock',
  });

  Object.assign(app, {
    setControlUnlockState,
    getControlUnlockState,
  });
})(window.SubControls);
