import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger/index.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;

    logger.info(
      {
        event: {
          category: "application",
          action: "http_request_completed",
          outcome: res.statusCode >= 500 ? "failure" : "success",
        },
        resource: {
          type: "http_request",
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
        },
        performance: {
          durationMs,
        },
      },
      "Request completed",
    );
  });

  next();
}
