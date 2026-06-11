import { startTelemetry } from "./telemetry/index.js";

async function bootstrap() {
  await startTelemetry();
  await import("./server.js");
}

bootstrap();

/*

now we will not run -> npx tsx src/server.ts
we will run -> npx tsx src/bootstrap.ts

*/
