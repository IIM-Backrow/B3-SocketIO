class Board {
  constructor() {
    this.board = [];
    this.currentPlayer = 1;

    this.boardContainer = document.createElement("div");
    this.boardContainer.classList.add("board");
    document.body.appendChild(this.boardContainer);

    for (let i = 0; i < 7; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      this.boardContainer.appendChild(row);
      this.board.push({
        element: row,
        cells: [],
      });

      for (let j = 0; j < 6; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        row.appendChild(cell);
        this.board[i].cells.unshift({
          element: cell,
          value: null,
        });
      }
    }
  }

  tryAddPiece(col) {
    if (typeof gameState !== 'undefined' && gameState.isConnected && gameState.playerNumber) {
      if (gameState.currentPlayer !== gameState.playerNumber) {
        console.log("Not your turn!");
        return;
      }
      if (typeof placePiece === 'function') {
        placePiece(col);
      }
      return;
    }

    if (this.currentPlayer === 0) return;
    const index = this.board[col].cells.findIndex(
      (cell) => cell.value === null
    );
    const cell = index !== -1 ? this.board[col].cells[index] : null;

    if (cell === null) return;

    cell.value = this.currentPlayer;

    const cellContent = document.createElement("div");
    cellContent.classList.add("cell-content");
    cellContent.style.setProperty(
      "--cell-color",
      this.currentPlayer === 1 ? "blue" : "red"
    );

    const fallDistance =
      this.board[col].cells.filter((cell) => cell.value === null).length + 2;
    cellContent.style.setProperty("--fall-cells", fallDistance);

    cell.element.appendChild(cellContent);

    const currentPlayerTmp = this.currentPlayer;
    this.currentPlayer = 0;

    const timeout = fallDistance * 200 + 200;

    if (this.checkWin(col, index)) {
      setTimeout(() => {
        startWinAnimation(currentPlayerTmp === 1 ? "blue" : "red");
      }, timeout);
      return;
    }

    setTimeout(() => {
      startTurnAnimation(currentPlayerTmp === 1 ? "red" : "blue");

      setTimeout(() => {
        this.currentPlayer = currentPlayerTmp === 1 ? 2 : 1;
      }, 1000);
    }, timeout);
  }

  checkWin(col, row) {
    const ca = {
      x: col,
      y: row,
      value: this.board[col].cells[row].value,
    };

    const countWin = (x, y) => {
      return (
        this.countDirection(ca, x, y) + this.countDirection(ca, -x, -y) + 1 >= 4
      );
    };
    return (
      countWin(1, 0) || countWin(0, 1) || countWin(1, 1) || countWin(1, -1)
    );
  }

  countDirection(ca, x, y) {
    let count = 0;
    let i = ca.x + x;
    let j = ca.y + y;

    while (
      i >= 0 &&
      i < 7 &&
      j >= 0 &&
      j < 6 &&
      this.board[i].cells[j].value == ca.value
    ) {
      count++;
      i += x;
      j += y;
    }
    return count;
  }
}

const board = new Board();
let wasHandPressed = false;

const placeholder = document.createElement("div");
placeholder.classList.add("placeholder");
placeholder.style.display = "none";
document.body.appendChild(placeholder);

handTracker.onHandsMove((hands) => {
  const isLocalGame = board.currentPlayer !== 0;
  const isMultiplayerGame = typeof gameState !== 'undefined' && gameState.isConnected && gameState.playerNumber;
  const isMyTurn = !isMultiplayerGame || (gameState.currentPlayer === gameState.playerNumber);

  if (hands.length === 0 || (!isLocalGame && !isMultiplayerGame) || !isMyTurn) {
    placeholder.style.display = "none";
    return;
  }

  placeholder.style.display = "block";

  const hand = hands[0];
  const { position, isContact } = hand;

  const col = board.board.reduce(
    (prev, curr, index) => {
      const elementCenterX =
        curr.element.getBoundingClientRect().left +
        curr.element.offsetWidth / 2;

      const distance = Math.abs(elementCenterX - position.x);
      return distance < prev.distance
        ? { elementCenterX, distance, index }
        : prev;
    },
    { elementCenterX: null, distance: Infinity, index: null }
  );

  if (isContact && !wasHandPressed) {
    wasHandPressed = true;
  }

  if (!isContact && wasHandPressed) {
    wasHandPressed = false;
    board.tryAddPiece(col.index);
  }

  const currentPlayerForColor = isMultiplayerGame ? gameState.playerNumber : board.currentPlayer;
  placeholder.style.setProperty(
    "--cell-color",
    currentPlayerForColor === 1 ? "blue" : "red"
  );
  placeholder.style.left = `${col.elementCenterX}px`;
});
