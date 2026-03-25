# Day 3: Logging metrics → OCI Monitoring → Dashboard — Hands-on Lab

**Prerequisites:** Log group and application log exist (**lab 05**). Logs flowing to OCI. Compartment access.

> **Terraform option 2:** See **`notes-terraform-option-2.md`** (LB URL, log path, **`path`** in JSON logs). Use namespace **`oci_logging`** for log-derived metrics in Metric Explorer.

---

## Objective

1. Build **log queries** in OCI Logging.
2. Save a query as a **logging metric** (namespace **`oci_logging`**).
3. Confirm the metric in **Metric Explorer**.
4. Add a **dashboard widget** for that metric.

---

## Background

**Logging-based metrics** turn matching log lines into a **numeric time series** (e.g. errors per minute). You need enough log volume; if a query returns no lines, the metric stays flat.

Structured BharatMart API logs include fields such as **`level`**, **`path`**, **`status_code`** (see **`server/middleware/logger.ts`**). Use **`path`**, not `route`.

---

## Task 1 — Log queries

1. **☰ → Observability & Management → Logging → Log Groups**
2. Open **`<student-id>-log-group`** → open **`<student-id>-bharatmart-api-log`**
3. **Search** and run queries; adjust if your fields differ:

| Purpose | Example query |
|--------|-----------------|
| Order route errors | `level = 'error' and path = '/api/orders'` |
| Any application errors | `level = 'error'` |
| HTTP 5xx | `status_code >= 500` |

4. Confirm you see matching lines when the API is exercised (`curl` via **`http://<LB_IP>:3000`** or from a backend VM on **`127.0.0.1:3000`**).

**Pass:** Queries return results when traffic exists.

---

## Task 2 — Create a metric from a query

1. With a working query open, use **Save as metric** / **Create metric** (wording varies by UI).
2. Suggested settings:

| Field | Example |
|-------|---------|
| Metric name | `<student-id>-order-errors` |
| Namespace | **`oci_logging`** |
| Unit | `count` |
| Interval | `1m` |
| Query | same as Task 1 (e.g. `level = 'error' and path = '/api/orders'`) |

3. Save. Wait **2–3 minutes** for data.

**Pass:** Console confirms the metric; no separate custom namespace is required for this lab.

---

## Task 3 — Metric Explorer

1. **☰ → Observability & Management → Monitoring → Metric Explorer**
2. Namespace **`oci_logging`**
3. Select your metric **`<student-id>-order-errors`**
4. Set a time range (e.g. last hour) and refresh.

To generate errors for testing (optional): request a missing route, e.g. `curl -sS -o /dev/null -w "%{http_code}\n" "http://<LB_IP>:3000/api/does-not-exist"` — expect **404**; for **5xx**, your environment would need real error paths or a controlled demo (see **`notes-terraform-option-2.md`** re: chaos).

**Pass:** Chart shows points when matching logs exist.

---

## Task 4 — Dashboard widget

1. **☰ → Observability & Management → Dashboards**
2. Open **`<student-id>-sre-dashboard`** (from Day 2) or create **`<student-id>-logging-metrics-dashboard`**
3. **Add widget → Metric chart**
4. Namespace **`oci_logging`**, metric **`<student-id>-order-errors`**, statistic **Sum** or **Count**, interval **1 minute**
5. Title e.g. `Order errors (from logs)` → Save dashboard.

**Pass:** Widget loads and updates.

---

## Instructor quick check

| Check | Expected |
|-------|----------|
| Queries | Use **`path`**, valid JSON fields |
| Metric | Namespace **`oci_logging`**, 1m interval |
| Explorer | Metric listed under **`oci_logging`** |
| Dashboard | Widget bound to same metric |

## Next steps (optional)

- Alarm on the log-derived metric (threshold + notification topic).
- Add widgets for other saved queries (errors, 5xx count).
