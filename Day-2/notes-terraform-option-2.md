# Terraform option 2 and the Day 2 labs

These notes apply when BharatMart is deployed with **`BharatMart-App/deployment/terraform/option-2`** (load balancer, frontend VMs, backend instance pool). The Day 2 exercises under this folder (`05` through `09`) were written for a generic single VM name; option 2 uses different names and a few different defaults.

## Load balancer and backends

The stack creates an instance pool for the API. Check **`backend_pool_initial_size`** in `terraform.tfvars`; a size of 2 or more is enough to show failover when one backend is stopped.

The load balancer health check for the API listener uses **`backend_lb_health_check_path`**. The default is **`/`** so the probe does not call the database. Some lab text refers to **`/api/health`**; that path is stricter (Supabase must work). You can switch the variable to `/api/health` if you need the wording to match exactly.

Outputs from Terraform still include a URL with **`/api/health`** for manual checks in a browser or with curl.

## systemd unit

API processes on option 2 VMs use the unit **`bharatmart-backend`**. Older single-VM instructions sometimes say `bharatmart-api`.

## Metrics and OCI

The app serves Prometheus text at **`http://<host>:3000/metrics`**. Metric names include **`http_request_duration_seconds`** and **`http_requests_total`**. **OCI Monitoring does not scrape that URL** — those series do **not** appear in Metric Explorer unless you add ingestion (for example **Management Agent** with a custom plugin, **API** `PostMetricData`, or another pipeline). **Day 2 labs** use only built-in namespaces such as **`oci_computeagent`** (compute) and **`oci_loadbalancer`** (load balancer), which need no extra setup.

From a laptop, the API is usually reached as **`http://<load_balancer_public_ip>:3000`**. After SSH into a VM, **`http://127.0.0.1:3000`** is fine.

## Chaos settings

Chaos is controlled from **`terraform.tfvars`** (and the generated `.env` on the servers): **`chaos_enabled`**, **`chaos_error_rate`**, **`chaos_latency_ms`**. Health routes **`/`** and **`/api/health*`** are not subject to the chaos middleware, which keeps load balancer probes sensible when the probe path is **`/`**.

## Alarms and dashboards

Terraform here does not create alarms, notification topics, or dashboards. Those steps are done in the OCI Console as described in **`06-setup-oci-monitoring-lab.md`**, **`08-implement-alerting-workflows-lab.md`**, and **`09-dashboards-visualization-lab.md`**.
