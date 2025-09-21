(function (global) {
  const GRID_SIZE = 5;
  const SOLUTION_CELLS = [
    '0-2',
    '1-1',
    '1-2',
    '1-3',
    '2-0',
    '2-1',
    '2-2',
    '2-3',
    '2-4',
    '3-1',
    '3-2',
    '3-3',
    '4-2',
  ];
  const ROW_TARGETS = [1, 3, 5, 3, 1];
  const COLUMN_TARGETS = [1, 3, 5, 3, 1];
  const SOLUTION_SET = new Set(SOLUTION_CELLS);
  const KEYWORD = 'TORPEDO';

  let app = null;
  let registered = false;
  let gridBuilt = false;
  let gridElement = null;
  let clueElement = null;
  let successElement = null;
  let successKeyword = null;
  let solved = false;

  function parseCellId(id) {
    const [row, col] = id.split('-').map(Number);
    return { row, col };
  }

  function collectState() {
    const rowCounts = Array(GRID_SIZE).fill(0);
    const columnCounts = Array(GRID_SIZE).fill(0);
    const activeIds = [];

    if (!gridElement) {
      return { rowCounts, columnCounts, activeIds };
    }

    Array.from(gridElement.querySelectorAll('.sonar-cell.active')).forEach(cell => {
      const id = cell.dataset.cell;
      if (!id) return;
      const { row, col } = parseCellId(id);
      if (Number.isInteger(row) && Number.isInteger(col)) {
        rowCounts[row] += 1;
        columnCounts[col] += 1;
        activeIds.push(id);
      }
    });

    return { rowCounts, columnCounts, activeIds };
  }

  function updateClueStatus(additionalMessage = '', state = null) {
    if (!clueElement) {
      return;
    }

    const current = state ?? collectState();
    const rowStatus = ROW_TARGETS.map((target, index) => `${current.rowCounts[index]}/${target}`).join('  |  ');
    const columnStatus = COLUMN_TARGETS.map((target, index) => `${current.columnCounts[index]}/${target}`).join('  |  ');

    let html = `<strong>Row echoes</strong>: ${rowStatus}`;
    html += `<br><strong>Column echoes</strong>: ${columnStatus}`;

    if (additionalMessage) {
      html += `<span class="sonar-alert">${additionalMessage}</span>`;
    } else if (solved) {
      html += '<span class="sonar-confirm">Contact confirmed.</span>';
    }

    clueElement.innerHTML = html;
  }

  function patternMatches(state) {
    if (!state) {
      return false;
    }

    if (state.activeIds.length !== SOLUTION_SET.size) {
      return false;
    }

    for (let index = 0; index < GRID_SIZE; index += 1) {
      if (state.rowCounts[index] !== ROW_TARGETS[index]) {
        return false;
      }
      if (state.columnCounts[index] !== COLUMN_TARGETS[index]) {
        return false;
      }
    }

    return state.activeIds.every(id => SOLUTION_SET.has(id));
  }

  function markSolved(state = null) {
    if (solved) {
      updateClueStatus('', state ?? collectState());
      return;
    }

    solved = true;

    if (successElement) {
      successElement.hidden = false;
    }

    if (successKeyword) {
      successKeyword.textContent = KEYWORD;
    }

    if (app && typeof app.setKeywordBanner === 'function') {
      app.setKeywordBanner(`📡 SIGNAL LOCKED: ${KEYWORD}`, 'sonar');
    }

    updateClueStatus('', state);
  }

  function handleCellToggle(event) {
    if (solved || !gridElement) {
      return;
    }

    const cell = event.currentTarget;
    if (!(cell instanceof HTMLElement) || !cell.dataset.cell) {
      return;
    }

    cell.classList.toggle('active');
    const { row, col } = parseCellId(cell.dataset.cell);
    const state = collectState();
    const warnings = [];

    if (state.rowCounts[row] > ROW_TARGETS[row]) {
      warnings.push(`Row ${row + 1} echo limit reached.`);
    }

    if (state.columnCounts[col] > COLUMN_TARGETS[col]) {
      warnings.push(`Column ${col + 1} echo limit reached.`);
    }

    if (warnings.length) {
      cell.classList.toggle('active');
      updateClueStatus(warnings.join(' '), collectState());
      return;
    }

    if (patternMatches(state)) {
      markSolved(state);
      return;
    }

    updateClueStatus('', state);
  }

  function buildGrid() {
    if (!gridElement) {
      return;
    }

    gridElement.innerHTML = '';

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const cell = global.document.createElement('button');
        cell.type = 'button';
        cell.className = 'sonar-cell';
        cell.dataset.cell = `${row}-${col}`;
        cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);
        cell.addEventListener('click', handleCellToggle);
        gridElement.appendChild(cell);
      }
    }

    gridBuilt = true;
  }

  function ensureElements() {
    const section = global.document?.getElementById('sonar');
    if (!section) {
      return false;
    }

    gridElement = section.querySelector('#sonar-grid');
    clueElement = section.querySelector('#sonar-clue');
    successElement = section.querySelector('#sonar-success');
    successKeyword = section.querySelector('#sonar-keyword');

    return Boolean(gridElement && clueElement && successElement && successKeyword);
  }

  function applyResetState() {
    solved = false;

    if (gridElement) {
      Array.from(gridElement.querySelectorAll('.sonar-cell')).forEach(cell => {
        cell.classList.remove('active');
      });
    }

    if (successElement) {
      successElement.hidden = true;
    }

    if (successKeyword) {
      successKeyword.textContent = KEYWORD;
    }

    if (app && typeof app.clearKeywordBanner === 'function') {
      app.clearKeywordBanner('sonar');
    }

    updateClueStatus();
  }

  function initializeSonarPuzzle() {
    if (!ensureElements()) {
      return;
    }

    buildGrid();
    applyResetState();
  }

  function resetSonarPuzzle() {
    if (!ensureElements()) {
      return;
    }

    if (!gridBuilt) {
      buildGrid();
    }

    applyResetState();
  }

  function revealSonarSolution() {
    if (!ensureElements()) {
      return '📡 Sonar Solution: Console offline.';
    }

    if (!gridBuilt) {
      buildGrid();
    }

    Array.from(gridElement.querySelectorAll('.sonar-cell')).forEach(cell => {
      const shouldActivate = cell.dataset.cell ? SOLUTION_SET.has(cell.dataset.cell) : false;
      cell.classList.toggle('active', shouldActivate);
    });

    const state = collectState();
    markSolved(state);

    return `📡 Sonar Solution: ${KEYWORD} — rows ${ROW_TARGETS.join('/')}, columns ${COLUMN_TARGETS.join('/')}.`;
  }

  function attemptRegistration() {
    if (registered) {
      return;
    }

    if (global.SubControls && typeof global.SubControls.registerPuzzle === 'function') {
      app = global.SubControls;
      app.registerPuzzle('sonar', {
        init: initializeSonarPuzzle,
        reset: resetSonarPuzzle,
        reveal: revealSonarSolution,
        description: 'Sonar Shapes',
      });
      registered = true;
    } else {
      global.setTimeout(attemptRegistration, 40);
    }
  }

  attemptRegistration();

  global.initializeSonarPuzzle = initializeSonarPuzzle;
  global.resetSonarPuzzle = resetSonarPuzzle;
  global.revealSonarSolution = revealSonarSolution;
})(window);
