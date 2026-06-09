import type { Request, Response, NextFunction } from "express";

import { randomUUID } from "crypto";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = randomUUID();

  req.requestId = requestId;

  res.setHeader("X-Request-Id", requestId);

  next();
}
