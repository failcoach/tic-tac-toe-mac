const statusDiv = document.getElementById("status");
const boardElement = document.getElementById("board");
const resetBtn = document.getElementById("reset-btn");
const cells = Array.from(document.querySelectorAll(".cell"));
const difficultySelect = document.getElementById("difficulty");

let board = Array(9).fill(null); // "X", "O" or null
const humanPlayer = "X";
const aiPlayer = "O";
let currentPlayer = humanPlayer;
let isGameOver = false;

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function setStatus(message) {
  statusDiv.textContent = message;
}

function handleCellClick(event) {
  const cell = event.target;
  const index = Number(cell.getAttribute("data-cell-index"));

  // ignore if game over, cell taken, or not human turn
  if (isGameOver || board[index] || currentPlayer !== humanPlayer) {
    return;
  }

  makeMove(index, humanPlayer);

  if (checkEndOfGame(humanPlayer)) {
    return;
  }

  currentPlayer = aiPlayer;
  setStatus("Computer is thinking...");

  // small delay so it feels more human
  setTimeout(() => {
    aiMove();
  }, 400);
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
}

function checkWin(player, customBoard = board) {
  return winningCombos.some(combo =>
    combo.every(i => customBoard[i] === player)
  );
}

function checkEndOfGame(lastPlayer) {
  if (checkWin(lastPlayer)) {
    isGameOver = true;
    highlightWinner(lastPlayer);
    setStatus(lastPlayer === humanPlayer ? "You win!" : "Computer wins!");
    disableAllCells();
    return true;
  }

  if (board.every(cell => cell !== null)) {
    isGameOver = true;
    setStatus("It is a draw.");
    return true;
  }

  return false;
}

function highlightWinner(player) {
  winningCombos.forEach(combo => {
    if (combo.every(index => board[index] === player)) {
      combo.forEach(index => {
        cells[index].classList.add("winner");
      });
    }
  });
}

function disableAllCells() {
  cells.forEach(cell => {
    cell.disabled = true;
  });
}

function enableAllCells() {
  cells.forEach(cell => {
    cell.disabled = false;
    cell.classList.remove("winner");
  });
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = humanPlayer;
  isGameOver = false;

  cells.forEach(cell => {
    cell.textContent = "";
  });

  enableAllCells();
  setStatus("Your turn (X)");
}

// AI logic

function aiMove() {
  if (isGameOver) return;

  const difficulty = difficultySelect.value;
  let moveIndex;

  if (difficulty === "easy") {
    moveIndex = getRandomMove();
  } else if (difficulty === "medium") {
    // 50 percent random, 50 percent smart
    if (Math.random() < 0.5) {
      moveIndex = getRandomMove();
    } else {
      moveIndex = getBestMove(board, aiPlayer, humanPlayer);
    }
  } else {
    // hard
    moveIndex = getBestMove(board, aiPlayer, humanPlayer);
  }

  if (moveIndex == null) {
    // no moves left, should be a draw
    checkEndOfGame(aiPlayer);
    return;
  }

  makeMove(moveIndex, aiPlayer);

  if (checkEndOfGame(aiPlayer)) {
    return;
  }

  currentPlayer = humanPlayer;
  setStatus("Your turn (X)");
}

function getRandomMove() {
  const emptyIndices = board
    .map((value, index) => (value === null ? index : null))
    .filter(index => index !== null);

  if (emptyIndices.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * emptyIndices.length);
  return emptyIndices[randomIndex];
}

// Minimax algorithm for perfect play
function getBestMove(currentBoard, player, otherPlayer) {
  // wrapper to start minimax and pick best move
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < 9; i++) {
    if (currentBoard[i] === null) {
      currentBoard[i] = player;
      const score = minimax(currentBoard, 0, false, player, otherPlayer);
      currentBoard[i] = null;

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

function minimax(currentBoard, depth, isMaximizing, maxPlayer, minPlayer) {
  if (checkWin(maxPlayer, currentBoard)) {
    return 10 - depth;
  }
  if (checkWin(minPlayer, currentBoard)) {
    return depth - 10;
  }
  if (currentBoard.every(cell => cell !== null)) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = maxPlayer;
        const score = minimax(currentBoard, depth + 1, false, maxPlayer, minPlayer);
        currentBoard[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }

    return bestScore;
  } else {
    let bestScore = Infinity;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = minPlayer;
        const score = minimax(currentBoard, depth + 1, true, maxPlayer, minPlayer);
        currentBoard[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }

    return bestScore;
  }
}

// hook up listeners
cells.forEach(cell => {
  cell.addEventListener("click", handleCellClick);
});

resetBtn.addEventListener("click", resetGame);

// initial
resetGame();
