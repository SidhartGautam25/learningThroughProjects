# Observability System Architecture

This document provides a deep-dive architectural analysis of the Observability & Distributed Tracing system implemented in this project. It details the system components, lifecycle events, data pipelines, and specific code blocks or configuration parameters responsible for inter-component communication and local trace storage.

---

## 🗺️ High-Level Telemetry Architecture

The architecture separates context generation, telemetry instrumentation, pipeline processing, and persistence into distinct concerns:

```
[ HTTP Request ] 
       │
       ▼
 1. [ Express Application ]  ──( Pino Logger Mixin )──► [ Structured Console Logs (Stdout) ]
       │
       ├─► ( Generates traceId / spanId via OpenTelemetry SDK )
       │
       ▼
 2. [ OpenTelemetry Node SDK ] 
       │
       ▼ ( OTLP/HTTP POST to http://localhost:4318/v1/traces )
       │
 3. [ Grafana Alloy Agent ] 
       │
       ▼ ( OTLP/gRPC to tempo:4317 )
       │
 4. [ Grafana Tempo Distributor ] 
       │
       ▼
 5. [ Grafana Tempo Storage Engine ] ──► [ Local Storage: /tmp/tempo/traces ]
```

---

## 🧩 Component Breakdown & Code walkthrough

### 1. Bootstrapping & Hook Initialization
#### Why it is done & Why it is important
OpenTelemetry auto-instrumentation works by patching the Node.js module loading system (wrapping `require` and `import` calls). If you import a library like Express *before* initializing the OpenTelemetry SDK, the SDK cannot patch Express's internal routers, resulting in a total loss of automatic HTTP trace capture.

#### Code responsible for this action
In `src/bootstrap.ts`, an asynchronous wrapper is used to ensure sequential loading:

```typescript
// src/bootstrap.ts
import { startTelemetry } from "./telemetry/index.js";

async function bootstrap() {
  // 1. Initialize and start OpenTelemetry SDK first
  await startTelemetry();
  // 2. Load the Express application only after instrumentations are ready
  await import("./server.js");
}

bootstrap();
```

---

### 2. The Express Application & Context Generation
Every incoming HTTP request undergoes three primary stages to populate its context.

#### Stage A: Request ID Generation
Each request receives a unique identifier for client response tracking.
*   **Code responsible**: [src/middlewares/requestId.ts](file:///home/sidharthg/sid/project/learningProjects/logging/src/middlewares/requestId.ts)
*   **How it works**:
    ```typescript
    export function requestIdMiddleware(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      const requestId = randomUUID();
      const traceId = randomUUID(); // Local fallback traceId
    
      req.requestId = requestId;
      req.traceId = traceId;
    
      // Attach to response headers for debugging convenience
      res.setHeader("X-Request-Id", requestId);
      res.setHeader("X-Trace-Id", traceId);
    
      next();
    }
    ```

#### Stage B: Asynchronous Storage Propagation
*   **Why it is done**: To avoid threading request parameters through all downstream function calls (services, db queries).
*   **Code responsible**: [src/middlewares/requestContext.ts](file:///home/sidharthg/sid/project/learningProjects/logging/src/middlewares/requestContext.ts) using `AsyncLocalStorage` defined in [src/context/requestContext.ts](file:///home/sidharthg/sid/project/learningProjects/logging/src/context/requestContext.ts).
*   **How it works**:
    ```typescript
    // src/context/requestContext.ts
    import { AsyncLocalStorage } from "node:async_hooks";
    export const requestContext = new AsyncLocalStorage<RequestContext>();

    // src/middlewares/requestContext.ts
    export function requestContextMiddleware(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      const context = {
        requestId: req.requestId,
        traceId: req.traceId,
      };
    
      // Wrap the remainder of the asynchronous execution chain in this context
      requestContext.run(context, () => {
        next();
      });
    }
    ```

---

### 3. Log-Trace Correlation
#### Why it is done & Why it is important
Log-to-trace correlation binds structured logs directly to telemetry spans. By outputting the `traceId` and `spanId` with every log message, indexing tools can link log lines with trace graphs, allowing developers to inspect exact application behavior at the moment a log was emitted.

#### Code responsible for this action
Pino uses a `mixin` function that merges additional properties into each log payload dynamically:
*   **Pino Logger Configuration**: [src/logger/index.ts](file:///home/sidharthg/sid/project/learningProjects/logging/src/logger/index.ts)
*   **OpenTelemetry Trace Reader**: [src/telemetry/tracing.ts](file:///home/sidharthg/sid/project/learningProjects/logging/src/telemetry/tracing.ts)

```typescript
// src/telemetry/tracing.ts
import { trace } from "@opentelemetry/api";

export function getTraceContext() {
  // Extract active tracing span from the current thread context
  const span = trace.getActiveSpan();
  if (!span) {
    return {};
  }
  const spanContext = span.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

// src/logger/index.ts
const options: pino.LoggerOptions = {
  // ... configuration options ...
  mixin() {
    const store = requestContext.getStore(); // Read request context
    const traceContext = getTraceContext();  // Read OpenTelemetry trace context

    return {
      requestId: store?.requestId,
      traceId: traceContext.traceId,
      spanId: traceContext.spanId,
    };
  },
};
```

#### Example Output:
If a trace is active during a logging call, the log will output:
```json
{
  "level": 30,
  "time": "2026-06-15T09:40:00.000Z",
  "service": "todo-api",
  "requestId": "2b9ba6d3-fe7a-4623-a5a4-5904d9a1cb3e",
  "traceId": "fa491388ba3c54189a1ba55fb7ab1fb4",
  "spanId": "44be3b333e94aef1",
  "msg": "Todo created"
}
```

---

### 4. Application to Collector Communication (Express ──► Grafana Alloy)
#### Why it is done & Why it is important
The application must export trace spans to an external aggregator. Directly connecting the application to a heavy storage engine (Tempo) degrades performance due to network overhead. Instead, spans are sent locally to an agent (Grafana Alloy) via OTLP/HTTP.

#### Code responsible for this action
*   **Application Side**: In [src/telemetry/index.ts](file:///home/sidharthg/sid/project/learningProjects/logging/src/telemetry/index.ts), the `OTLPTraceExporter` is initialized pointing to Alloy's local receiver port `4318`. A `BatchSpanProcessor` is used to send telemetry asynchronously in chunks.

```typescript
// src/telemetry/index.ts
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces", // Alloy HTTP listener endpoint
});

const sdk = new NodeSDK({
  spanProcessors: [
    new BatchSpanProcessor(traceExporter), // Batches traces asynchronously
  ],
  instrumentations: [
    getNodeAutoInstrumentations(),
  ],
});
```

*   **Alloy Side**: In [observability/alloy-config.alloy](file:///home/sidharthg/sid/project/learningProjects/logging/observability/alloy-config.alloy), the `otelcol.receiver.otlp` component is declared to listen for this HTTP payload.

```alloy
// observability/alloy-config.alloy
otelcol.receiver.otlp "default" {
  grpc {
    endpoint = "0.0.0.0:4317"
  }

  http {
    endpoint = "0.0.0.0:4318" // Listens for OTLP HTTP payloads here
  }

  output {
    // Routes all received traces to the Tempo exporter component input channel
    traces = [otelcol.exporter.otlp.tempo.input]
  }
}
```

---

### 5. Collector to Storage Communication (Grafana Alloy ──► Grafana Tempo)
#### Why it is done & Why it is important
Alloy serves as an intermediate pipeline. After receiving and buffering the spans, it must forward them to Tempo, which handles indexing, querying, and storage.

#### Code responsible for this action
*   **Alloy Side**: In [observability/alloy-config.alloy](file:///home/sidharthg/sid/project/learningProjects/logging/observability/alloy-config.alloy), the `otelcol.exporter.otlp` component specifies the target container endpoint `tempo:4317` over gRPC.

```alloy
// observability/alloy-config.alloy
otelcol.exporter.otlp "tempo" {
  client {
    endpoint = "tempo:4317" // Routes data to Tempo's internal gRPC OTLP port

    tls {
      insecure = true // Disables TLS verification for local networking
    }
  }
}
```

*   **Tempo Side**: In [observability/tempo.yaml](file:///home/sidharthg/sid/project/learningProjects/logging/observability/tempo.yaml), Tempo's distributor defines receivers to capture these gRPC packets.

```yaml
# observability/tempo.yaml
distributor:
  receivers:
    otlp:
      protocols:
        grpc:      # Enables listening on internal port 4317
        http:      # Enables listening on internal port 4318
```

---

### 6. Storage Persistence (Grafana Tempo ──► Local Disk)
#### Why it is done & Why it is important
Traces must be persisted so they are not lost when the application containers are stopped or updated. The storage configuration determines how trace files are structured on the host system.

#### Code responsible for this action
*   **Tempo Side (Storage Block)**: In [observability/tempo.yaml](file:///home/sidharthg/sid/project/learningProjects/logging/observability/tempo.yaml), the storage block configures a local filesystem backend.

```yaml
# observability/tempo.yaml
storage:
  trace:
    backend: local
    local:
      path: /tmp/tempo/traces # Directory inside the container where files are written
```

*   **Docker Compose Configuration**: In [observability/docker-compose.yml](file:///home/sidharthg/sid/project/learningProjects/logging/observability/docker-compose.yml), the container path must remain consistent with the mounted configurations.

```yaml
# observability/docker-compose.yml
  tempo:
    image: grafana/tempo:latest
    container_name: tempo
    command:
      - -config.file=/etc/tempo.yaml
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml # Mounts local config into container
    ports:
      - "3200:3200" # Exposes HTTP port for querying traces
```

---

## 🔄 Execution Lifecycle Example

Let's trace a call to `POST /todos` to see how these components interact:

1.  **Request Arrival**: A user sends `POST /todos` with body `{"title": "Buy groceries"}`.
2.  **Middlewares Execute**:
    *   `requestIdMiddleware` generates `requestId: "9a01-..."`.
    *   `requestContextMiddleware` stores it in `AsyncLocalStorage`.
3.  **Active Span Begins**: Inside [src/routes/todo.routes.ts](file:///home/sidharthg/sid/project/learningProjects/logging/src/routes/todo.routes.ts):
    ```typescript
    await tracer.startActiveSpan("create_todo", async (span) => { ... })
    ```
    This registers an active OpenTelemetry span.
4.  **Logging Event**:
    ```typescript
    logger.info({ resource: { type: "todo" } }, "Todo created");
    ```
    The Pino logger executes, runs `mixin()`, fetches `"9a01-..."` from `AsyncLocalStorage`, grabs `traceId` and `spanId` from the active OpenTelemetry span, and writes the JSON line to stdout.
5.  **Span Finishes**: The router code runs `span.end()` inside a `finally` block, finalizing the span record.
6.  **Telemetry Batch Export**: The `BatchSpanProcessor` inside the OpenTelemetry SDK background loop triggers an HTTP request containing the completed `create_todo` span to `http://localhost:4318/v1/traces`.
7.  **Alloy Pipeline Processing**: Grafana Alloy's OTLP receiver (port `4318`) processes the span, forwards it to the `tempo` OTLP exporter, which sends it to `tempo:4317` over gRPC.
8.  **Tempo Disk Write**: Tempo's distributor validates the incoming span and pushes it into the storage pipeline, writing the serialized trace blocks to `/tmp/tempo/traces` inside the container storage backend.
