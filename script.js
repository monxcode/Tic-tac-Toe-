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
  modeBtn.textContent = vsAI ? 'You Vs AI' : 'P vs P';
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
    svg = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 496 496" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#2072A0;" d="M490.4,496c3.2-16,4.8-28,4.8-43.2c0-109.6-88.8-198.4-198.4-198.4S98.4,342.4,98.4,452 c0,15.2,1.6,27.2,4.8,43.2h387.2V496z"></path> <path style="fill:#065477;" d="M104.8,496h385.6c3.2-16,4.8-28,4.8-43.2c0-109.6-88-199.2-197.6-199.2"></path> <path style="fill:#E59A7C;" d="M316.8,344c0,13.6-5.6,24-15.2,24h-51.2c-9.6,0-17.6-10.4-17.6-24l0,0c0-13.6,8-24,17.6-24h51.2 C311.2,320,316.8,330.4,316.8,344L316.8,344z"></path> <g> <path style="fill:#FFCD50;" d="M410.4,0h-216c-8,0-15.2,8-15.2,16s6.4,16,15.2,16l0,0c2.4,72,8.8,200,72.8,233.6 c-1.6,1.6-2.4,2.4-2.4,4.8c0,3.2,3.2,5.6,8,8.8c-4.8,2.4-8,5.6-8,8.8c0,6.4,8.8,10.4,22.4,12.8c-0.8,25.6-0.8,52-0.8,76h-29.6v24 h96v-24h-34.4c0-24,0-51.2-0.8-76c12.8-2.4,22.4-7.2,22.4-12.8c0-3.2-3.2-6.4-8-8.8c4.8-2.4,8-5.6,8-8.8c0-1.6-0.8-1.6-2.4-4 C401.6,232,407.2,104,410.4,32l0,0c8,0,15.2-8,15.2-16S418.4,0,410.4,0z"></path> <path style="fill:#FFCD50;" d="M248.8,184h-56v-3.2C176.8,152,171.2,96,169.6,56h39.2V32h-62.4c1.6,56,6.4,151.2,46.4,181.6l0,0 l0,0l0,0l0,0l56,8.8V184z"></path> </g> <g> <path style="fill:#EAAD34;" d="M360.8,184h48v-3.2C432.8,152,433.6,96,435.2,56h-34.4V32h58.4c-2.4,56-2.4,151.2-50.4,181.6l0,0 l0,0l0,0l0,0l-48,8.8V184z"></path> <path style="fill:#EAAD34;" d="M240,193.6l-44.8-4l-0.8-1.6c-23.2-28.8-25.6-92-26.4-132h32.8V40h-48c1.6,32,0,133.6,40,173.6l0,0 l0,0l0,0l0,0l49.6,8.8L240,193.6z"></path> <path style="fill:#EAAD34;" d="M410.4,0H304.8v400h48v-24h-34.4c0-24,0-51.2-0.8-76c12.8-2.4,22.4-7.2,22.4-12.8 c0-3.2-3.2-6.4-8-8.8c4.8-2.4,8-5.6,8-8.8c0-1.6-0.8-1.6-2.4-4C401.6,232,407.2,104,410.4,32l0,0c8,0,15.2-8,15.2-16 S418.4,0,410.4,0z"></path> <polygon style="fill:#EAAD34;" points="408.8,61.6 308.8,60.8 195.2,24 408.8,24 "></polygon> <polygon style="fill:#EAAD34;" points="308.8,287.2 241.6,220.8 240,193.6 324,248.8 "></polygon> <polygon style="fill:#EAAD34;" points="315.2,104.8 200.8,56 200.8,40 328,63.2 "></polygon> <rect x="267.252" y="96.052" transform="matrix(-0.7071 -0.7072 0.7072 -0.7071 437.8675 407.0939)" style="fill:#EAAD34;" width="72.004" height="33.602"></rect> <rect x="291.339" y="181.507" transform="matrix(-0.7072 -0.707 0.707 -0.7072 418.6308 569.9816)" style="fill:#EAAD34;" width="71.999" height="33.6"></rect> </g> <polygon style="fill:#AA1A69;" points="302.4,48 325.6,95.2 378.4,103.2 340.8,140 349.6,192 302.4,167.2 256,192 264.8,140 226.4,103.2 279.2,95.2 "></polygon> <polygon style="fill:#750C41;" points="302.4,48 325.6,95.2 378.4,103.2 340.8,140 349.6,192 313.6,156.8 256,192 284,137.6 226.4,103.2 296.8,102.4 "></polygon> <g> <path style="fill:#F9BDA0;" d="M184.8,496c-28,0-48-24-48-53.6v-36.8c0-29.6,20-53.6,48-53.6h84.8c28,0,51.2,24,51.2,53.6v36.8 c0,29.6-23.2,53.6-51.2,53.6H184.8z"></path> <path style="fill:#F9BDA0;" d="M188,496c-10.4,0-19.2-9.6-19.2-20l0,0c0-10.4,8.8-20,19.2-20h135.2c10.4,0,19.2,9.6,19.2,20l0,0 c0,10.4-8.8,20-19.2,20H188z"></path> <path style="fill:#F9BDA0;" d="M190.4,424c-10.4,0-19.2-5.6-19.2-16l0,0c0-10.4,8.8-16,19.2-16h156c10.4,0,19.2,5.6,19.2,16l0,0 c0,10.4-8.8,16-19.2,16H190.4z"></path> <path style="fill:#F9BDA0;" d="M360.8,444.8c0,10.4-8.8,19.2-19.2,19.2H188c-10.4,0-19.2-8.8-19.2-19.2v-1.6 c0-10.4,8.8-19.2,19.2-19.2h153.6c10.4,0,19.2,8.8,19.2,19.2V444.8z"></path> <path style="fill:#F9BDA0;" d="M180,392c-11.2,0-19.2-9.6-19.2-20l0,0c0-10.4,8.8-20,19.2-20h156c10.4,0,19.2,9.6,19.2,20l0,0 c0,10.4-8.8,20-19.2,20H180z"></path> <path style="fill:#F9BDA0;" d="M170.4,354.4c0,0,68-31.2,73.6-32c5.6-1.6,43.2,24.8,28.8,40c-14.4,15.2-56,10.4-56,10.4 L170.4,354.4z"></path> </g> <rect x="128.8" y="352" style="fill:#FFFFFF;" width="24" height="136"></rect> <polyline style="fill:#DFE2E5;" points="128.8,352 152.8,352 152.8,488 "></polyline> <rect x="0.8" y="344" style="fill:#750C41;" width="136" height="152"></rect> <polyline style="fill:#C61867;" points="0.8,344 136.8,344 136.8,496 "></polyline> <g> <circle style="fill:#FFC114;" cx="89.6" cy="420" r="12.8"></circle> <circle style="fill:#FFC114;" cx="33.6" cy="420" r="12.8"></circle> </g> </g></svg> <span style='font-size:1.5rem;'>(${winner})</span>`;
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