# Day 2: Dashboards — Hands-on Lab

Build a dashboard with at least CPU and alarm widgets. Latency widgets from application metrics are optional when custom metrics are not in OCI yet.

Prerequisites: alarm from lab **08** (for example `<student-id>-cpu-alarm`); compartment selected.

> Terraform option 2: use instance and load balancer names from your stack outputs. If `custom.bharatmart` has no data, use sections A and C only. See **`notes-terraform-option-2.md`** in this folder.

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

The widget should show **OK** or **Firing** for that alarm.

---

## Save

**Save dashboard** (top right). Reopen **Dashboards** → your dashboard → charts should load within a minute.

---

## For instructors

| Widget | Source |
|--------|--------|
| CPU | `oci_computeagent` / instance |
| Alarm | Linked to existing alarm |
| App charts | Only if custom metrics are ingested |
