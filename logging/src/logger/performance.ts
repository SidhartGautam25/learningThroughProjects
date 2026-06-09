import { performanceLogger } from "./index.js";

export function logPerformance(
  action: string,
  durationMs: number,
  fields: Record<string, unknown> = {},
) {
  performanceLogger.info(
    {
      event: {
        category: "performance",
        action,
      },
      performance: {
        durationMs,
      },
      ...fields,
    },
    "performance measurement recorded",
  );
}

export async function measureAsync<T>(
  action: string,
  callback: () => Promise<T>,
): Promise<T> {
  const start = process.hrtime.bigint();

  try {
    const result = await callback();
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    logPerformance(action, durationMs);

    return result;
  } catch (error) {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    performanceLogger.error(
      {
        event: {
          category: "performance",
          action,
        },
        performance: {
          durationMs,
        },
        err: error,
      },
      "performance measurement failed",
    );

    throw error;
  }
}
