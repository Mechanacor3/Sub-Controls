const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const keywords = ['RUDDER', 'PERISCOPE', 'HELM', 'BALLAST'];

let solution;
let guesses = Array.from({ length: 10 }, () => []);
let scores = Array.from({ length: 10 }, () => ({ black: 0, white: 0 }));
let currentRow = 0;

let board = null;
let colorPicker = null;
const devOutput = document.getElementById('dev-output');
const devTools = document.getElementById('dev-tools');
const keywordBanner = document.getElementById('keyword-banner');
const puzzleBox = document.getElementById('puzzle-box');

function generateSolution() {
  return Array.from({ length: 4 }, () => colors[Math.floor(Math.random() * colors.length)]);
}

function randomKeyword() {
  return keywords[Math.floor(Math.random() * keywords.length)];
}

function renderBoard() {
  board.innerHTML = '';
  guesses.forEach((guess, index) => {
    if (keywordBanner.style.display === 'block' && index > currentRow) return;
    const row = document.createElement('div');
    row.className = 'guess-row';

    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.className = 'guess-slot';
      if (guess[i]) {
        slot.classList.add('filled');
        slot.style.backgroundColor = guess[i];
        slot.style.border = '2px solid white';
      } else if (index === currentRow) {
        slot.style.border = '2px dashed #ccc';
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

function checkGuess() {
  let guess = guesses[currentRow];
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
    const keyword = randomKeyword();
    keywordBanner.textContent = `🔓 UNLOCKED: ${keyword}`;
    keywordBanner.style.display = 'block';

    puzzleBox.innerHTML = `<h2>✅ Code Cracked!</h2>
      <p style='font-size:1.2rem;'>The final code was:</p>
      <div style='display:flex; justify-content:center; gap:1rem; margin-bottom: 1rem;'>
        ${solution.map(color => `<div style='width:2rem; height:2rem; border-radius:50%; background:${color}; border:2px solid #fff;'></div>`).join('')}
      </div>
      <p style='margin-top:1rem; font-size:2rem; font-weight:bold; text-align:center; color:#90e0ef;'>🔓 ${keyword}</p>`;
    return;
  } else if (currentRow === 9) {
    alert(`💥 Game over! The correct code was: ${solution.join(', ')}`);
  }

  currentRow++;
  renderBoard();
}

function handleColorClick(color) {
  if (guesses[currentRow].length < 4) {
    guesses[currentRow].push(color);
    renderBoard();
    if (guesses[currentRow].length === 4) {
      setTimeout(checkGuess, 300);
    }
  }
}

function renderColorPicker() {
  colorPicker.innerHTML = '';
  colors.forEach(color => {
    const peg = document.createElement('div');
    peg.className = 'peg';
    peg.style.backgroundColor = color;
    peg.addEventListener('click', () => handleColorClick(color));
    colorPicker.appendChild(peg);
  });
}

function resetGame() {
  solution = generateSolution();
  guesses = Array.from({ length: 10 }, () => []);
  scores = Array.from({ length: 10 }, () => ({ black: 0, white: 0 }));
  currentRow = 0;
  keywordBanner.style.display = 'none';
  devOutput.textContent = '';

  puzzleBox.innerHTML = `
    <h2>⚓ Mastermind Code</h2>
    <p>Guess the hidden 4-color signal used by the submarine crew to unlock the vault. You have 10 tries to break the code!</p>
    <div class="board" id="board"></div>
    <div class="color-picker" id="color-picker"></div>
  `;

  // Wait for DOM rebuild
  setTimeout(() => {
    board = document.getElementById('board');
    colorPicker = document.getElementById('color-picker');
    renderColorPicker();
    renderBoard();
  }, 50);
}

function revealSolution() {
  devOutput.textContent = `🔐 Current Code: ${solution.join(', ')}`;
}

function toggleDevTools() {
  devTools.style.display = devTools.style.display === 'none' ? 'block' : 'none';
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  board = document.getElementById('board');
  colorPicker = document.getElementById('color-picker');
  solution = generateSolution();
  renderColorPicker();
  renderBoard();
});
