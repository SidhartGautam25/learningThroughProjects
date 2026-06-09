import { performanceLogger } from "./index.js";

export function logPerformance(
  operation: string,
  durationMs: number,
  fields: Record<string, unknown> = {},
) {
  performanceLogger.info(
    {
      operation,
      durationMs,
      ...fields,
    },
    "performance measurement recorded",
  );
}

export async function measureAsync<T>(
  operation: string,
  callback: () => Promise<T>,
): Promise<T> {
  const start = process.hrtime.bigint();

  try {
    return await callback();
  } finally {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    logPerformance(operation, durationMs);
  }
}
