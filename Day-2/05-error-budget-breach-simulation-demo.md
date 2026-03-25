# Day 2: Error budget + LB failover — Instructor demonstration

**Audience:** Students watch; instructor drives the Console and one SSH session.

**Assumptions:** BharatMart behind an **OCI load balancer** with **≥ 2 backends** (or single backend to show **unhealthy** state). Alarms from **08** optional but useful.

> **Terraform option 2:** Backend service: **`bharatmart-backend`**. LB probe path may be **`/`** (default) or **`/api/health`** — see `deployment/terraform/option-2/DAY-2-LABS.md`. Manual check: **`http://<LB_IP>:3000/api/health`**.

---

## 1. Baseline (2–3 min)

1. **Browser:** open app **`http://<LB_IP>/`** (or your URL). Confirm it loads.
2. **Console:** **Networking → Load balancers →** your LB → **Backend sets**
   - Note **healthy** count for **backend API** set (port **3000**).
3. **Optional — Metric Explorer:** **☰ → Monitoring → Metric Explorer**
   - Namespace **`oci_loadbalancer`** (or your LB metrics) — confirm **healthy backend** count if available.

---

## 2. Simulate backend failure

**Goal:** One member **unhealthy**; traffic still works if another backend exists.

1. **SSH** to **one** backend (private IP; jump via frontend per your runbook).
2. Stop API:
   ```bash
   sudo systemctl stop bharatmart-backend
   ```
3. **Console:** Backend set → that member becomes **unhealthy** after probe intervals (~ seconds to a minute).
4. **Browser / curl:** `curl -sS -o /dev/null -w "%{http_code}\n" "http://<LB_IP>:3000/api/health"` — may still **200** if another backend is healthy.

**Recover (before next step):**
```bash
sudo systemctl start bharatmart-backend
```
Wait until the member is **healthy** again.

---

## 3. Inject HTTP errors (chaos)

**Goal:** Elevated **5xx** on API routes; **LB probe** stays healthy if probe path is **`/`** (chaos skips `/` and `/api/health*` in app).

1. On **each backend** (or via redeploy), set in **`$APP/.env`** next to `package.json`:
   ```bash
   CHAOS_ENABLED=true
   CHAOS_ERROR_RATE=0.1
   ```
   Then: `sudo systemctl restart bharatmart-backend`

   *(Or set `chaos_enabled` / `chaos_error_rate` in Terraform `terraform.tfvars` and re-apply so cloud-init regenerates `.env` — slower.)*

2. **Generate traffic** hitting non-health routes, e.g.:
   ```bash
   for i in $(seq 1 50); do curl -sS -o /dev/null -w "%{http_code}\n" "http://<LB_IP>:3000/api/products"; done
   ```
   Expect mix of **200** and **500**.

3. **Observe errors:** If you use **Prometheus/Grafana** scraping **`/metrics`**, query e.g. **`http_requests_total`** by **status_code**. **OCI Metric Explorer** shows **5xx** only if those metrics are **ingested** as custom metrics.

**Stop chaos:** set `CHAOS_ERROR_RATE=0` (and optionally `CHAOS_ENABLED=false`), restart service.

---

## 4. Alarms & mitigation (talk-track)

1. **Monitoring → Alarms:** show **OK** / **Firing** if CPU or custom alarms exist.
2. Explain: stopping service → LB drains member; chaos → **error budget** / SLO burn without necessarily failing **probe path** **`/`**.

---

## 5. Error budget math (whiteboard)

Example only:

```
Errors in window: 500
Budget (example): 10,000 allowed errors / month
Consumed: 500 / 10,000 = 5%
```

Tie to your org’s real budget policy if you have one.

---

## 6. Student takeaway

- LB **health checks** vs **application errors** can differ by **path** and **chaos** settings.
- **Failover** needs **>1 healthy backend** in the set.
- **`bharatmart-backend`** is the systemd unit name for Terraform option **2**.
