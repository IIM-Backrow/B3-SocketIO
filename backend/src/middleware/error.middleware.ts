import { Request, Response, NextFunction } from "express";
import { createFeatureLogger } from "../../lib/logger";
import { isDevelopment } from "@/config/server";

const logger = createFeatureLogger("error.middleware");

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = error.statusCode || 500;

  logger.error("Error occurred", {
    error: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (res.headersSent) {
    return next(error);
  }

  res.status(statusCode).json({
    status: "error",
    message: isDevelopment ? error.message : "Internal server error",
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
};
