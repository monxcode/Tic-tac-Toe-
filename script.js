const gameContainer = document.getElementById('game');
const info = document.getElementById('info');
const trophy = document.getElementById('trophy');
const modeBtn = document.getElementById('modeBtn');
const resetBtn = document.getElementById('resetBtn');
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let vsAI = true;
let aiThinking = false;
let winCombo = null;

let scoreX = 0, scoreO = 0, scoreAI = 0;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function drawBoard() {
  gameContainer.innerHTML = '';
  board.forEach((cell, index) => {
    const div = document.createElement('div');
    div.className = 'cell';
    div.dataset.index = index;
    div.textContent = cell;

    if (!gameActive || aiThinking) div.classList.add('disabled');
    if (winCombo && winCombo.includes(index)) div.classList.add('win');

    div.onclick = () => handleClick(index);
    gameContainer.appendChild(div);
  });

  removeWinLine();
  if (winCombo) drawWinLine(winCombo);
}

function handleClick(idx) {
  if (!gameActive || aiThinking || board[idx]) return;

  board[idx] = currentPlayer;
  clickSound.play();
  const playerWin = getWinCombo(currentPlayer);
  if (playerWin) {
    winSound.play();
    gameActive = false;
    winCombo = playerWin;
    drawBoard();
    showTrophy(currentPlayer);
    updateScore(currentPlayer);
    return;
  }

  if (board.every(cell => cell)) {
    drawSound.play();
    info.textContent = "😐 It's a Draw!";
    drawBoard();
    return;
  }

  if (vsAI && currentPlayer === 'X') {
    info.textContent = 'AI is Thinking...';
    aiThinking = true;
    drawBoard();
    setTimeout(() => {
      const move = bestMove();
      if (move !== -1) {
        board[move] = 'O';
        clickSound.play();
        const aiWin = getWinCombo('O');
        if (aiWin) {
          winSound.play();
          info.textContent = '😈 You Lose to AI!';
          winCombo = aiWin;
          showTrophy('AI');
          updateScore('AI');
          gameActive = false;
        } else if (board.every(cell => cell)) {
          drawSound.play();
          info.textContent = "😐 It's a Draw!";
        } else {
          info.textContent = 'Your Turn';
        }
      }
      aiThinking = false;
      drawBoard();
    }, 400);
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    info.textContent = currentPlayer + "'s Turn";
    drawBoard();
  }
}

function bestMove() {
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = 'O';
      if (getWinCombo('O')) { board[i] = ''; return i; }
      board[i] = '';
    }
  }
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = 'X';
      if (getWinCombo('X')) { board[i] = ''; return i; }
      board[i] = '';
    }
  }
  if (!board[4]) return 4;
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length) return pickRandom(corners);
  const sides = [1,3,5,7].filter(i => !board[i]);
  if (sides.length) return pickRandom(sides);
  return -1;
}

function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function getWinCombo(p) {
  for (const combo of WIN_LINES) {
    if (combo.every(i => board[i] === p)) return combo;
  }
  return null;
}

function drawWinLine(combo) {
  const first = combo[0];
  const last = combo[2];

  const gridGap = 10, cellSize = 80;
  const col = i => i % 3, row = i => Math.floor(i / 3);

  const x1 = col(first) * (cellSize + gridGap) + cellSize / 2;
  const y1 = row(first) * (cellSize + gridGap) + cellSize / 2;
  const x2 = col(last) * (cellSize + gridGap) + cellSize / 2;
  const y2 = row(last) * (cellSize + gridGap) + cellSize / 2;

  const dx = x2 - x1, dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const line = document.createElement('div');
  line.className = 'win-line';
  line.style.width = length + 'px';
  line.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
  gameContainer.appendChild(line);
}

function removeWinLine() {
  const existing = gameContainer.querySelector('.win-line');
  if (existing) existing.remove();
}

function resetGame() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  aiThinking = false;
  winCombo = null;
  removeWinLine();
  trophy.style.display = 'none';
  info.textContent = vsAI ? 'Your Turn' : currentPlayer + "'s Turn";
  drawBoard();
}

function toggleMode() {
  vsAI = !vsAI;
  modeBtn.textContent = vsAI ? 'Mode: Vs AI' : 'Mode: P vs P';
  resetGame();
  if (!vsAI) info.textContent = currentPlayer + "'s Turn";
}

function showTrophy(winner) {
  let svg;
  if (vsAI && winner === 'X') {
    info.textContent = "🎉 You're the Master!";
    svg = `🏆`;
  } else if (winner === 'AI' || (vsAI && winner === 'O')) {
    info.textContent = '🤖 You Lose to AI!';
    svg = `🤖`;
  } else {
    info.textContent = `🎉 ${winner} Wins!`;
    svg = `🏆 <span style='font-size:1.5rem;'>(${winner})</span>`;
  }
  trophy.innerHTML = `<div style='font-size:3rem;'>${svg}</div>`;
  trophy.style.display = 'block';
}

function updateScore(winner) {
  if (winner === 'X') scoreX++;
  if (winner === 'O') scoreO++;
  if (winner === 'AI') scoreAI++;
  document.getElementById('scoreX').textContent = `X Wins: ${scoreX}`;
  document.getElementById('scoreO').textContent = `O Wins: ${scoreO}`;
  document.getElementById('scoreAI').textContent = `AI Wins: ${scoreAI}`;
}

drawBoard();