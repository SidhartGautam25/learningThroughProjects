import type { Request, Response, NextFunction } from "express";

import { requestContext } from "../context/requestContext.js";

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const context = {
    requestId: req.requestId,
  };

  requestContext.run(context, () => {
    next();
  });
}
