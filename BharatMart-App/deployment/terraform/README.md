# BharatMart OCI Terraform Deployments

This directory contains the two primary Terraform deployment architectures used in the 5-Day SRE Training Program for the BharatMart application on Oracle Cloud Infrastructure (OCI).

## Deployment Options Comparison

| Option | Architecture Style | Day inside Curriculum | Scalability | Recommended For |
|--------|-------------------|-----------------------|-------------|-----------------|
| **[Option 1](./option-1/)** | Single All-in-One VM | **Day 1** | None | Rapid development, testing, cost-saving prototypes, basic Terraform/Resource Manager learning |
| **[Option 2](./option-2/)** | Instance Pool + Auto-Scaling (Frontend VM + Backend Pool behind Load Balancer) | **Day 4** | Automatic (CPU Based In/Out) | Production workloads, High Availability, Load Balancer + Auto Scaling Lab |

---

## Detailed Breakdown & When to Use

### [Option 1: Single VM Deployment](./option-1/README.md)
* **What it deploys:** A single Oracle Linux VM sitting in a public subnet hosting both the React Frontend (via Nginx) and the Node.js API.
* **Course Context:** Used heavily in **Day 1** to introduce Terraform, OCI Resource Manager, and basic VM provisioning without overwhelming architectural complexity. 
* **When to use:** Use this when you are performing rapid prototyping, initial development, or simply need an isolated sandbox to test features without incurring load balancer costs.

### [Option 2: Instance Pool & Auto-Scaling](./option-2/README.md)
* **What it deploys:** A dedicated Frontend VM in a public subnet and a backend **OCI Instance Pool** in a private subnet, bridged by an OCI Public Load Balancer. The pool is governed by an Auto-Scaling configuration that monitors CPU utilization, scaling instances out or in automatically.
* **Course Context:** Used in **Day 4** for the "Load Balancer + Auto Scaling" Lab and "Chaos Engineering" simulations. 
* **When to use:** Production workloads that need resilience, predictability, automatic recovery, and to demonstrate error budgets and chaos engineering.

---

## 🔒 Required Secure Files (Instructor Provided)

Because this repository is public, sensitive configuration files are intentionally omitted. **Before beginning your labs**, your instructor will provide the following files to you via a secure channel (e.g., Slack, Email, or a secure Drive link):

1. **`terraform.tfvars`**: Contains your specific OCI tenancy OCIDs, user OCIDs, Supabase API keys, and secure passwords. (You can view the structure in the provided `.example` files).
2. **OCI API Keys (`oci_api_key.pem`)**: If you are running Terraform locally via CLI, you will need the private key to authenticate against your OCI Tenancy.
3. **SSH Access Keys (`id_rsa` / `id_rsa.pub`)**: Required to SSH into the provisioned instances for debugging.

**Do not commit these files to GitHub if you clone or fork this repository.**

---

## Getting Started

1. Pick an option directory above matching the current curriculum Day.
2. Read the specific `README.md` inside that option's folder.
3. Define your credentials in `terraform.tfvars`.
4. Deploy using standard Terraform commands:
   ```bash
   terraform init
   terraform apply
   ```
