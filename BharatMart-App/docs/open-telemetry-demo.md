# OpenTelemetry (BharatMart API)

Tracing is enabled when **`OTEL_TRACES_LOG_FILE`** is set in `.env`. Finished spans are appended as **NDJSON** (one JSON object per line) to that path.

Optional **`OTEL_SERVICE_NAME`** sets the service name on the resource (default `bharatmart-backend`).

If the variable is unset, the SDK does not start and a short message is printed at startup.

### Implementation

* `server/tracing.ts` — loads `FileSpanExporter` and auto-instrumentation (filesystem instrumentation is off to reduce noise).
* `server/otelFileSpanExporter.ts` — serializes each span to a line with fields such as `traceId`, `spanId`, `name`, `durationMs`, `attributes`, `status`, `serviceName`.
* `server/lib/traceContext.ts` — adds **`trace_id`** and **`span_id`** to structured `api.log` lines when a span is active, so you can `grep` the same id in both files.

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

---

## Reading `otel-spans.jsonl`

**`traceId`** — All spans with the same value belong to one logical operation (for example one incoming HTTP request and everything it triggered).

**`parentSpanId`** — Links a span to its parent. The root span has no parent in this export (or it appears as a separate line with a parent outside this snippet).

**`name`** — What the span represents: `GET` / `POST` for HTTP, `dns.lookup`, `tcp.connect`, `tls.connect` for the network stack, `health.products_probe` for manual app spans.

**`kind`** — `1` = server, `2` = client, `0` = internal (values follow OpenTelemetry `SpanKind`).

**`durationMs`** — Time spent in that span.

**`status.code`** — `0` = OK, `1` = unset, **`2` = ERROR**. An HTTP span can still show an application-level failure (for example `http.response.status_code` 404) with error status.

**`attributes`** — Key details: URLs, status codes, peer addresses, TLS info, etc.

A normal request to the API often shows: **server span for the route** → **child client spans** to Supabase (DNS, TCP, TLS, POST). If you see **`POST`** to `/rest/v1/api_events` with **404**, that is the app trying to insert a row into **`api_events`**; that table or policy must exist in Supabase, or those spans will keep reporting errors.

---

## Relating spans to `api.log` and to metrics

**Logs** — JSON lines in `logs/api.log` now include **`trace_id`** and **`span_id`** when OpenTelemetry is running, for the same request as the HTTP server span. Example:

```bash
grep "41aaee7e5e2546be051e8435ea171f62" logs/api.log
grep "41aaee7e5e2546be051e8435ea171f62" logs/otel-spans.jsonl
```

**Metrics** — `/metrics` (Prometheus) shows counters and histograms aggregated over time. They do not automatically include `traceId` unless you add **exemplars** (advanced). Use traces for a single slow request; use metrics for rates and percentiles over many requests.

---

## Optional knobs

| Setting | Purpose |
|--------|---------|
| `LOG_VERBOSE_REQUESTS=true` | Prints short per-request lines to stdout (middleware). Default off. |
| `ENABLE_API_EVENTS_DB=false` | Stops inserting into `api_events` on each request. Use when the table is missing so outbound Supabase POST spans do not clutter traces. |
| Process signals | On `SIGTERM` / `SIGINT`, the OpenTelemetry SDK **shuts down** so batched spans are flushed to the NDJSON file (systemd restarts, deploys). |
