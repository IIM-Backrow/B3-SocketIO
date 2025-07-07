# Error Handling

## Overview

The project uses a centralized error handling system that ensures consistent error responses and proper logging.

## Error Handling Flow

1. **Controller/Handler Level**: Errors are caught by utility wrappers
2. **Logging**: Errors are logged with context
3. **Middleware**: Express error middleware formats responses
4. **Response**: Consistent error format sent to client

## Express Route Error Handling

### Using `withErrorHandling`

Wrap all controller methods with the error handling utility:

```typescript
import { withErrorHandling } from "../utils/error-handler.util";
import { createFeatureLogger } from "../../lib/logger";

const logger = createFeatureLogger("my.controller");

export class MyController {
  public static myMethod = withErrorHandling(
    logger,
    (req: Request, res: Response): void => {
      // Your controller logic here
      // Any thrown errors will be automatically caught and handled

      if (someCondition) {
        throw new Error("Something went wrong");
      }

      res.json({ success: true });
    }
  );
}
```

### Error Flow

1. Error thrown in controller
2. `withErrorHandling` catches error
3. Error logged with request context
4. Error passed to Express error middleware
5. Formatted response sent to client

## Socket Event Error Handling

### Using `withSocketErrorHandling`

Wrap socket event handlers:

```typescript
import { withSocketErrorHandling } from "../../utils/socket-error-handler.util";

export class MyHandler {
  public static handleEvent(socket: Socket): void {
    socket.on(
      "my_event",
      withSocketErrorHandling<[DataType]>(
        logger,
        "my_event",
        socket,
        (data: DataType) => {
          // Your event logic here
          // Errors are caught and logged automatically
        }
      )
    );
  }
}
```

## Error Response Format

All errors result in consistent JSON responses:

```typescript
{
  "status": "error",
  "message": "Error description",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

In development mode, additional debugging information is included:

```typescript
{
  "status": "error",
  "message": "Error description",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "stack": "Error stack trace..."
}
```

## Custom Error Types

You can throw errors with custom status codes by creating Error objects with a `statusCode` property:

```typescript
const error = new Error("Resource not found");
error.statusCode = 404;
throw error;
```

## Error Logging

All errors are automatically logged with context:

```typescript
{
  "error": "Error message",
  "stack": "Stack trace",
  "statusCode": 500,
  "url": "/api/endpoint",
  "method": "GET",
  "ip": "127.0.0.1"
}
```

## Best Practices

### Do's

- Always use `withErrorHandling` for Express controllers
- Always use `withSocketErrorHandling` for Socket.IO events
- Throw descriptive error messages
- Use appropriate HTTP status codes for custom errors

### Don'ts

- Don't handle errors manually in controllers
- Don't send error responses directly from controllers
- Don't catch errors unless you need to add context

## 404 Handling

Routes that don't exist are automatically handled by the `notFoundHandler` middleware:

```typescript
{
  "status": "error",
  "message": "Route /api/nonexistent not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Testing Error Handling

You can test error handling by adding error conditions to your controllers or socket handlers. The error system will automatically catch, log, and respond appropriately.
