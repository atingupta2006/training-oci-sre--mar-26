# 🚀 **BharatMart OCI Deployment – Terraform (Frontend + Backend Architecture)**

This Terraform stack deploys a **multi-tier OCI environment** for BharatMart using:

* VCN with public & private subnets
* Internet Gateway + NAT Gateway
* Frontend VM(s) (public)
* Backend VM(s) (private by default)
* **Single OCI Public Load Balancer** with:

  * Port **80** → Frontend VM(s)
  * Port **3000** → Backend API VM(s)

This is ideal for **DEV, QA, or small production workloads**.

---

# 📁 **File Structure**

```
deployment/terraform/
├── variables.tf               # Input variables for deployment
├── main.tf                    # Network + Compute + LB resources
├── outputs.tf                 # LB IP, VM IPs, OCIDs
├── terraform.tfvars           # User-defined values (your environment)
├── terraform.tfvars.example   # Example configuration
└── README.md                  # This file
```

---

# ✅ **1. Prerequisites**

> **⚠️ INSTRUCTOR PROVIDED FILES**  
> Sensitive files are excluded from this git repository. To proceed with this lab, your instructor will securely provide you with:  
> 1. A pre-filled `terraform.tfvars` file containing the required OCIDs, passwords, and API keys.  
> 2. `oci_api_key.pem` (if testing via local CLI).  
> 3. SSH keypairs for Compute instance access.  
> **Please ask your instructor for these files before starting.**

# 🎛 **2. Configure terraform.tfvars**

Since your instructor has provided the secure `terraform.tfvars` file to you directly via Slack/Email, simply copy it into this directory:

```bash
cp /path/to/downloaded/terraform.tfvars .
```

You do not need to manually configure OCIDs, Supabase Keys, or SSH keys, as they are pre-filled for you.

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

Provisioning time: **4–10 minutes**

---

# 🌐 **4. What This Project Creates**

## **Networking**

✔ VCN (10.0.0.0/16)
✔ Public subnet (frontend + LB)
✔ Private subnet (backend)
✔ Internet Gateway
✔ NAT Gateway
✔ Public Route Table
✔ Private Route Table
✔ Security Lists (public & private)

---

## **Compute**

### 🔵 Frontend VM(s)

* Public IP auto-assigned
* NGINX auto-installed via cloud-init
* Serves HTML/JS frontend

### 🟢 Backend VM(s)

* Private IP only (unless override enabled)
* Node.js auto-installed
* API listens on port 3000

---

## **Load Balancer (Public, Single LB)**

✔ Listener :80 → Frontend VM(s)
✔ Listener :3000 → Backend API VM(s)

This keeps architecture simple & cost-effective.

---

# 📤 **5. Terraform Outputs**

View after apply:

```bash
terraform output
```

You will typically see:

```
load_balancer_public_ip = "129.xxx.xxx.xxx"
frontend_public_ips     = ["132.xxx.xxx.xxx"]
frontend_private_ips    = ["10.0.1.10"]
backend_private_ips     = ["10.0.2.15"]
backend_instance_ids    = [...]
```

---

# 🔐 **6. SSH Access**

### SSH to Frontend VM (Public)

```bash
ssh -i ~/.ssh/id_rsa opc@<frontend_public_ip>
```

### SSH to Backend VM (Private Only)

Use one of:

* Bastion host (recommended)
* VPN
* Enable `enable_backend_public_ip = true`

---

# 🧪 **7. Validate Deployment**

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

```
curl http://<load_balancer_public_ip>:3000/api/health
```

---

# 💰 **8. Cost Optimization**

* A1 Flex shapes → lowest cost
* LB bandwidth = 10 Mbps → minimal billing
* NAT only when required
* Single LB keeps price down

---

# 📈 **9. Future Enhancements**

* Add **backend-only private LB** (separate project)
* Add SSL certificates + HTTPS
* Connect Autonomous DB
* Use OCI DevOps pipelines
* Add WAF & path-based routing

**Note:** For instance pools and auto-scaling, see `option-2` deployment option.

---

# 🛑 **10. Cleanup**

```bash
terraform destroy
```

Confirm:

```
yes
```

---

# 🖼 Updated Architecture Diagram (Single Public LB)

```
                     +---------------------------------------+
                     |     Oracle Cloud Infrastructure        |
                     +---------------------------------------+
                                      |
                                      |
                     +----------------------------------+
                     |     Virtual Cloud Network        |
                     |        10.0.0.0/16               |
                     +----------------------------------+
                          |                     |
                          |                     |
      ---------------------------------------------------------------
      |                                                             |
+--------------------------+                           +--------------------------+
|     Public Subnet        |                           |     Private Subnet       |
|       10.0.1.0/24        |                           |       10.0.2.0/24        |
|                          |                           |                          |
|  +--------------------+  |                           |  +--------------------+  |
|  | Public Load        |  |                           |  | Backend VM(s)      |  |
|  | Balancer (80,3000) |  |-------------------------->|  | Node.js API        |  |
|  +---------+----------+  |       HTTP (3000)         |  | Private IP only    |  |
|            |             |                           |  +--------------------+  |
|            | HTTP (80)   |                           |                          |
|            v             |                           |                          |
|  +--------------------+  |                           |                          |
|  | Frontend VM(s)     |  |                           |                          |
|  | NGINX, public IP   |  |                           |                          |
|  +--------------------+  |                           |                          |
+--------------------------+                           +--------------------------+

                     +----------------------------------+
                     |        Internet Gateway          |
                     +----------------------------------+
```

---
