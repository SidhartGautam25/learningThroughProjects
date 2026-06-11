import type { Request, Response, NextFunction } from "express";

import { requestContext } from "../context/requestContext.js";
import { trace } from "node:console";

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const context = {
    requestId: req.requestId,
    traceId: req.traceId,
  };

  requestContext.run(context, () => {
    next();
  });
}
