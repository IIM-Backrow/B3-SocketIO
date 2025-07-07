# Logging System

## Overview

The project uses Winston for structured logging with feature-specific loggers that provide context and traceability.

## Creating a Logger

Always create feature-specific loggers:

```typescript
import { createFeatureLogger } from "../../lib/logger";

const logger = createFeatureLogger("feature.name");
```

### Feature Naming Convention

Use descriptive, hierarchical names:

- `status.controller` - Status controller
- `ping.handler` - Ping socket handler
- `socket.service` - Socket service
- `error.middleware` - Error middleware
- `app` - Main application
- `main` - Entry point

## Log Levels

Available log levels in order of severity:

- `error` - Error conditions
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Debug-level messages

## Logging Methods

### Info Logging

For general information and flow tracking:

```typescript
logger.info("User action completed", {
  userId: "123",
  action: "login",
  ip: req.ip,
  timestamp: Date.now(),
});
```

### Error Logging

For error conditions:

```typescript
logger.error("Database connection failed", {
  error: error.message,
  stack: error.stack,
  retryAttempt: 3,
});
```

### Warning Logging

For warning conditions:

```typescript
logger.warn("Rate limit approaching", {
  userId: "123",
  currentRequests: 95,
  limit: 100,
});
```

### Debug Logging

For development and troubleshooting:

```typescript
logger.debug("Processing request", {
  requestId: "abc-123",
  payload: requestData,
});
```

## Logging Patterns

### HTTP Requests

Log important request information:

```typescript
logger.info("Endpoint accessed", {
  ip: req.ip,
  userAgent: req.get("User-Agent"),
  method: req.method,
  url: req.url,
});
```

### Socket Events

Include socket context:

```typescript
logger.info("Socket event received", {
  socketId: socket.id,
  event: "ping",
  data: eventData,
  remoteAddress: socket.handshake.address,
});
```

### Business Logic

Track important operations:

```typescript
logger.info("Order processed", {
  orderId: "order-123",
  userId: "user-456",
  amount: 99.99,
  processingTime: Date.now() - startTime,
});
```

## Log Output Format

### Console Output (Development)

```
15:32:07 info: [feature.name] Message {"key":"value","ip":"127.0.0.1"}
```

### JSON Output (Production)

```json
{
  "timestamp": "2024-01-01T15:32:07.123Z",
  "level": "info",
  "message": "Message",
  "feature": "feature.name",
  "key": "value",
  "ip": "127.0.0.1"
}
```

## Best Practices

### Structure Your Logs

Always include relevant context:

```typescript
// Good
logger.info("User logged in", {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.get("User-Agent"),
});

// Bad
logger.info("User logged in");
```

### Use Appropriate Levels

- `error`: Actual errors that need attention
- `warn`: Potential issues or unusual conditions
- `info`: Normal application flow and important events
- `debug`: Detailed information for debugging

### Include Timing Information

For performance monitoring:

```typescript
const startTime = Date.now();
// ... operation ...
logger.info("Operation completed", {
  operation: "dataProcessing",
  duration: Date.now() - startTime,
  recordsProcessed: records.length,
});
```

### Avoid Logging Sensitive Data

Never log passwords, tokens, or personal information:

```typescript
// Good
logger.info("User authenticated", { userId: user.id });

// Bad
logger.info("User authenticated", {
  userId: user.id,
  password: user.password,
});
```

## Configuration

### Log Level

Set via environment variable:

```bash
LOG_LEVEL=info  # info, debug, warn, error
```

### Default Level

If not specified, defaults to `info` level.

## Automatic Logging

Some logging happens automatically:

- **HTTP Requests**: All requests are logged via middleware
- **Socket Connections**: Connection/disconnection events
- **Errors**: All errors are logged via error handling utilities
- **Server Startup**: Application initialization events

## Viewing Logs

### Development

Logs are output to console with color coding and readable format.

### Production

Logs are output as JSON for structured logging systems and log aggregation tools.
