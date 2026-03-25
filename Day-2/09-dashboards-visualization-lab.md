# Day 2: Dashboards — Hands-on Lab

**Outcome:** One **dashboard** with at least **CPU** + **alarm** widgets. Application latency widgets are **optional** if custom metrics are not ingested.

**Prerequisites:** Alarm from **08** (e.g. `<student-id>-cpu-alarm`). Compartment known.

> **Terraform option 2:** Use real instance + load balancer **OCIDs/names** from your stack. **`custom.bharatmart`** panels need ingestion — if empty, build the dashboard from **§A only**. See `BharatMart-App/deployment/terraform/option-2/DAY-2-LABS.md`.

---

## Create empty dashboard

1. **☰ → Observability & Management → Dashboards**
2. **Create dashboard**
3. **Name:** `<student-id>-sre-dashboard`
4. **Compartment:** training compartment
5. **Create** → you see an empty canvas.

---

## A. Infrastructure widgets (always available)

Repeat **Add widget → Chart** (or **Metric chart**) for each row.

### CPU

1. **Add widget → Chart**
2. **Metric namespace:** `oci_computeagent`
3. **Metric name:** `CpuUtilization`
4. **Resource:** your instance
5. **Interval:** 1 minute
6. **Widget title:** `CPU`
7. **Save** / **Apply**

### Network (optional second panel)

Same steps; **Metric name:** `NetworkBytesIn` or `NetworkBytesOut`.

### Load balancer (optional)

1. Namespace **`oci_loadbalancer`**
2. Pick a metric offered for **your** load balancer (e.g. healthy hosts / throughput — names vary).
3. Resource = **your load balancer**.

---

## B. Application metrics (only if `custom.bharatmart` has data)

If **Metric Explorer** shows **`custom.bharatmart`** with series:

1. **Add widget → Chart**
2. **Namespace:** `custom.bharatmart`
3. **Metric:** `http_request_duration_seconds` or `http_requests_total`
4. Add **dimensions** / filters in the UI if prompted (e.g. status).
5. Title: `API latency` / `Request volume`

If the namespace is missing, **skip B** — rely on **§A** + **§C**.

---

## C. Alarm widget

1. **Add widget → Alarm** (or **Alarm status**)
2. Select **`<student-id>-cpu-alarm`**
3. Display: **Summary** or **Detailed**
4. **Add**

**Pass:** Widget shows **OK** or **Firing**.

---

## Save

**Save dashboard** (top right). Reopen **Dashboards** → your dashboard → charts should load within a minute.

---

## Instructor quick check

| Widget | Source |
|--------|--------|
| CPU | `oci_computeagent` / instance |
| Alarm | Linked to existing alarm |
| App charts | Only if custom metrics ingested |
