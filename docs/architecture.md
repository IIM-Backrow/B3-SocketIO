# Project Architecture

## Overview

This is a Socket.IO project with Express backend, featuring clean architecture with proper separation of concerns.

## Project Structure

```
B3-SocketIO/
├── backend/               # Node.js/Express backend
├── frontend/              # Frontend application
├── shared/                # Shared types and utilities
└── docs/                  # Documentation
```

## Backend Structure

```
backend/
├── src/
│   ├── config/           # Server configuration
│   ├── controllers/      # Express route controllers
│   ├── middleware/       # Express middleware
│   ├── routes/           # Express route definitions
│   ├── socket/           # Socket.IO related code
│   │   └── handlers/     # Socket event handlers
│   ├── utils/            # Utility functions
│   ├── app.ts           # Main application class
│   └── index.ts         # Application entry point
├── lib/                 # External libraries (logger)
└── package.json
```

## Shared Structure

```
shared/
└── types/               # TypeScript type definitions
    └── socket-events.ts # Socket.IO event interfaces
```

## Key Components

### `/src/config`

Contains server configuration files including port, CORS settings, and environment variables.

### `/src/controllers`

Express controllers that handle HTTP request logic. Each controller focuses on a specific domain.

### `/src/routes`

Express route definitions that map URLs to controller methods.

### `/src/socket`

Socket.IO related functionality:

- Main socket service for connection management
- Event handlers organized by feature

### `/src/middleware`

Express middleware for cross-cutting concerns like error handling and request logging.

### `/src/utils`

Utility functions for error handling and common operations.

### `/shared/types`

TypeScript interfaces shared between frontend and backend, ensuring type safety across the application.

## Architecture Principles

- **Separation of Concerns**: Each folder has a specific responsibility
- **Feature-based Organization**: Socket handlers organized by functionality
- **Centralized Error Handling**: Single error middleware for all errors
- **Type Safety**: Shared types between frontend and backend
- **Logging**: Feature-specific logging throughout the application
