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
├── troubleshooting.md         # Post-deploy checks (SSH, cloud-init, LB, manual fixes)
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

# ▶ **3. Deploy Infrastructure (OCI Resource Manager)**

This lab is designed to run **inside OCI** using **Resource Manager**. You **zip** the Terraform configuration (this `option-2` folder contents), **upload** it as a stack, and run **Apply** from the console. You do **not** need `terraform init` / `plan` / `apply` on your laptop.

### **3.1 Prepare the zip**

1. Ensure **`terraform.tfvars`** is complete (`tenancy_ocid`, `user_ocid`, **`fingerprint`**, **`region`**, **`compartment_ocid`**, **`ssh_public_key`**, app secrets, etc.).
2. **OCI API private key (one approach for both Resource Manager and local Terraform):**
   - Copy the **private** `.pem` file that matches **`fingerprint`** in `terraform.tfvars` (the same key registered on your user in **OCI Console → Identity → Users → API keys**).
   - Save it in **this folder** next to the `.tf` files with the exact name **`oci_api_key.pem`**.
   - In `terraform.tfvars`, keep **`private_key_path = "./oci_api_key.pem"`** and **`private_key = ""`** (empty). Terraform reads the key from the file; Resource Manager sees it inside the extracted zip.
3. Zip everything needed for the stack: **`.tf` files**, **`terraform.tfvars`**, **`env.tpl`**, **`oci_api_key.pem`**, etc. Do not rely on paths like `C:\Users\...` or `~/.oci/...` — they do not exist inside Resource Manager.
4. **`oci_api_key.pem`** is listed in **`.gitignore`** so it is not committed to git by mistake; it still must be **added manually** before you create the zip for each upload.

### **3.2 Create stack and apply**

1. OCI Console → **Developer Services** → **Resource Manager** → **Stacks** → **Create stack**.
2. Upload your **zip**; accept defaults where prompted.
3. Review **variables** if the wizard exposes them (they may be taken from `terraform.tfvars`).
4. Run **Plan**, then **Apply** on the stack. Wait until the job **succeeds**.

Provisioning time: typically **4–15 minutes** depending on region and resources.

### **3.3 After apply — get outputs**

1. Open the successful **Apply** job → **Outputs** (wording may vary by console version).
2. Copy outputs you need for SSH and checks: **`load_balancer_public_ip`**, **`frontend_public_ips`**, **`frontend_private_ips`**, **`backend_instance_pool_id`**, **`backend_instance_ids`**, **`bharatmart_summary`** (see **`troubleshooting.md`** for resolving backend **private** IPs from instance OCIDs).

If outputs are not visible, use the **OCI Console** to find the load balancer public IP and instance IPs (see **`troubleshooting.md`**).

### **Optional: local Terraform**

Advanced users may run `terraform init` / `plan` / `apply` on a VM with OCI credentials; this is **not** required for the Resource Manager workflow above.

---

### Cloud-init, `github_repo_url`, and `app_source_subpath`

User-data clones **`github_repo_url`** into **`/opt/bharatmart`** (the Git working tree). Set **`app_source_subpath`** to the folder that contains **`package.json`** relative to that clone:

- **`training-oci-sre--mar-26`** (course repo): use **`app_source_subpath = "BharatMart-App"`** so the app path is **`/opt/bharatmart/BharatMart-App`**.
- **Flat repos** (e.g. `oci-multi-tier-web-app-ecommerce`, `package.json` at repo root): use **`app_source_subpath = ""`** (default) so the app path is **`/opt/bharatmart`**.

Frontend and backend cloud-init run **`npm install`** and builds as user **`opc`** under that app directory.

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

# 📤 **5. Outputs**

After a successful **Apply**, open the job **Outputs**. Typical values (names match `outputs.tf`):

```
load_balancer_public_ip   = "129.xxx.xxx.xxx"
frontend_public_ips       = ["132.xxx.xxx.xxx"]
frontend_private_ips      = ["10.0.1.x"]
backend_instance_pool_id  = "ocid1.instancepool..."
backend_instance_ids      = ["ocid1.instance..."]
bharatmart_summary        = { ... }
```

Backend **private** IPs: use each id in **`backend_instance_ids`** with the Console or CLI (**`troubleshooting.md`**, Outputs). If job outputs are missing, use **Networking → Load balancers** and **Compute → Instances**.

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
