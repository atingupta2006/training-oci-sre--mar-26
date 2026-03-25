# Option 2 — Troubleshooting

Flow: **stack outputs → load balancer checks → SSH frontend → SSH backend**. The repo is cloned to **`/opt/bharatmart`**. The **app root** (where **`package.json`** and **`.env`** live) is **`/opt/bharatmart`** when `app_source_subpath` is empty, or **`/opt/bharatmart/<app_source_subpath>`** (e.g. **`/opt/bharatmart/BharatMart-App`**) for the training repo.

---

## 1. Outputs (IPs and IDs)

After apply, copy values from the stack **Outputs** (names match `outputs.tf`).

| Output | Contents |
|--------|-----------|
| `load_balancer_public_ip` | LB address for browser / `curl` |
| `frontend_public_ips` | SSH to frontend |
| `frontend_private_ips` | VCN address (LB uses this for frontend backends) |
| `backend_instance_pool_id` | Pool OCID |
| `backend_instance_ids` | Backend **compute instance OCIDs** (pool members) |
| `bharatmart_summary` | LB URL, health URL, frontend public/private IPs, backend instance ids, pool id |

**Backend private IPs** are not a separate Terraform output (pool size can change). Resolve from an instance id:

**Console:** **Compute → Instances →** open instance by OCID → **Attached VNICs** → private IP.

**OCI CLI:**

```bash
oci compute instance get --instance-id <BACKEND_INSTANCE_OCID> \
  --query 'data."private-ip"' --raw-output
```

List pool members then print each private IP:

```bash
export POOL=<backend_instance_pool_id>
export COMP=<compartment_ocid>

oci compute-management instance-pool list-instances \
  --instance-pool-id "$POOL" --compartment-id "$COMP" \
  --query 'data[].id' --raw-output | tr -s '\t' '\n' | while read -r IID; do
    [ -z "$IID" ] && continue
    printf '%s ' "$IID"
    oci compute instance get --instance-id "$IID" --query 'data."private-ip"' --raw-output
    echo
  done
```

---

## 2. Laptop: quick checks

```bash
export LB_IP=<load_balancer_public_ip>

curl -sS -o /dev/null -w "frontend %{http_code}\n"  "http://${LB_IP}/"
curl -sS -o /dev/null -w "backend  %{http_code}\n"  "http://${LB_IP}:3000/api/health"
curl -sS "http://${LB_IP}:3000/api/health"
```

- **502** → often unhealthy LB backends (§8) or service down on the VM.
- **Timeout / refused** → routing, security lists, or instance state.

---

## 3. SSH key on the frontend (optional)

If you need the same private key file **on** the frontend (e.g. to `ssh` from there to backends without `-J`), copy it from your machine:

```bash
export KEY=~/.ssh/bharatmart_terraform_ed25519
export FE=<frontend_public_ip>

scp -i "$KEY" -p "$KEY" "opc@${FE}:~/.ssh/bharatmart_terraform_ed25519"
ssh -i "$KEY" "opc@${FE}" 'chmod 400 ~/.ssh/bharatmart_terraform_ed25519'
```

---

## 4. SSH: frontend

```bash
ssh -i ~/.ssh/bharatmart_terraform_ed25519 opc@<FRONTEND_PUBLIC_IP>
```

Use **`frontend_public_ips`** from outputs. SSH uses the **public** IP; **`frontend_private_ips`** is what the LB targets.

---

## 5. SSH: backend (via jump)

**One step from laptop** (replace `FE`, `BE`):

```bash
export KEY=~/.ssh/bharatmart_terraform_ed25519
export FE=<frontend_public_ip>
export BE=<backend_private_ip>

ssh -i "$KEY" -J "opc@${FE}" "opc@${BE}"
```

**After** copying the key to the frontend (§3), from **inside** the frontend:

```bash
ssh -i ~/.ssh/bharatmart_terraform_ed25519 opc@<BACKEND_PRIVATE_IP>
```

Get **`BE`** from §1 (Console or CLI).

---

## 6. Frontend VM — cloud-init and nginx

```bash
sudo cloud-init status --long
sudo tail -200 /var/log/cloud-init-output.log
```

Filter real failures (avoid matching RPM names like `perl-Error`):

```bash
sudo grep -iE 'npm install failed|Frontend deployment|Failed to clone|Nginx failed|exit 1' \
  /var/log/cloud-init-output.log | tail -30
```

**Service and localhost:**

```bash
sudo systemctl is-active nginx
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1/
ls -la /usr/share/nginx/html/ | head
ls -la /opt/bharatmart/BharatMart-App/package.json /opt/bharatmart/BharatMart-App/dist 2>/dev/null
# If app_source_subpath is empty, use /opt/bharatmart/package.json and /opt/bharatmart/dist instead.
sudo tail -20 /var/log/nginx/error.log
```

---

## 7. Frontend — manual repair (if user-data failed)

As **`opc`**, from your **app root** (set `APP` to match your `app_source_subpath`; training repo example below):

```bash
APP=/opt/bharatmart/BharatMart-App   # or /opt/bharatmart if package.json is at clone root
cd "$APP"
test -f .env || echo "WARNING: missing .env"
npm install && npm run build:client
# To update code: cd /opt/bharatmart && git pull && cd "$APP" && npm install && npm run build:client
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r dist/* /usr/share/nginx/html/
sudo chown -R nginx:nginx /usr/share/nginx/html/
sudo nginx -t && sudo systemctl restart nginx
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1/
```

---

## 8. Backend VM — API

```bash
sudo cloud-init status --long
sudo tail -200 /var/log/cloud-init-output.log
sudo grep -iE 'npm install failed|build:server|bharatmart-backend|Backend deployment' \
  /var/log/cloud-init-output.log | tail -30

sudo systemctl status bharatmart-backend --no-pager
sudo journalctl -u bharatmart-backend -n 80 --no-pager

ss -tlnp | grep -E ':3000|node'
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/health
curl -sS http://127.0.0.1:3000/api/health
```

**Manual repair (sketch):**

```bash
APP=/opt/bharatmart/BharatMart-App   # or /opt/bharatmart if app at repo root
cd "$APP"
sudo -u opc npm install
sudo -u opc npm run build:server
sudo chown -R opc:opc /opt/bharatmart
sudo systemctl restart bharatmart-backend
```

---

## 9. Load balancer vs VM

**Networking → Load balancers →** your LB → **Backend sets**

| Backend set | Port | Health path |
|-------------|------|-------------|
| Frontend | 80 | `/` |
| Backend API | 3000 | `/api/health` |

**Critical** → fix the VM (§6–8), then refresh health.

---

## 10. Quick isolation

| Symptom | Where to look |
|---------|----------------|
| 502 from LB | §9 |
| OK on VM `curl 127.0.0.1`, bad via LB | Backend registration / health |
| `cloud-init` error | §6 / §8 logs |
| `npm` / permission errors | Run **`npm`** as **`opc`**, not root |

---

## 11. Paths

| Item | Path |
|------|------|
| Git clone | `/opt/bharatmart` |
| App (npm, `.env`, `dist`) | `/opt/bharatmart` or `/opt/bharatmart/BharatMart-App` per `app_source_subpath` |
| Nginx root | `/usr/share/nginx/html/` |
| Backend unit | `bharatmart-backend.service` |
| API port | `3000` (default) |
| Env | next to `package.json` (`$APP/.env`) |

See also `commands.sh` in this folder.
