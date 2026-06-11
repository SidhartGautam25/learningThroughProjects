import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter, SimpleSpanProcessor} from "@opentelemetry/sdk-trace-base";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  spanProcessors: [
    new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
  instrumentations: [getNodeAutoInstrumentations()],
});

export async function startTelemetry() {
  await sdk.start();
}


/*

ConsoleSpanExporter - prints the traces to console in json format
SimpleSpanProcessor - sends the spans to the exporter ( bad for production)
BatchSpanProcessor - sends the spans to the exporter in batches ( good for production)






 */