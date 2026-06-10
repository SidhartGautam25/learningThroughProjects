import { trace } from "@opentelemetry/api";

export function getTraceContext() {
  const span = trace.getActiveSpan();
  if (!span) {
    return {};
  }
  const context = span.spanContext();
  return {
    traceId: context.traceId,
    spanId: context.spanId,
  };
}
