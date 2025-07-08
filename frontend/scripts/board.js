class Board {
  constructor() {
    this.board = [];
    this.currentPlayer = null; // Will be managed by server

    // Generate dom
    this.boardContainer = document.createElement("div");
    this.boardContainer.classList.add("board");
    document.body.appendChild(this.boardContainer);

    // Generate rows
    for (let i = 0; i < 7; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      this.boardContainer.appendChild(row);
      this.board.push({
        element: row,
        cells: [],
      });

      // Generate cells (bottom to top order to match server)
      for (let j = 0; j < 6; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        row.appendChild(cell);
        this.board[i].cells.push({
          element: cell,
          value: null,
        });
      }
    }
  }

  // Update board state from server game state
  updateFromGameState(gameState) {
    // Validate gameState structure
    if (!gameState || !gameState.board || !Array.isArray(gameState.board)) {
      console.error("Invalid gameState received:", gameState);
      return;
    }

    this.currentPlayer = gameState.turn;

    // Clear current board visual
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 6; row++) {
        const cell = this.board[col].cells[row];
        cell.element.innerHTML = "";

        // Try direct mapping (no reversal) to debug
        const boardRow = gameState.board[row];
        if (boardRow && Array.isArray(boardRow) && col < boardRow.length) {
          cell.value = boardRow[col];
        } else {
          // Default to null if accessing outside bounds
          cell.value = null;
          if (col === 0 && row === 0) {
            console.warn(
              "Server board structure mismatch. Expected 6x7 (rows x cols). Received:",
              gameState.board
            );
          }
        }

        // Add piece visual if there's a piece
        if (cell.value) {
          const cellContent = document.createElement("div");
          cellContent.classList.add("cell-content");
          cellContent.style.setProperty("--cell-color", cell.value);
          // No animation for server updates (pieces are already placed)
          cellContent.style.setProperty("--fall-cells", 0);
          cell.element.appendChild(cellContent);
        }
      }
    }
  }

  // Local piece placement (for visual feedback, actual logic is server-side)
  tryAddPiece(col) {
    const gameState = window.gameState;

    // Check if player can place a piece
    if (!gameState.isInGame() || !gameState.isMyTurn()) {
      console.log("Cannot place piece: not in game or not my turn");
      return;
    }

    // Find the first empty cell from top (direct mapping test)
    const index = this.board[col].cells.findIndex(
      (cell) => cell.value === null
    );

    if (index === -1) {
      console.log("Column is full");
      return;
    }

    // Send the move to the server (server will handle the placement and send update)
    gameState.placePiece(col);
  }
}

const board = new Board();
let wasHandPressed = false;

const placeholder = document.createElement("div");
placeholder.classList.add("placeholder");
placeholder.style.display = "none";
document.body.appendChild(placeholder);

// Expose board instance to window for socket integration
window.board = board;

handTracker.onHandsMove((hands) => {
  // Check if player is in game and if it's their turn
  const gameState = window.gameState;
  const canPlay = gameState && gameState.isInGame() && gameState.isMyTurn();

  if (hands.length === 0 || !canPlay) {
    placeholder.style.display = "none";
    return;
  }

  placeholder.style.display = "block";

  const hand = hands[0];
  const { position, isContact } = hand;

  // Get the closest column
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
    // Contact down event
    wasHandPressed = true;
  }

  if (!isContact && wasHandPressed) {
    // Contact up event
    wasHandPressed = false;
    board.tryAddPiece(col.index);
  }

  // Show placeholder with current player's color
  const myColor = gameState.getMyColor();
  placeholder.style.setProperty("--cell-color", myColor || "blue");
  placeholder.style.left = `${col.elementCenterX}px`;
});

// Function to update hand tracking state based on game conditions
function updateHandTrackingState() {
  const gameState = window.gameState;

  if (!gameState) {
    handTracker.disable();
    placeholder.style.display = "none";
    return;
  }

  const canPlay =
    gameState.isInGame() && gameState.isMyTurn() && gameState.isLoggedIn();

  if (canPlay) {
    handTracker.enable();
  } else {
    handTracker.disable();
    placeholder.style.display = "none";
  }
}

// Check hand tracking state periodically
setInterval(updateHandTrackingState, 100);
