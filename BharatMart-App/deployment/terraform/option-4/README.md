# 🚀 **BharatMart OCI Deployment – Terraform (Option-4: Full Observability & SRE)**

This Terraform stack deploys a **multi-tier OCI environment** for BharatMart with **comprehensive monitoring, logging, and observability** features:

* VCN with public & private subnets
* Internet Gateway + NAT Gateway
* Frontend VM(s) (public)
* Backend Instance Pool with Auto-scaling (private)
* **Single OCI Public Load Balancer** with:
  * Port **80** → Frontend VM(s)
  * Port **3000** → Backend API VM(s)
* **Full Observability Stack**:
  * VCN Flow Logs
  * Load Balancer Access/Error Logs
  * Application Logs (via OCI Cloud Agent)
  * 12+ Monitoring Alarms
  * Notification Topics for Alerts

This is ideal for **Production workloads requiring SRE practices and observability**.

---

# 📁 **File Structure**

```
deployment/terraform/option-4/
├── variables.tf                    # Input variables for deployment
├── main.tf                         # Network + Frontend Compute + LB resources
├── instance-pool-autoscaling.tf    # Backend Instance Pool + Auto-scaling
├── monitoring-logging.tf           # Observability: Logs, Alarms, Notifications
├── outputs.tf                      # LB IP, VM IPs, OCIDs, Log IDs, Alarm IDs
├── terraform.tfvars                # User-defined values (your environment)
├── terraform.tfvars.example        # Example configuration
├── env.tpl                         # Environment template for application
└── README.md                       # This file
```

---

# ✅ **1. Prerequisites**

### ✔ A. OCI CLI Installed

```bash
oci --version
```

### ✔ B. Correctly Authenticated

```bash
oci iam region list
```

### ✔ C. IAM Permissions Required

Ensure your OCI user/group has permissions for:
- Compute (instances, instance pools, autoscaling)
- Networking (VCN, subnets, load balancer)
- **Logging** (log groups, logs, service logs)
- **Monitoring** (alarms, metrics)
- **Notifications** (topics, subscriptions)

---

# 🎛 **2. Configure terraform.tfvars**

First copy the example file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Then update these **required** values:

* `compartment_ocid`
* `tenancy_ocid`
* `user_ocid`
* `fingerprint`
* `region`
* `ssh_public_key`
* `github_repo_url`
* `supabase_url`
* `supabase_anon_key`
* `supabase_service_role_key`
* `jwt_secret`

**Optional variables:**
* `frontend_instance_count` (default: 1)
* `backend_pool_initial_size` (default: 2)
* `backend_pool_min_size` (default: 1)
* `backend_pool_max_size` (default: 10)
* Shape and resource configurations

---

# ▶ **3. Deploy Infrastructure**

### **Initialize Terraform**

```bash
terraform init
```

### **Validate Syntax**

```bash
terraform validate
```

### **Preview Changes**

```bash
terraform plan
```

### **Apply Infrastructure**

```bash
terraform apply
```

Confirm:
```
yes
```

Provisioning time: **8–15 minutes** (includes monitoring/logging setup)

---

# 🌐 **4. What This Project Creates**

## **Networking**

✔ VCN (10.0.0.0/16)
✔ Public subnet (frontend + LB)
✔ Private subnets (backend, AD-aware)
✔ Internet Gateway
✔ NAT Gateway
✔ Public Route Table
✔ Private Route Table
✔ Security Lists (public & private)
✔ **VCN Flow Logs** (network traffic monitoring)

---

## **Compute**

### 🔵 Frontend VM(s)

* Public IP auto-assigned
* NGINX auto-installed via cloud-init
* Serves HTML/JS frontend
* **OCI Cloud Agent** configured for log ingestion

### 🟢 Backend Instance Pool

* Private IP only
* Auto-scaling enabled (CPU-based)
* Node.js auto-installed
* API listens on port 3000
* **OCI Cloud Agent** configured for log ingestion
* Systemd service for automatic restarts

---

## **Load Balancer (Public, Single LB)**

✔ Listener :80 → Frontend VM(s)
✔ Listener :3000 → Backend API VM(s)
✔ **Access Logs** enabled
✔ **Error Logs** enabled

---

## **Observability & Monitoring** 🆕

### **Logging**

✔ **Log Group**: Central log group for all logs
✔ **VCN Flow Logs**: Complete network traffic capture
✔ **Load Balancer Logs**: Access and error logs
✔ **Frontend NGINX Logs**: Access and error logs from NGINX (serving static files)
✔ **Backend Application Logs**: JSON-formatted app logs (Node.js application logs)

### **Custom Metrics Collection** 🆕

✔ **Backend Prometheus Metrics**: Automatically collected from `/metrics` endpoint
  - HTTP metrics: `http_requests_total`, `http_request_duration_seconds`
  - Business metrics: `orders_created_total`, `orders_value_total`, `payments_processed_total`
  - System metrics: `error_total`, `retry_attempts_total`, `circuit_breaker_open_total`
  - Namespace: `bharatmart_custom` in OCI Monitoring
  - Collection interval: 60 seconds
  - **Note**: Frontend instances do NOT expose metrics (NGINX static files only)

### **Monitoring Alarms** (12 alarms configured)

**Compute Metrics:**
- Frontend High CPU (>80%)
- Frontend High Memory (>85%)
- Backend High CPU (>80%)
- Backend High Memory (>85%)
- Disk Utilization (>90%)

**Load Balancer Metrics:**
- Backend Health (no healthy servers)
- High Request Rate (>1000 req/s)
- High Response Time (>2000ms)

**Instance Pool Metrics:**
- Pool Size Below Minimum
- Pool Size Approaching Maximum

**Network Metrics:**
- High Ingress Traffic
- High Egress Traffic

### **Notifications**

✔ **Notification Topic**: For alarm alerts
- Configure email/SMS/PagerDuty subscriptions in OCI Console

---

# 📤 **5. Terraform Outputs**

View after apply:

```bash
terraform output
```

**Infrastructure Outputs:**
```
load_balancer_public_ip = "129.xxx.xxx.xxx"
frontend_public_ips     = ["132.xxx.xxx.xxx"]
backend_instance_pool_id = "ocid1.instancepool..."
```

**Monitoring & Logging Outputs** 🆕:
```
log_group_id              = "ocid1.loggroup..."
vcn_flow_log_id           = "ocid1.log..."
load_balancer_access_log_id = "ocid1.log..."
frontend_nginx_access_log_id = "ocid1.log..."
frontend_nginx_error_log_id  = "ocid1.log..."
backend_app_log_id        = "ocid1.log..."
notification_topic_id     = "ocid1.onstopic..."
monitoring_alarms         = {
  frontend_high_cpu        = "ocid1.alarm..."
  backend_high_cpu         = "ocid1.alarm..."
  ...
}
```

---

# 📊 **6. Accessing Logs & Monitoring** 🆕

## **View Logs in OCI Console**

1. Navigate to: **Observability & Management → Logging → Log Groups**
2. Click on your log group: `bharatmart-log-group`
3. Access logs:
   - **VCN Flow Logs**: Network traffic analysis
   - **Load Balancer Logs**: Access patterns, errors
   - **Application Logs**: Frontend/Backend app logs

## **View Metrics & Alarms**

1. Navigate to: **Observability & Management → Monitoring → Metrics Explorer**
2. Select namespace: `bharatmart_custom` to view custom Prometheus metrics
3. Available custom metrics:
   - `http_requests_total` - Total HTTP requests
   - `http_request_duration_seconds` - Request latency
   - `orders_created_total` - Orders created
   - `orders_value_total` - Total order value
   - `payments_processed_total` - Payments processed
   - And more business/application metrics
4. Navigate to: **Monitoring → Alarms**
5. View all configured alarms and their current status
6. Click on any alarm to see:
   - Current metric values
   - Alarm history
   - Notification settings

## **Configure Alarm Notifications**

1. Navigate to: **Developer Services → Notifications → Topics**
2. Click on: `bharatmart-alarm-topic`
3. Click **Create Subscription**
4. Choose notification method:
   - Email
   - SMS
   - PagerDuty
   - Slack (via Functions)
   - Custom HTTPS endpoint

## **Query Logs via OCI CLI**

```bash
# List log groups
oci logging log-group list --compartment-id <COMPARTMENT_OCID>

# Search logs (requires Logging Analytics or custom queries)
oci logging-search search-logs \
  --search-query "search 'bharatmart'" \
  --time-start $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S.000Z) \
  --time-end $(date -u +%Y-%m-%dT%H:%M:%S.000Z)
```

---

# 🔐 **7. SSH Access**

### SSH to Frontend VM (Public)

```bash
ssh -i ~/.ssh/id_rsa opc@<frontend_public_ip>
```

### SSH to Backend Instance Pool Instances

Use one of:
* Bastion host (recommended)
* VPN
* Via Frontend VM (jump host)

To get backend instance IPs:
```bash
oci compute-management instance-pool list-instances \
  --instance-pool-id <BACKEND_POOL_ID> \
  --compartment-id <COMPARTMENT_OCID>
```

---

# 🧪 **8. Validate Deployment**

## ✔ Setup Database (First Time Only)

1. Open your Supabase project's SQL Editor and create the required execution function:
   ```sql
   CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     EXECUTE sql;
   END;
   $$;
   ```
2. From your local machine (inside the cloned repository), run the database init script to create tables and seed products:
   ```bash
   npm install
   npm run db:init
   ```

## ✔ Frontend UI

Open browser:
```
http://<load_balancer_public_ip>
```

## ✔ Backend Health Check

```bash
curl http://<load_balancer_public_ip>:3000/api/health
```

## ✔ Verify Log Ingestion 🆕

1. Generate some traffic (browse frontend, make API calls)
2. Wait 2-3 minutes for Cloud Agent to send logs
3. Check OCI Console → Logging → Log Groups
4. Verify logs appear in:
   - `bharatmart-frontend-nginx-access-log` (NGINX access logs)
   - `bharatmart-frontend-nginx-error-log` (NGINX error logs)
   - `bharatmart-backend-app-log` (Node.js application logs)
   - `bharatmart-lb-access-log` (Load balancer access logs)

## ✔ Verify Monitoring Alarms 🆕

1. Navigate to: **Monitoring → Alarms**
2. Verify all alarms are in "OK" state initially
3. Test an alarm by:
   - Generating high CPU load
   - Checking alarm transitions to "FIRING"

## ✔ Verify Custom Metrics Collection 🆕

1. Wait 2-3 minutes after backend instances start
2. Navigate to: **Monitoring → Metrics Explorer**
3. Select namespace: `bharatmart_custom`
4. Search for metrics like:
   - `http_requests_total`
   - `orders_created_total`
   - `http_request_duration_seconds`
5. Verify metrics appear with instance dimensions (hostname, resourceId)
6. Generate some API traffic and verify metrics update

## ✔ Verify Custom Metrics Collection 🆕

1. Wait 2-3 minutes after backend instances start
2. Navigate to: **Monitoring → Metrics Explorer**
3. Select namespace: `bharatmart_custom`
4. Search for metrics like:
   - `http_requests_total`
   - `orders_created_total`
   - `http_request_duration_seconds`
5. Verify metrics appear with instance dimensions (hostname, resourceId)
6. Generate some API traffic and verify metrics update

---

# 💰 **9. Cost Optimization**

* A1 Flex shapes → lowest cost
* LB bandwidth = 10 Mbps → minimal billing
* NAT only when required
* Single LB keeps price down
* **Logging costs**: Based on log volume (first 10GB/month free)
* **Monitoring costs**: Based on metric data points

---

# 📈 **10. SRE Best Practices Enabled** 🆕

This deployment includes:

✅ **Comprehensive Logging**: All layers (network, LB, application)
✅ **Proactive Monitoring**: 12 alarms covering critical metrics
✅ **Auto-scaling**: Automatic scale-out/in based on CPU
✅ **Health Checks**: LB health checks for backend instances
✅ **Centralized Observability**: All logs in OCI Logging Service
✅ **Alerting**: Notification topic ready for integrations

**Next Steps for SRE:**
1. Create dashboards in OCI Monitoring
2. Set up log-based metrics
3. Configure incident response playbooks
4. Integrate with PagerDuty/Slack for alerts
5. Set up log retention policies
6. Create runbooks based on alarm triggers

---

# 🛑 **11. Cleanup**

```bash
terraform destroy
```

Confirm:
```
yes
```

**Note**: This will destroy all resources including logs and alarms. Export important logs before destroying if needed.

---

# 🖼 Architecture Diagram (with Observability)

```
                     +---------------------------------------+
                     |     Oracle Cloud Infrastructure        |
                     +---------------------------------------+
                                      |
                                      |
                     +----------------------------------+
                     |     Virtual Cloud Network        |
                     |        10.0.0.0/16               |
                     |   [VCN Flow Logs Enabled]       |
                     +----------------------------------+
                          |                     |
                          |                     |
      ---------------------------------------------------------------
      |                                                             |
+--------------------------+                           +--------------------------+
|     Public Subnet        |                           |     Private Subnets       |
|       10.0.1.0/24        |                           |    10.0.2.0/24, etc.     |
|                          |                           |                          |
|  +--------------------+  |                           |  +--------------------+  |
|  | Public Load        |  |                           |  | Backend Instance    |  |
|  | Balancer (80,3000) |  |-------------------------->|  | Pool (Auto-scaling) |  |
|  | [Access/Error Logs]|  |       HTTP (3000)         |  | [Cloud Agent Logs]  |  |
|  +---------+----------+  |                           |  +--------------------+  |
|            |             |                           |                          |
|            | HTTP (80)   |                           |                          |
|            v             |                           |                          |
|  +--------------------+  |                           |                          |
|  | Frontend VM(s)     |  |                           |                          |
|  | NGINX, public IP   |  |                           |                          |
|  | [Cloud Agent Logs] |  |                           |                          |
|  +--------------------+  |                           |                          |
+--------------------------+                           +--------------------------+
            |                          |
            |                          |
            v                          v
    +------------------+      +------------------+
    | OCI Logging      |      | OCI Monitoring   |
    | Service          |      | Service          |
    | - VCN Flow Logs  |      | - 12 Alarms      |
    | - LB Logs        |      | - Metrics        |
    | - App Logs       |      | - Notifications  |
    +------------------+      +------------------+
```

---

# 📚 **Additional Resources**

- [OCI Logging Service Documentation](https://docs.oracle.com/en-us/iaas/Content/Logging/Concepts/loggingoverview.htm)
- [OCI Monitoring Documentation](https://docs.oracle.com/en-us/iaas/Content/Monitoring/Concepts/monitoringoverview.htm)
- [OCI Cloud Agent Setup Guide](../../../docs/06-observability/08-oci-cloud-agent-setup.md)
- [BharatMart Observability Overview](../../../docs/06-observability/01-observability-overview.md)

---

**Note**: This is **Option-4** - Full observability deployment. For simpler deployments without monitoring/logging, see `option-3`. For basic single-VM deployment, see `option-1`.
