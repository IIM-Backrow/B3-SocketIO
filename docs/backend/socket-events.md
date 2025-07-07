# Socket.IO Events Guide

## Creating Socket Events

Follow these steps to add new Socket.IO events to the project.

### 1. Define Event Types

Add your event types to `/shared/types/socket-events.ts`:

```typescript
// shared/types/socket-events.ts
export interface ServerToClientEvents {
  pong: (timestamp: number) => void;
  notification: (message: string) => void;
  // Add new server-to-client events here
  example_response: (data: { id: string; result: string }) => void;
}

export interface ClientToServerEvents {
  ping: (timestamp: number) => void;
  join_room: (room: string) => void;
  leave_room: (room: string) => void;
  // Add new client-to-server events here
  example_request: (data: { message: string }) => void;
}
```

### 2. Create Event Handler

Create a new handler in `/src/socket/handlers/`:

```typescript
// src/socket/handlers/example.handler.ts
import { Socket } from "socket.io";
import { createFeatureLogger } from "../../../lib/logger";
import { withSocketErrorHandling } from "../../utils/socket-error-handler.util";

const logger = createFeatureLogger("example.handler");

export class ExampleHandler {
  public static handleExampleRequest(socket: Socket): void {
    socket.on(
      "example_request",
      withSocketErrorHandling<[{ message: string }]>(
        logger,
        "example_request",
        socket,
        (data: { message: string }) => {
          logger.info("Received example request", {
            socketId: socket.id,
            message: data.message,
          });

          // Process the request
          const response = {
            id: socket.id,
            result: `Processed: ${data.message}`,
          };

          // Send response back to client
          socket.emit("example_response", response);

          logger.info("Sent example response", {
            socketId: socket.id,
            responseId: response.id,
          });
        }
      )
    );
  }

  public static handleJoinRoom(socket: Socket): void {
    socket.on(
      "join_room",
      withSocketErrorHandling<[string]>(
        logger,
        "join_room",
        socket,
        (room: string) => {
          socket.join(room);
          logger.info("Client joined room", { socketId: socket.id, room });

          // Notify others in the room
          socket
            .to(room)
            .emit("notification", `User ${socket.id} joined the room`);
        }
      )
    );
  }
}
```

### 3. Register Handler in Socket Service

Add the handler to `/src/socket/socket.service.ts`:

```typescript
// In socket.service.ts imports
import { ExampleHandler } from "./handlers/example.handler";

// In setupEventHandlers() method
private setupEventHandlers(): void {
  this.io.on("connection", (socket) => {
    logger.info("Client connected", {
      socketId: socket.id,
      remoteAddress: socket.handshake.address
    });

    // Register all event handlers
    PingHandler.handlePing(socket);
    ExampleHandler.handleExampleRequest(socket); // Add this line
    ExampleHandler.handleJoinRoom(socket);       // Add this line

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      logger.info("Client disconnected", {
        socketId: socket.id,
        reason
      });
    });
  });
}
```

## Event Patterns

### Error Handling

Always wrap event handlers with `withSocketErrorHandling()`:

- Automatically catches and logs socket errors
- Includes socket context (ID, remote address)
- Prevents crashes from unhandled errors

### Logging

- Use feature-specific loggers: `createFeatureLogger("handler.name")`
- Log events with socket ID and relevant data
- Include timing information for performance monitoring

### Room Management

For room-based features:

```typescript
// Join a room
socket.join(roomName);

// Leave a room
socket.leave(roomName);

// Emit to all clients in a room
socket.to(roomName).emit("event_name", data);

// Emit to all clients except sender
socket.broadcast.emit("event_name", data);
```

### Broadcasting

Use the socket service for server-initiated events:

```typescript
// From a controller or service
const socketService = app.getSocketService();

// Emit to all connected clients
socketService.emitToAll("notification", "Server message");

// Emit to specific room
socketService.emitToRoom("room1", "notification", "Room message");
```

## Example Client Usage

Frontend JavaScript example:

```javascript
// Connect to server
const socket = io("http://localhost:3000");

// Send example request
socket.emit("example_request", { message: "Hello server!" });

// Listen for response
socket.on("example_response", (data) => {
  console.log("Received response:", data);
});

// Join a room
socket.emit("join_room", "general");

// Listen for notifications
socket.on("notification", (message) => {
  console.log("Notification:", message);
});
```

## Type Safety

The shared types ensure type safety between frontend and backend:

- Frontend gets autocomplete for event names and data structures
- Backend validates event signatures at compile time
- Reduces runtime errors from mismatched event data
