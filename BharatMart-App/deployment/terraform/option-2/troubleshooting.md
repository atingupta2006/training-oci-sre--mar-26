# Option 2 — Troubleshooting

**Goal:** see whether the problem is **LB**, **frontend VM**, or **backend VM**, then run the matching commands.

**App on the VM:** clone root is `/opt/bharatmart`. Code + `.env` live in **`$APP`** = `/opt/bharatmart` (flat repo) or `/opt/bharatmart/BharatMart-App` (training repo with `app_source_subpath`).

---

## Outputs you need

| Output | Use |
|--------|-----|
| `load_balancer_public_ip` | Browser / `curl` tests |
| `frontend_public_ips` | SSH to frontend |
| `backend_instance_ids` | Backend private IP: **Compute →** instance → **VNICs**, or `oci compute instance get --instance-id <OCID> --query 'data."private-ip"' --raw-output` |
| `bharatmart_summary` | All-in-one (LB URL, IPs, ids) if your stack exposes it |

---

## 1. From your laptop — is the stack up?

```bash
export LB_IP=<load_balancer_public_ip>
curl -sS -o /dev/null -w "fe %{http_code}\n"  "http://${LB_IP}/"
curl -sS -o /dev/null -w "be %{http_code}\n"  "http://${LB_IP}:3000/api/health"
```

| Result | Next step |
|--------|-----------|
| **502** | Fix VMs first (§3–4), then LB backend health |
| **Timeout / refused** | Security lists, routing, instance state |
| **200 on both** | No VM issue; if browser still fails, check URL / cache |

---

## 2. SSH: laptop → frontend → backend

Private key in Terraform = **`KEY`**. **`scp` runs on the laptop only.** On the frontend, SSH **directly** to the backend — no `-J`.

**Laptop**

```bash
export KEY=~/.ssh/bharatmart_terraform_ed25519
export FE=<frontend_public_ip>
scp -i "$KEY" "$KEY" "opc@${FE}:~/.ssh/"
ssh -i "$KEY" "opc@${FE}" 'chmod 400 ~/.ssh/bharatmart_terraform_ed25519'
ssh -i "$KEY" "opc@${FE}"
```

**Frontend → backend** (`BE` = private IP from Outputs table above)

```bash
export BE=<BACKEND_PRIVATE_IP>
ssh -i ~/.ssh/bharatmart_terraform_ed25519 "opc@${BE}"
```

**Optional — one command from laptop** (no key copy to frontend):  
`ssh -i "$KEY" -J "opc@${FE}" "opc@${BE}"`

---

## 3. Frontend VM — diagnose

```bash
sudo cloud-init status --long
tail -f /var/log/cloud-init-output.log
sudo grep -iE 'npm install failed|Failed to clone|Nginx failed|Frontend deployment' /var/log/cloud-init-output.log | tail -20
sudo systemctl is-active nginx
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1/
sudo tail -20 /var/log/nginx/error.log
```

**Repair** (as `opc`, set `APP` to your app root):

```bash
APP=/opt/bharatmart/BharatMart-App   # or /opt/bharatmart
cd "$APP" && npm install && npm run build:client
sudo rm -rf /usr/share/nginx/html/* && sudo cp -r dist/* /usr/share/nginx/html/
sudo chown -R nginx:nginx /usr/share/nginx/html/ && sudo nginx -t && sudo systemctl restart nginx
```

---

## 4. Backend VM — diagnose

```bash
sudo cloud-init status --long
sudo grep -iE 'npm install failed|build:server|bharatmart-backend' /var/log/cloud-init-output.log | tail -20
sudo systemctl status bharatmart-backend --no-pager
sudo journalctl -u bharatmart-backend -n 50 --no-pager
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/health
```

**Repair:**

```bash
APP=/opt/bharatmart/BharatMart-App   # or /opt/bharatmart
cd "$APP" && sudo -u opc npm install && sudo -u opc npm run build:server
sudo chown -R opc:opc /opt/bharatmart && sudo systemctl restart bharatmart-backend
```

---

## 5. Load balancer health

| Backend set | Port | Health path |
|-------------|------|-------------|
| Frontend | 80 | `/` |
| API | 3000 | **`/`** by default (`backend_lb_health_check_path` in `terraform.tfvars`). Use `/api/health` only if you set that variable (then Supabase must be up or backends go unhealthy). |

Fix the VM (§3–4), then confirm **Networking → Load balancers →** your LB → **Backend sets** show healthy.

---

## 6. Symptom → where to look

| Symptom | Where |
|---------|--------|
| 502 from LB | §5, then §3–4 |
| OK on VM, bad via LB | LB backend registration / health |
| `cloud-init` / `npm` errors | §3 or §4 logs |
| Permission errors | Run **`npm`** as **`opc`**, not root |
| Random **500** on API routes (not on `/` or `/api/health*`) | **Chaos:** set `chaos_error_rate = 0` or `chaos_enabled = false` in `terraform.tfvars`, apply, and replace `.env` / reprovision (see §7) |

More copy-paste commands: `commands.sh` in this folder.

---

## 7. Chaos (expected behaviour)

**Chaos** (`CHAOS_ENABLED`, `CHAOS_ERROR_RATE`, `CHAOS_LATENCY_MS` in `.env`): when enabled with `chaos_error_rate > 0`, a fraction of requests to normal API routes return **500** on purpose. **`/`** and **`/api/health*`** are excluded so load balancer probes stay healthy. For a stable demo, use `chaos_error_rate = 0` (and optionally `chaos_enabled = false` or `chaos_latency_ms = 0`).
