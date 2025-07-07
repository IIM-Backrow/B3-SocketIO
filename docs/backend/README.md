# Socket.IO Backend

A robust Socket.IO backend featuring a clean architecture with Express, TypeScript, and comprehensive error handling and logging systems.

## Project Overview

This backend demonstrates a well-structured Socket.IO server application with:

- **Clean Architecture**: Organized folder structure with separation of concerns
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Real-time Communication**: Socket.IO with proper event handling
- **Centralized Error Handling**: Consistent error responses across the application
- **Feature-based Logging**: Structured logging with Winston
- **Development Ready**: Complete development setup with linting and build tools

## Technologies Used

- **Backend**: Node.js, Express, TypeScript
- **Real-time Communication**: Socket.IO
- **Logging**: Winston with feature-specific loggers
- **Development**: ESLint, Prettier, TypeScript compiler
- **Architecture**: Clean separation with controllers, routes, middleware, and services

## Quick Start

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**

   ```bash
   # Create .env file in backend directory
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   LOG_LEVEL=info
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Test the API**
   ```bash
   curl http://localhost:3000/api/status
   ```

## API Endpoints

- `GET /api/status` - Server status and system information

## Socket.IO Events

- `ping` - Client to server ping with timestamp
- `pong` - Server response to ping with timestamp

## Backend Project Structure

```
backend/
├── src/
│   ├── config/          # Server configuration
│   ├── controllers/     # Express controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # Route definitions
│   ├── socket/          # Socket.IO handlers
│   ├── utils/           # Utility functions
│   ├── app.ts          # Main application
│   └── index.ts        # Entry point
└── lib/                # External libraries
```

## Developer Documentation

### Getting Started

- **[📖 Getting Started Guide](./getting-started.md)** - Complete setup and development guide

### Architecture & Design

- **[🏗️ Architecture Overview](./architecture.md)** - Project structure and design principles

### Development Guides

- **[🌐 Express Routes Guide](./express-routes.md)** - How to create REST API endpoints
- **[⚡ Socket Events Guide](./socket-events.md)** - How to create Socket.IO event handlers

### System Documentation

- **[🚨 Error Handling](./error-handling.md)** - Centralized error management system
- **[📊 Logging System](./logging.md)** - Feature-based logging with Winston

## Key Features

### Automatic Error Handling

- All controllers wrapped with error handling utilities
- Centralized error middleware with consistent responses
- Feature-specific error logging with request context

### Type Safety

- Shared TypeScript interfaces between frontend and backend
- Socket.IO events fully typed for better development experience
- Strict TypeScript configuration for reliability

### Clean Architecture

- Separation of concerns with clear folder structure
- Feature-based organization for scalability
- Consistent patterns for controllers, routes, and handlers

### Development Experience

- Hot reload with `tsx` for fast development
- ESLint and Prettier for code quality
- Comprehensive logging for debugging and monitoring

## Available Scripts

```bash
npm run dev     # Start development server with hot reload
npm run build   # Build TypeScript to JavaScript
npm run start   # Start production server
npm run lint    # Run ESLint and Prettier checks
npm run format  # Format code with Prettier
```

## Environment Configuration

### Development

- Detailed console logging with colors
- Error stack traces in responses
- Automatic server restart on changes

### Production

- JSON structured logging for log aggregation
- Minimal error information in responses
- Optimized TypeScript build

## Contributing

1. Read the [Architecture Overview](./architecture.md) to understand the project structure
2. Follow the development guides for creating new features
3. Ensure all code passes `npm run lint` before committing
4. Test your changes with `npm run build` to verify TypeScript compilation

## License

This project is for educational purposes as part of the IIM B3 curriculum.
