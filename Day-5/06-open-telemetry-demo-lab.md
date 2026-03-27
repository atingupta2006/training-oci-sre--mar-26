# Day 5 — OpenTelemetry (BharatMart API)

### What this is for

Students see how **distributed traces** are recorded: each HTTP request becomes a **trace** made of **spans**, with names, timing, and attributes. Spans are written to a **log file** on the Linux host (one JSON object per line) so you can open or tail the file during the session.

### What you need

* BharatMart API running on Linux (`SRE_Repeat_Training/BharatMart-App`).
* A path where the app user can create or append a file (for example under `/var/log/...` or `logs/` under the app directory).

### Enable tracing

In `.env` next to `package.json`, set:

```env
OTEL_TRACES_LOG_FILE=/path/to/otel-spans.jsonl
```

Optional:

```env
OTEL_SERVICE_NAME=bharatmart-backend
```

If `OTEL_TRACES_LOG_FILE` is not set, tracing stays off.

Restart the API after changing `.env`.

On startup the process should log one line such as:  
`OpenTelemetry: spans -> /path/to/otel-spans.jsonl (bharatmart-backend)`.

### Run the demo

1. Start the API: `npm run dev:server` (or your production start command).
2. Generate traffic, for example:  
   `curl -s http://localhost:3000/api/health`
3. Tail the span file:  
   `tail -f /path/to/otel-spans.jsonl`

Each line is one span. You should see HTTP spans for incoming requests and a span named `health.products_probe` from the health route (manual instrumentation).

### What to explain

* A **span** is one step with a start time, duration, and optional **attributes** (for example database response time on the health check).
* **Trace** and **span** IDs tie related spans together when you read the file.
* `GET /metrics` on the same server is separate: that is Prometheus-style metrics; this file is **trace** data.

### Code

* `server/tracing.ts` — turns tracing on when `OTEL_TRACES_LOG_FILE` is set.
* `server/otelFileSpanExporter.ts` — writes NDJSON to that path.
* `server/routes/health.ts` — example of a custom span.

### If nothing appears in the file

Confirm the path is writable, the variable is set before the process starts, and you are hitting the API (not only the Vite dev server for the browser).

### Terraform option 2 (OCI deploy)

In `BharatMart-App/deployment/terraform/option-2/terraform.tfvars`:

* **`otel_tracing_enabled`** — `true` injects `OTEL_SERVICE_NAME` and `OTEL_TRACES_LOG_FILE` into the backend `.env` on each VM (default file path under the app: `.../logs/otel-spans.jsonl` when `otel_traces_log_file` is left empty).
* **`enable_api_events_db`** — `true` sets `ENABLE_API_EVENTS_DB=true` so the middleware inserts request rows into Supabase **`api_events`**. The table and policies must exist; otherwise you will see failing outbound `POST` spans to `/rest/v1/api_events`. Set **`false`** in tfvars only if you are not using that table yet.

After apply, restart or rely on your userdata/systemd flow so the generated `.env` is loaded. Full detail: `../BharatMart-App/docs/open-telemetry-demo.md`.

---

## End of lab document
