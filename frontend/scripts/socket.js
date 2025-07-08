// DOM Elements
const playButton = document.getElementById("play-button");
const bottomDrawer = document.getElementById("bottom-drawer");
const informativeText = document.getElementById("informative-text");
const loginModal = document.getElementById("login-modal");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username-input");
const profileDisplay = document.getElementById("profile-display");
const profileUsername = document.getElementById("profile-username");
const profileElo = document.getElementById("profile-elo");
const logoutButton = document.getElementById("logout-button");
const pingDisplay = document.getElementById("ping-display");
const pingText = document.getElementById("ping-text");

// Game state management
let isInGame = false;
let myColor = null; // "red" or "blue"
let currentGameState = null;
let userProfile = null;
let isLoggedIn = false;
let lastPingTimestamp = 0;
let isInQueue = false;
let queueStartTime = 0;
let waitTimeInterval = null;
let previousTurn = null; // Track previous turn for animation triggering

// Check if user is already logged in via localStorage
const savedUsername = localStorage.getItem("connectfour_username");
if (savedUsername) {
  isLoggedIn = true;
}

// Initialize socket connection
const socket = io("http://localhost:3000");

// Ping functionality
function updatePingDisplay(latency) {
  pingText.textContent = `Ping: ${latency} ms`;

  // Remove existing color classes
  pingText.classList.remove("good", "warning", "bad");

  // Add appropriate color class based on latency
  if (latency <= 30) {
    pingText.classList.add("good");
  } else if (latency <= 50) {
    pingText.classList.add("warning");
  } else {
    pingText.classList.add("bad");
  }
}

function sendPing() {
  lastPingTimestamp = Date.now();
  socket.emit("ping", lastPingTimestamp);
}

// Start periodic ping every 500ms
let pingInterval;
function startPeriodicPing() {
  if (pingInterval) clearInterval(pingInterval);

  // Send initial ping
  sendPing();

  // Set up periodic ping
  pingInterval = setInterval(sendPing, 500);
}

function stopPeriodicPing() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

// Wait timer functionality
function formatWaitTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function startWaitTimer() {
  queueStartTime = Date.now();
  if (waitTimeInterval) clearInterval(waitTimeInterval);

  waitTimeInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - queueStartTime) / 1000);
    playButton.textContent = formatWaitTime(elapsed);
  }, 1000);
}

function stopWaitTimer() {
  if (waitTimeInterval) {
    clearInterval(waitTimeInterval);
    waitTimeInterval = null;
  }
}

// Button state management
function setPlayButtonState(state) {
  // Remove all state classes
  playButton.classList.remove("ready", "waiting");

  switch (state) {
    case "ready":
      playButton.classList.add("ready");
      playButton.textContent = "PLAY";
      playButton.disabled = false;
      break;
    case "waiting":
      playButton.classList.add("waiting");
      playButton.textContent = "0:00";
      playButton.disabled = false;
      break;
    case "disabled":
      playButton.disabled = true;
      playButton.textContent = "PLAY";
      break;
  }
}

function showBottomDrawer() {
  bottomDrawer.classList.remove("hidden");
}

function hideBottomDrawer() {
  bottomDrawer.classList.add("hidden");
}

// Socket connection events
socket.on("connect", () => {
  console.log("Connected to the server");

  // Start periodic ping
  startPeriodicPing();

  // Handle login based on localStorage
  if (isLoggedIn && savedUsername) {
    // Auto-login with saved username
    socket.emit("login", savedUsername);
    hideLoginModal();
    updateUI();
  } else {
    // Show login modal if not logged in
    showLoginModal();
  }
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server");

  // Stop periodic ping
  stopPeriodicPing();

  // Reset ping display
  pingText.textContent = "Ping: -- ms";
  pingText.classList.remove("good", "warning", "bad");
});

// Login functionality
function showLoginModal() {
  // Pre-populate username if it exists in localStorage
  const savedUsername = localStorage.getItem("connectfour_username");
  if (savedUsername) {
    usernameInput.value = savedUsername;
  }

  loginModal.style.display = "flex";
  profileDisplay.classList.add("hidden");
}

function hideLoginModal() {
  loginModal.style.display = "none";
  profileDisplay.classList.remove("hidden");

  // Show play button when logged in
  setPlayButtonState("ready");
  showBottomDrawer();
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) {
    // Save username to localStorage
    localStorage.setItem("connectfour_username", username);

    socket.emit("login", username);
    hideLoginModal();
    isLoggedIn = true;
    updateUI();
  }
});

// Logout functionality
function logout() {
  // Remove username from localStorage
  localStorage.removeItem("connectfour_username");

  // Refresh the page to reset everything
  window.location.reload();
}

logoutButton.addEventListener("click", logout);

// Profile event handler
socket.on("profile", (profile) => {
  userProfile = profile;
  profileUsername.textContent = profile.username;
  profileElo.textContent = `ELO: ${profile.elo}`;
  console.log("Profile received:", profile);
});

// Ping/Pong events
socket.on("pong", (timestamp) => {
  const latency = Date.now() - timestamp;
  console.log(`Ping latency: ${latency}ms`);

  // Update ping display
  updatePingDisplay(latency);
});

// Matchmaking events
playButton.addEventListener("click", () => {
  if (!isLoggedIn) {
    showLoginModal();
    return;
  }

  if (isInQueue) {
    // Leave queue
    isInQueue = false;
    stopWaitTimer();
    setPlayButtonState("ready");
    informativeText.textContent = "Click PLAY to start matchmaking";

    // Reset game state
    isInGame = false;
    myColor = null;
    currentGameState = null;
    previousTurn = null; // Reset turn tracking

    socket.emit("leave_queue");

    // Update hand tracking state immediately
    if (window.updateHandTrackingState) {
      window.updateHandTrackingState();
    }
  } else {
    // Join queue
    isInQueue = true;
    setPlayButtonState("waiting");
    startWaitTimer();
    informativeText.textContent = "Searching for an opponent...";

    socket.emit("join_queue");
  }
});

socket.on("match_found", (color) => {
  informativeText.textContent = `Match found! You are playing as ${color}`;

  // Stop queue timer and hide drawer
  isInQueue = false;
  stopWaitTimer();
  hideBottomDrawer();

  // Set game state
  isInGame = true;
  myColor = color;
  previousTurn = null; // Reset previous turn for new game

  console.log("Match found, playing as:", color);

  // Update hand tracking state immediately
  if (window.updateHandTrackingState) {
    window.updateHandTrackingState();
  }
});

// Game events
socket.on("game_update", (gameState) => {
  console.log("Game state updated:", gameState);
  currentGameState = gameState;

  // Update board visual state
  if (window.board && window.board.updateFromGameState) {
    window.board.updateFromGameState(gameState);
  }

  // Check for turn changes and trigger animations
  if (isInGame && previousTurn !== gameState.turn) {
    const isMyTurn = gameState.turn === myColor;

    // Trigger turn animation for both players
    if (window.startTurnAnimation) {
      window.startTurnAnimation(gameState.turn);
    }

    if (isMyTurn) {
      informativeText.textContent = "Your turn! Place a piece.";
    } else {
      informativeText.textContent = `Opponent's turn (${gameState.turn})`;
    }

    // Update previous turn for next comparison
    previousTurn = gameState.turn;
  } else if (isInGame) {
    // Update UI text without animation (for non-turn changes)
    const isMyTurn = gameState.turn === myColor;
    if (isMyTurn) {
      informativeText.textContent = "Your turn! Place a piece.";
    } else {
      informativeText.textContent = `Opponent's turn (${gameState.turn})`;
    }
  }

  // Update hand tracking state
  if (window.updateHandTrackingState) {
    window.updateHandTrackingState();
  }
});

socket.on("game_end", (winner) => {
  console.log("Game ended, winner:", winner);
  isInGame = false;
  previousTurn = null; // Reset turn tracking
  const didIWin = winner === myColor;

  // Show drawer and reset button
  showBottomDrawer();
  setPlayButtonState("ready");

  if (didIWin) {
    informativeText.textContent = `You won! 🎉 Click PLAY to play again.`;
  } else {
    informativeText.textContent = `You lost. ${winner} wins! Click PLAY to play again.`;
  }

  // Trigger win animation
  setTimeout(() => {
    if (window.startWinAnimation) {
      window.startWinAnimation(winner);
    }
  }, 500);

  // Update hand tracking state immediately
  if (window.updateHandTrackingState) {
    window.updateHandTrackingState();
  }
});

// Place piece functionality (integrated with board)
function placePiece(column) {
  if (
    isInGame &&
    myColor &&
    currentGameState &&
    currentGameState.turn === myColor
  ) {
    console.log("Placing piece in column:", column);
    socket.emit("place_piece", column);
  } else {
    console.log("Cannot place piece: not my turn or not in game");
  }
}

// Function to check if it's the current player's turn
function isMyTurn() {
  return (
    isInGame && myColor && currentGameState && currentGameState.turn === myColor
  );
}

// Export game state and functions for use in other scripts
window.gameState = {
  isInGame: () => isInGame,
  isMyTurn: isMyTurn,
  getMyColor: () => myColor,
  getMyPlayerNumber: () => (myColor === "blue" ? 1 : 2), // For backward compatibility
  getCurrentGameState: () => currentGameState,
  placePiece: placePiece,
  isLoggedIn: () => isLoggedIn,
  getUserProfile: () => userProfile,
};

// Update UI based on current state
function updateUI() {
  if (!isLoggedIn) {
    setPlayButtonState("disabled");
    hideBottomDrawer();
    informativeText.textContent = "Please login to start playing";
  } else if (!isInGame && !isInQueue) {
    setPlayButtonState("ready");
    showBottomDrawer();
    informativeText.textContent = "Click PLAY to start matchmaking";
  }
}

// Initialize UI
updateUI();

// Initialize ping display
if (socket.connected) {
  startPeriodicPing();
}

// Initialize play button state
if (isLoggedIn) {
  setPlayButtonState("ready");
  showBottomDrawer();
} else {
  setPlayButtonState("disabled");
  hideBottomDrawer();
}
