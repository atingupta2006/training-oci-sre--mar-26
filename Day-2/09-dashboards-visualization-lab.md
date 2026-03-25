# Day 2: Dashboards — Hands-on Lab

Build a dashboard with CPU (and optional network or load balancer) charts plus an alarm widget.

Prerequisites: alarm from lab **08** (for example `<student-id>-cpu-alarm`); compartment selected.

> Terraform option 2: use instance and load balancer names from your stack outputs. See **`notes-terraform-option-2.md`** in this folder.

---

## Create empty dashboard

1. **☰ → Observability & Management → Dashboards**
2. **Create dashboard**
3. **Name:** `<student-id>-sre-dashboard`
4. **Compartment:** training compartment
5. **Create** → you see an empty canvas.

---

## A. Infrastructure widgets (OCI Metric Explorer)

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

Application-level metrics (e.g. `http_request_duration_seconds`) are exposed as **Prometheus** text at **`http://<LB_IP>:3000/metrics`** on the API. They do **not** appear in OCI dashboards unless you implement **custom metric ingestion** (outside the scope of this course). Use **§A** charts for OCI-native visibility.

---

## B. Alarm widget

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
| LB (optional) | `oci_loadbalancer` / your LB |
| Alarm | Linked to existing alarm |
