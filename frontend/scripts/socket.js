// Initialize socket connection
const socket = io();
console.log('Socket.IO client initialized');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
