# BharatMart OCI Terraform Deployments

This directory contains four distinct Terraform deployment architectures for the BharatMart application on Oracle Cloud Infrastructure (OCI). The options range from a simple, low-cost single VM to a highly resilient, fully observable, auto-scaling production environment.

## Deployment Options Comparison

| Option | Architecture Style | Scalability | Observability | Recommended For |
|--------|-------------------|-------------|---------------|-----------------|
| **[Option 1](./option-1/)** | Single All-in-One VM | None | Basic | Rapid development, testing, cost-saving prototypes |
| **[Option 2](./option-2/)** | Multi-VM Fixed Architecture (Frontend VM + Backend VM behind Load Balancer) | Manual Scaling | Basic | Staging environments, small fixed-tier deployments |
| **[Option 3](./option-3/)** | Instance Pool + Auto-Scaling (Frontend VM + Backend Pool behind Load Balancer) | Automatic (CPU Based In/Out) | Basic | Production workloads with variable traffic, High Availability |
| **[Option 4](./option-4/)** | Full Observability & SRE (Auto-Scaling Pool + Custom Metrics, Flow Logs, & Alarms) | Automatic (CPU Based In/Out) | Comprehensive | **True Production**, Mission-Critical workloads, SRE Training |

---

## Detailed Breakdown & When to Use

### [Option 1: Single VM Deployment](./option-1/README.md)
* **What it deploys:** A single Oracle Linux VM sitting in a public subnet hosting both the React Frontend (via Nginx) and the Node.js API.
* **Pros:** Extremely fast deployment, uses the lowest amount of OCI resources, easiest to debug.
* **When to use:** Use this when you are performing rapid prototyping, initial development, or simply need an isolated sandbox to test features without incurring load balancer costs.

### [Option 2: Multi-Tier Architecture](./option-2/README.md)
* **What it deploys:** Separation of concerns. Deploys a dedicated Frontend VM in a public subnet and a dedicated Backend VM in a private subnet, bridged by an OCI Public Load Balancer. 
* **Pros:** Enhances security by hiding the backend behind a private subnet and introduces Load Balancing logic.
* **When to use:** Ideal for staging environments to replicate network separation concerns or lightweight production applications where horizontal scaling isn't required yet.

### [Option 3: Instance Pool & Auto-Scaling](./option-3/README.md)
* **What it deploys:** Takes the Multi-Tier architecture of Option 2 and upgrades the backend into an **OCI Instance Pool**. The pool is governed by an Auto-Scaling configuration that monitors CPU utilization, scaling instances out (up to 10 by default) or in automatically.
* **Pros:** High availability, handles sudden traffic spikes gracefully.
* **When to use:** Production workloads that need resilience, predictability, and automatic recovery.

### [Option 4: Full SRE & Observability Stack](./option-4/README.md)
* **What it deploys:** The ultimate Production architecture. Inherits the auto-scaling capability of Option 3, while wrapping the entire infrastructure in a blanket of observability. It sets up VCN Flow Logs, Load Balancer Access/Error logs, Node.js App logs, and installs OCI Cloud Agents to pipe custom `Prometheus` business metrics into OCI Monitoring. It also provisions 12 specialized Alarms attached to an OCI Notification Topic.
* **Pros:** Deep visibility, auto-remediation alerting, proactive failure detection.
* **When to use:** Mission-critical environments, performance benchmarking, and SRE Incident-Response training modules.

## Getting Started

1. Pick an option directory above.
2. Read the specific `README.md` inside that option's folder.
3. Define your credentials in `terraform.tfvars`.
4. Deploy using standard Terraform commands:
   ```bash
   terraform init
   terraform apply
   ```
