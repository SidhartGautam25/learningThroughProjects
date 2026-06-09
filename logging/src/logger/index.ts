import pino from "pino";
import { requestContext } from "../context/requestContext.js";

const isDev = process.env.NODE_ENV !== "production";

const options: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",

  timestamp: pino.stdTimeFunctions.isoTime,

  base: {
    service: "todo-api",
    environment: process.env.NODE_ENV || "development",
  },
  mixin() {
    const store = requestContext.getStore();
    return {
      ...(store?.requestId && { requestId: store.requestId }),
    };
  },
};

if (isDev) {
  options.transport = {
    target: "pino-pretty",
  };
}

export const logger = pino(options);
