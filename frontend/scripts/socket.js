const socket = io();
console.log('Socket.IO client initialized');

let gameState = {
    currentPlayer: 1,
    gameId: null,
    playerId: null,
    playerNumber: null,
    gameBoard: [],
    isConnected: false
};

function initializeGameBoard() {
    gameState.gameBoard = Array(7).fill(null).map(() => Array(6).fill(null));
}

socket.on('connect', () => {
    console.log('Connected to server');
    gameState.isConnected = true;
    initializeGameBoard();
    setTimeout(() => {
        joinGame();
    }, 1000);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    gameState.isConnected = false;
});

socket.on('connect_error', (error) => {
    console.log('Connection failed:', error);
    gameState.isConnected = false;
});

socket.on('gameJoined', (data) => {
    console.log('Joined game:', data);
    gameState.gameId = data.gameId;
    gameState.playerId = data.playerId;
    gameState.playerNumber = data.playerNumber;
    gameState.currentPlayer = data.currentPlayer;
});

socket.on('gameState', (data) => {
    console.log('Game state updated:', data);
    gameState.gameBoard = data.board;
    gameState.currentPlayer = data.currentPlayer;

    updateVisualBoard();
});

socket.on('piecePlaced', (data) => {
    console.log('Piece placed:', data);
    gameState.gameBoard = data.board;
    gameState.currentPlayer = data.currentPlayer;

    updateVisualBoard();

    const color = data.currentPlayer === 1 ? 'blue' : 'red';
    startTurnAnimation(color);
});

socket.on('gameWon', (data) => {
    console.log('Game won:', data);
    const winnerColor = data.winner === 1 ? 'blue' : 'red';
    startWinAnimation(winnerColor);
});

socket.on('gameRestarted', () => {
    console.log('Game restarted');
    window.location.reload();
});

function joinGame() {
    socket.emit('joinGame');
}

function placePiece(column) {
    if (gameState.currentPlayer === gameState.playerNumber) {
        socket.emit('placePiece', {
            gameId: gameState.gameId,
            column: column,
            playerId: gameState.playerId
        });
    }
}

function restartGame() {
    socket.emit('restartGame', { gameId: gameState.gameId });
}

function updateVisualBoard() {
    if (typeof board !== 'undefined' && gameState.gameBoard && gameState.gameBoard.length > 0) {
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row < 6; row++) {
                if (gameState.gameBoard[col] && gameState.gameBoard[col][row] !== undefined) {
                    const cell = board.board[col].cells[row];
                    const boardValue = gameState.gameBoard[col][row];

                    if (boardValue !== null && cell.value !== boardValue) {
                        cell.value = boardValue;

                        cell.element.innerHTML = '';

                        const cellContent = document.createElement("div");
                        cellContent.classList.add("cell-content");
                        cellContent.style.setProperty(
                            "--cell-color",
                            boardValue === 1 ? "blue" : "red"
                        );
                        cell.element.appendChild(cellContent);
                    }
                }
            }
        }
    }
}

window.gameState = gameState;
window.placePiece = placePiece;
window.restartGame = restartGame;
window.updateVisualBoard = updateVisualBoard;
