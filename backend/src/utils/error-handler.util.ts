import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";

type ControllerFunction = (req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

export const withErrorHandling = (logger: Logger, fn: ControllerFunction) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      logger.error("Error in controller", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      next(error);
    }
  };
};
