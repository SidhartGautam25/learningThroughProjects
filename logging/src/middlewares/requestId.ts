import type { Request, Response, NextFunction } from "express";

import { randomUUID } from "crypto";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = randomUUID();
  const traceId = randomUUID();

  req.requestId = requestId;
  req.traceId = traceId;

  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Trace-Id", traceId);

  next();
}
