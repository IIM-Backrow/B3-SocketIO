socket = io("http://localhost:3000");
socket.on("connect", () => {
  console.log("Connected to the server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});