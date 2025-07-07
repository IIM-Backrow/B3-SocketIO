# Getting Started

## Prerequisites

- Node.js 18+
- npm or pnpm

## Installation

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   LOG_LEVEL=info
   ```

## Development

### Start the Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3000` with:

- Express HTTP server
- Socket.IO server
- Automatic restart on file changes

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint and Prettier
- `npm run format` - Format code with Prettier

## API Endpoints

### REST Endpoints

- `GET /api/status` - Server status information
- `GET /api/socket/info` - Socket.IO connection information

### Socket.IO Events

- `ping` - Client to server ping with timestamp
- `pong` - Server response to ping with timestamp

## Project Structure Quick Tour

```
backend/src/
├── config/              # Server configuration
├── controllers/         # HTTP request handlers
├── middleware/          # Express middleware
├── routes/             # Route definitions
├── socket/             # Socket.IO functionality
│   └── handlers/       # Socket event handlers
├── utils/              # Utility functions
├── app.ts             # Main app class
└── index.ts           # Entry point

shared/types/           # Shared TypeScript types
```

## Adding New Features

### Creating an Express Route

1. Create controller in `/src/controllers/`
2. Create route file in `/src/routes/`
3. Register route in `app.ts`

See [Express Routes Guide](./express-routes.md) for details.

### Creating Socket Events

1. Define event types in `/shared/types/socket-events.ts`
2. Create handler in `/src/socket/handlers/`
3. Register handler in socket service

See [Socket Events Guide](./socket-events.md) for details.

## Key Features

### Automatic Error Handling

- All controllers wrapped with error handling
- Centralized error logging and responses
- Consistent error format across the API

### Feature-based Logging

- Structured logging with Winston
- Feature-specific loggers for better traceability
- Request context automatically included

### Type Safety

- Shared types between frontend and backend
- Socket.IO events are fully typed
- TypeScript strict mode enabled

## Testing the API

### Using curl

```bash
# Check server status
curl http://localhost:3000/api/status

# Get socket info
curl http://localhost:3000/api/socket/info
```

### Using Socket.IO Client

```javascript
const socket = io("http://localhost:3000");

// Send ping
socket.emit("ping", Date.now());

// Listen for pong
socket.on("pong", (timestamp) => {
  console.log("Received pong:", timestamp);
});
```

## Environment Configuration

### Development

- Detailed console logging with colors
- Error stack traces included in responses
- Automatic server restart on file changes

### Production

- JSON structured logging
- Minimal error information in responses
- Optimized build with type checking

## Next Steps

1. **Read the Architecture**: [Architecture Overview](./architecture.md)
2. **Learn Error Handling**: [Error Handling Guide](./error-handling.md)
3. **Understand Logging**: [Logging System](./logging.md)
4. **Build Features**: Follow the route and socket guides

## Common Issues

### Port Already in Use

If port 3000 is busy, change the `PORT` in your `.env` file.

### CORS Issues

Update `CORS_ORIGIN` in your `.env` file to match your frontend URL.

### TypeScript Errors

Run `npm run build` to check for compilation errors before starting development.
