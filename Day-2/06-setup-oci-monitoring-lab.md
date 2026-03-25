# Day 2: Set up OCI Monitoring (Metrics Explorer) — Hands-on Lab

Prerequisites: OCI Console access; BharatMart running; you know which **compartment** to use.

> Multi-tier Terraform (option 2): use the load balancer IP from stack outputs as **`API=http://<LB_IP>:3000`** when you run curl from your laptop; on the VM itself, `http://127.0.0.1:3000` is fine. Instance names often look like `bharatmart-fe-1`. See **`notes-terraform-option-2.md`** in this folder.

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

Check that the API answers before you work only in the Console.

1. **Full payload:** `curl -sS "${API}/api/system/info" | jq '.'`
2. **Deployment:** `curl -sS "${API}/api/system/info" | jq '.deployment'`
3. **Health block:** `curl -sS "${API}/api/system/info" | jq '.services'`
4. **Flags (metrics, chaos):** `curl -sS "${API}/api/system/info" | jq '.features'`

**Optional — Prometheus scrape (from laptop or VM):** `curl -sS "${API}/metrics" | head`

App metric names on `/metrics` include **`http_request_duration_seconds`**, **`http_requests_total`**. They appear in **OCI** only after you **ingest** custom metrics; this lab uses **default** `oci_computeagent` metrics only.

---

## Task 1 — Confirm metrics on a compute instance

You should see CPU (or network/disk) charts for the instance you open.

1. Menu **☰ → Compute → Instances**.
2. **Compartment:** select your training compartment (top bar).
3. Open one instance (e.g. **`bharatmart-fe-1`** or a backend from your deployment).
4. Left sidebar → **Metrics** (under **Resources**).
5. Open **CPU Utilization** (or **Networking** / **Disk**).

You should see recent points on the chart. If it stays empty, wait a few minutes, check the instance is **Running**, and that the compartment is correct.

---

## Task 2 — Metric Explorer (`oci_computeagent`)

Explore metric names for one instance.

1. **☰ → Observability & Management → Monitoring → Metric Explorer**.
2. **Compartment:** same as the instance.
3. **Metric namespace:** `oci_computeagent`.
4. **Metric name:** pick e.g. `CpuUtilization` (dropdown lists available names).
5. **Resource:** choose **your instance** (resource type **Compute Instance**).
6. **Interval:** e.g. **1 minute**. Click **Update chart**.

A line chart should appear. Repeat with **`NetworkBytesIn`** or **`DiskBytesRead`** on the same instance if you want more practice.

**Student table (optional):**

| Metric name | Your note |
|-------------|-----------|
| CpuUtilization | |
| NetworkBytesIn | |

---

## Concepts (short)

- A **namespace** groups metrics (`oci_computeagent` is the usual one for VM agent data).
- **Default** metrics come from OCI without changing the app. **Custom** application metrics need a separate ingestion step into OCI; this lab sticks to defaults.

---

## For instructors

- Task 1: the instance **Metrics** tab should show at least one series with data.
- Task 2: changing metric name or interval in **Metric Explorer** should refresh the chart.
