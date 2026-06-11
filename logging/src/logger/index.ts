import pino from "pino";
import { requestContext } from "../context/requestContext.js";
import { error, log } from "node:console";
import { getTraceContext } from "../telemetry/tracing.js";

/*

we want this schema for our logs

{
  "event": {...},
  "resource": {...},
  "actor": {...},
  "performance": {...},
  "err": {...}
}

*/

const isDev = process.env.NODE_ENV !== "production";

const options: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",

  timestamp: pino.stdTimeFunctions.isoTime,

  base: {
    service: "todo-api",
    environment: process.env.NODE_ENV || "development",
  },
  redact: {
    paths: ["password", "token"],
    censor: "[REDACTED]",
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },

  mixin() {
    // const store = requestContext.getStore();

    // return {
    //   ...(store?.requestId
    //     ? {
    //         requestId: store.requestId,
    //       }
    //     : {}),

    //   ...(store?.traceId
    //     ? {
    //         traceId: store.traceId,
    //       }
    //     : {}),
    // };

    const store = requestContext.getStore();
    const traceContext = getTraceContext();

    return {
      requestId: store?.requestId,
      traceId: traceContext.traceId,
      spanId: traceContext.spanId,
    };
  },
};

if (isDev) {
  options.transport = {
    target: "pino-pretty",
  };
}

export const logger = pino(options);
export const auditLogger = logger.child({
  logType: "audit",
});

export const performanceLogger = logger.child({
  logType: "performance",
});
