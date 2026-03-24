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

## Getting Started

1. Pick an option directory above matching the current curriculum Day.
2. Read the specific `README.md` inside that option's folder.
3. Define your credentials in `terraform.tfvars`.
4. Deploy using standard Terraform commands:
   ```bash
   terraform init
   terraform apply
   ```
