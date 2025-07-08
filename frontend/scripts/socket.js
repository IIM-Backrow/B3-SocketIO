const joinQueueButton = document.getElementById("join-queue");
const leaveQueueButton = document.getElementById("leave-queue");
const informativeText = document.getElementById("informative-text");

const socket = io("http://localhost:3000");
socket.on("connect", () => {
  console.log("Connected to the server");
  socket.emit("ping");
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});

joinQueueButton.addEventListener("click", () => {
informativeText.textContent = "Waiting for an opponent...";
    leaveQueueButton.disabled = false;
    joinQueueButton.disabled = true;
  socket.emit("join_queue");
});

leaveQueueButton.addEventListener("click", () => {
  informativeText.textContent = "Click on Join Queue to participate";
    leaveQueueButton.disabled = true;
    joinQueueButton.disabled = false;
  socket.emit("leave_queue");
});

socket.on("match_found", (gameId) => {
  informativeText.textContent = `Match found! Game ID: ${gameId}`;
  joinQueueButton.disabled = true;
  leaveQueueButton.disabled = true;
});