# OpenTelemetry (BharatMart API)

Tracing is enabled when **`OTEL_TRACES_LOG_FILE`** is set in `.env`. Finished spans are appended as **NDJSON** (one JSON object per line) to that path.

Optional **`OTEL_SERVICE_NAME`** sets the service name on the resource (default `bharatmart-backend`).

If the variable is unset, the SDK does not start and a short message is printed at startup.

### Implementation

* `server/tracing.ts` — loads `FileSpanExporter` and auto-instrumentation (filesystem instrumentation is off to reduce noise).
* `server/otelFileSpanExporter.ts` — serializes each span to a line with fields such as `traceId`, `spanId`, `name`, `durationMs`, `attributes`, `status`, `serviceName`.

### Example

```bash
# .env
OTEL_TRACES_LOG_FILE=/var/log/bharatmart/otel-spans.jsonl
```

```bash
curl -s http://localhost:3000/api/health
tail -n 5 /var/log/bharatmart/otel-spans.jsonl
```

The `logs/` directory is gitignored if you use a path like `logs/otel-spans.jsonl` under the project.
