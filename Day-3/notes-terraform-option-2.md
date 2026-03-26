# Terraform option 2 and the Day 3 labs

Use this when BharatMart is deployed with **`BharatMart-App/deployment/terraform/option-2`** (public load balancer, frontend VM(s), backend instance pool).

## URLs and SSH

| Goal | Value |
|------|--------|
| **Load balancer IP** | Terraform output **`load_balancer_public_ip`** |
| **API from your laptop** | `http://<LB_IP>:3000` |
| **API on a VM** | `http://127.0.0.1:3000` |
| **Frontend in browser** | `http://<LB_IP>/` |

SSH: backend instances have **no public IP**. Typical path: SSH to a **frontend** public IP (see **`BharatMart-App/deployment/terraform/option-2/troubleshooting.md`**), then SSH to a backend **private** IP, or use `ssh -J`. Instance names often look like **`bharatmart-fe-1`**.

## App directory and log file

Clone root is **`/opt/bharatmart`**. With **`app_source_subpath = "BharatMart-App"`** (training repo), the app root is:

**`/opt/bharatmart/BharatMart-App`**

Default **`LOG_FILE`** is **`./logs/api.log`** relative to that directory, so the **absolute path** on the VM is:

**`/opt/bharatmart/BharatMart-App/logs/api.log`**

Confirm on the VM: `grep LOG_FILE /opt/bharatmart/BharatMart-App/.env` or check **`server/config/logger.ts`**.

## Log queries

Structured logs use fields such as **`path`**, **`status_code`**, **`level`**, **`method`** (see **`server/middleware/logger.ts`**). Prefer **`path`** in queries, not **`route`**.

## OCI Logging metrics

Logging-based custom metrics appear under the **`oci_logging`** namespace in Metric Explorer. **Do not rely on a separate `custom.*` namespace** unless you create it yourself.

## Generating traffic / errors

- **Traffic:** `curl` the API via **`http://<LB_IP>:3000/...`** or hit the UI at **`http://<LB_IP>/`**.
- **Chaos (optional):** if enabled in **`terraform.tfvars`**, some API routes may return **500**; health routes **`/`** and **`/api/health*`** are excluded. For stable demos, set **`chaos_error_rate = 0`**.

## Custom application logs (UMA)

Shipping **`api.log`** to OCI Logging uses **Logging → Agent configurations** (dynamic group + file path + destination log), **IAM** for the **dynamic group**, plugins as needed, and **`sudo systemctl restart unified-monitoring-agent`** on the instance. You normally **do not** edit agent JSON on the VM. See **lab 05**, **`Day-3/policies.txt`**, and **`../Day-4/enable-logs-via-agent.md`** if ingestion does not appear.

## Related

- **`BharatMart-App/deployment/terraform/option-2/troubleshooting.md`** — SSH and repair commands.
- **`Day-2/notes-terraform-option-2.md`** — metrics in OCI vs Prometheus on **`/metrics`**.
