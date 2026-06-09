import type { Request, Response, NextFunction } from "express";

import { logger } from "../logger/index.js";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(
    {
      event: {
        category: "application",
        action: "unhandled_error",
        outcome: "failure",
      },
      err: error,
    },
    "unhandled error",
  );

  res.status(500).json({
    message: "internal server error",
  });
}
