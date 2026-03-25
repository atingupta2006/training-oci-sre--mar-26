# Day 2: Set up OCI Monitoring (Metrics Explorer) — Hands-on Lab

**Outcome:** Confirm compute metrics in OCI and open **Metric Explorer** on `oci_computeagent`.

**Prerequisites:** OCI Console access; BharatMart running; know your **compartment** name.

> **Multi-tier (Terraform option 2):** Stack **Outputs** give `load_balancer_public_ip`. Use **`API=http://<LB_IP>:3000`** from your laptop instead of `localhost`. Instance names are like **`bharatmart-fe-1`**. Details: `BharatMart-App/deployment/terraform/option-2/DAY-2-LABS.md`.

---

## Before you start — pick your API base URL

| Where you run `curl` | Set `API` to |
|----------------------|----------------|
| Laptop, app behind load balancer | `http://<load_balancer_public_ip>:3000` |
| SSH session **on** a frontend or backend VM | `http://127.0.0.1:3000` |

Example (bash):

```bash
export API="http://<YOUR_LB_IP>:3000"   # or http://127.0.0.1:3000 on the VM
curl -sS "${API}/api/system/info" | jq '.features'
```

Install **`jq`** if missing, or drop `| jq '...'` and read JSON in the browser: `${API}/api/system/info`.

---

## Task 0 — System API (sanity check)

**Goal:** Prove the API responds before using the Console.

1. **Full payload:** `curl -sS "${API}/api/system/info" | jq '.'`
2. **Deployment:** `curl -sS "${API}/api/system/info" | jq '.deployment'`
3. **Health block:** `curl -sS "${API}/api/system/info" | jq '.services'`
4. **Flags (metrics, chaos, tracing):** `curl -sS "${API}/api/system/info" | jq '.features'`

**Optional — Prometheus scrape (from laptop or VM):** `curl -sS "${API}/metrics" | head`

App metric names on `/metrics` include **`http_request_duration_seconds`**, **`http_requests_total`**. They appear in **OCI** only after you **ingest** custom metrics; this lab uses **default** `oci_computeagent` metrics only.

---

## Task 1 — Confirm metrics on a compute instance

**Goal:** See CPU (or network/disk) charts for the VM you care about.

1. Menu **☰ → Compute → Instances**.
2. **Compartment:** select your training compartment (top bar).
3. Open one instance (e.g. **`bharatmart-fe-1`** or a backend from your deployment).
4. Left sidebar → **Metrics** (under **Resources**).
5. Open **CPU Utilization** (or **Networking** / **Disk**).

**Pass:** A chart shows points from the last minutes (not permanently empty). If **No data:** wait 2–5 minutes; confirm instance **Running**; confirm compartment.

---

## Task 2 — Metric Explorer (`oci_computeagent`)

**Goal:** List metric names for one instance.

1. **☰ → Observability & Management → Monitoring → Metric Explorer**.
2. **Compartment:** same as the instance.
3. **Metric namespace:** `oci_computeagent`.
4. **Metric name:** pick e.g. `CpuUtilization` (dropdown lists available names).
5. **Resource:** choose **your instance** (resource type **Compute Instance**).
6. **Interval:** e.g. **1 minute**. Click **Update chart**.

**Pass:** A line chart appears. Try **`NetworkBytesIn`** / **`DiskBytesRead`** with the same resource.

**Student table (optional):**

| Metric name | Your note |
|-------------|-----------|
| CpuUtilization | |
| NetworkBytesIn | |

---

## Concepts (short)

- **Namespace** = group of metrics (`oci_computeagent` = VM agent metrics).
- **Default metrics** = collected by OCI without app changes. **Custom** app metrics need ingestion into OCI (out of scope for this intro lab).

---

## Instructor quick check

- Task 1: Instance **Metrics** tab shows at least one series.
- Task 2: **Metric Explorer** chart updates when changing metric name / interval.
