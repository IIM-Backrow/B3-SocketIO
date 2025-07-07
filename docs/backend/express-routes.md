# Express Routes Guide

## Creating a New Route

Follow these steps to add a new Express route to the project.

### 1. Create a Controller

Create a new controller in `/src/controllers/`:

```typescript
// src/controllers/example.controller.ts
import { Request, Response, NextFunction } from "express";
import { createFeatureLogger } from "../../lib/logger";
import { withErrorHandling } from "../utils/error-handler.util";

const logger = createFeatureLogger("example.controller");

export class ExampleController {
  public static getExample = withErrorHandling(
    logger,
    (req: Request, res: Response): void => {
      logger.info("Example endpoint accessed", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(200).json({
        message: "Hello from example endpoint",
        timestamp: new Date().toISOString(),
      });
    }
  );

  public static postExample = withErrorHandling(
    logger,
    (req: Request, res: Response): void => {
      const { data } = req.body;

      logger.info("Example POST endpoint accessed", {
        data,
        ip: req.ip,
      });

      res.status(201).json({
        message: "Data received",
        receivedData: data,
        timestamp: new Date().toISOString(),
      });
    }
  );
}
```

### 2. Create Route Definitions

Create a new route file in `/src/routes/`:

```typescript
// src/routes/example.routes.ts
import { Router } from "express";
import { ExampleController } from "../controllers/example.controller";

const router = Router();

router.get("/", ExampleController.getExample);
router.post("/", ExampleController.postExample);

export { router as exampleRoutes };
```

### 3. Register Routes in App

Add the routes to the main application in `/src/app.ts`:

```typescript
// In app.ts imports
import { exampleRoutes } from "./routes/example.routes";

// In setupRoutes() method
private setupRoutes(): void {
  this.app.use("/api/status", statusRoutes);
  this.app.use("/api/example", exampleRoutes); // Add this line
  this.app.get("/api/socket/info", this.socketInfoController.getSocketInfo);
}
```

## Route Patterns

### Error Handling

Always wrap controller methods with `withErrorHandling()`:

- Automatically catches and logs errors
- Passes errors to centralized error middleware
- Ensures consistent error responses

### Logging

- Use feature-specific loggers: `createFeatureLogger("feature.name")`
- Log important actions with context (IP, user agent, data)
- Include relevant request information

### Response Format

Follow consistent response patterns:

```typescript
// Success response
res.status(200).json({
  data: result,
  timestamp: new Date().toISOString(),
});

// Error handling is automatic via middleware
```

## Example Usage

The routes will be available at:

- `GET /api/example/` - Returns example data
- `POST /api/example/` - Accepts and processes data

All errors are automatically handled by the error middleware and logged with appropriate context.
