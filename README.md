# Connect 4 Game with SocketIO and Camera Hand Tracking

A Connect 4 game that allows players to control game moves using hand gestures captured through a camera, powered by SocketIO for real-time multiplayer functionality.

## Features

- Real-time multiplayer gameplay using Socket.IO
- Hand gesture recognition for game control
- Responsive game board interface
- Live player status and game state updates
- Cross-browser and cross-device compatibility

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.IO
- **Computer Vision**: TensorFlow.js, MediaPipe for hand tracking

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- Webcam

### Installation

1. Clone the repository
    ```
    git clone https://github.com/yourusername/connect4-socketio-hand-tracking.git
    cd connect4-socketio-hand-tracking
    ```

2. Install dependencies
    ```
    npm install
    ```

3. Start the server
    ```
    npm start
    ```

4. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. Allow camera access when prompted
2. Position your hand in front of the camera
3. Use the following gestures to control the game:
    - Move your hand left/right to select a column
    - Close your fist to drop a piece in the selected column
    - Wave to reset the game (when a game is over)

## Project Structure
