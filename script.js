// Board initialization & update
function Gameboard() {
  // Board Array initial creation with filled cells (3 x 3)
  const rows = 3;
  const columns = 3;
  const board = [];
  
  //Nested loop for filling array with 0's
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  //Getter for board
  const getBoard = () => board;

  // Cell filler with value of player's turn (x or o)
  const fillCell = (row, column, player) => {
    // Checking cell for empty state for filling
    if (board[row][column].getValue() !== "") {
      console.log("Cell is not empty");
      return false;
    }
  
    // Fill cell with player's value
    board[row][column].putValue(player);
    return true;
  }

  //Print board update in console
  const printBoard = () => {
    const printable = board.map(row => row.map(cell => cell.getValue()));
    console.table(printable);
  };

  //Return internal functions for external use
  return { getBoard, fillCell, printBoard };
}

// Cell state filling
function Cell () {
  let value = "";

  // Filling cell with players value
  const putValue = (player) => {
    value = player;
  }

  // Getter for cell value
  const getValue = () => value;

  return { putValue, getValue };

}

// Game controller
function GameController (playerOneName, playerTwoName) {
  //Getting Board and its function for Cell filling and printing
  const board = Gameboard();

  // Players initialization
  const players = [
    { name: playerOneName, value: "X" },
    { name: playerTwoName, value: "O" }
  ];

  let activePlayer = players[0];
  let gameOver = false;
  let winner = null;

  const switchPlayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  }
  const getActivePlayer = () => activePlayer;

  const winningCombos = [
    //Rows
    [ [0, 0], [0, 1], [0, 2] ],
    [ [1, 0], [1, 1], [1, 2] ],
    [ [2, 0], [2, 1], [2, 2] ],
    //Columns
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    //Diagonalies
    [ [0, 0], [1, 1], [2, 2] ],
    [ [0, 2], [1, 1], [2, 0] ]
  ];

  const checkWinner = () => {
    const currentBoard = board.getBoard();
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      const valA = currentBoard[a[0]][a[1]].getValue();
      const valB = currentBoard[b[0]][b[1]].getValue();
      const valC = currentBoard[c[0]][c[1]].getValue();

      if (valA !== "" && valA === valB && valA === valC) {
        winner = activePlayer.name;
        console.log(`\n${winner} WINS!`);
        gameOver = true;
        return true;
      }
    }
    return false;
  };

  const checkDraw = () => {
    const currentBoard = board.getBoard();
    return currentBoard.every(row => row.every(cell => cell.getValue() !== ""));
  };

  const printNewRound = () => {
    board.printBoard();
    if (!gameOver) console.log(`\n${getActivePlayer().name}'s turn.`);
  };

  // PlayRound - put cell value, switch player, show updated board, check win conditions
  const playRound = (row, column) => {
    if (gameOver) {
      console.log("Game is over. Restart to play again.");
      return;
    }

    const success = board.fillCell(row, column, getActivePlayer().value);
    if (!success) return;

    if (checkWinner()) return;

    if (checkDraw()) {
      console.log("\nIt's a DRAW!");
      gameOver = true;
      return;
    }

    switchPlayer();
    printNewRound();
  } 

  printNewRound();

  return { 
    playRound, 
    getActivePlayer, 
    getPlayers: () => players,
    getBoard: () => board.getBoard(),
    getGameOver: () => gameOver,
    getWinner: () => winner
  };

}

function ScreenController () {
  let game;
  const startScreenDiv = document.querySelector('.start-screen');
  const gameScreenDiv = document.querySelector('.game-screen');
  const startButton = document.getElementById('start-btn');
  const resetButton = document.getElementById('reset-btn');
  const playersTurnDiv = document.querySelector('.players-turn');
  const boardDiv = document.querySelector('.board');

  function startGame () {
    const input1 = document.getElementById('player1').value.trim();
    const input2 = document.getElementById('player2').value.trim();
   
    if (!input1 || !input2) {
      alert("Please, insert both player's names.");
      return;
    }

    game = GameController(input1, input2);
    
    startScreenDiv.style.display = 'none';
    gameScreenDiv.style.display = 'block';
    updateScreen();
  }

  function resetRound () {
    const [p1, p2] = game.getPlayers();
    game = GameController(p1.name, p2.name);
    updateScreen();
  }

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    if (game.getGameOver()) {
      const winner = game.getWinner();
      playersTurnDiv.textContent = winner
        ? `${winner} wins! 🎉`
        : `It's a draw 🤝`;
    } else {
      playersTurnDiv.textContent = `${activePlayer.name}'s turn`;
    }

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.col = colIndex; 
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      });
    });
  }

  function clickHandlerBoard(e) {
    const selectedCell = e.target;
    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);

    if (isNaN(row) || isNaN(col)) return;

    game.playRound(row, col);
    updateScreen();
  }

  startButton.addEventListener('click', startGame);
  resetButton.addEventListener('click', resetRound);
  boardDiv.addEventListener('click', clickHandlerBoard);
}

ScreenController();