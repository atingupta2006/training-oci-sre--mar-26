# Day 4: Set up a Scalable App Using OCI Load Balancer + Auto Scaling - Hands-on Lab

### Audience Context: IT Engineers and Developers

> **Terraform / layout:** If you use the training stack, see **`../Day-3/notes-terraform-option-2.md`** for LB URL, ports, and instance naming.

---

## 0. Deployment Assumptions

For this hands-on lab, you will configure OCI Load Balancer with Auto Scaling for BharatMart.

**Prerequisites:**
* OCI tenancy with appropriate permissions (`policies.txt` in this folder)
* BharatMart deployed on Compute instances (or an existing instance pool)
* Access to OCI Console

---

## 1. Objective of This Hands-On

By completing this exercise, students will:

* Deploy application behind OCI Load Balancer
* Create instance pools across Fault Domains
* Configure Auto Scaling for automatic capacity adjustment
* Verify high availability and scalability

---

## 2. Background Concepts

### 2.1 Fault Domains & Redundancy

OCI Availability Domains contain Fault Domains. High availability requires deploying instances across multiple Fault Domains.

### 2.2 Load Balancing Patterns

Load balancers improve HA by distributing traffic and detecting unhealthy instances.

### 2.3 Auto Scaling

Auto Scaling automatically adjusts capacity based on metrics (CPU, memory, request rate).

---

## 3. Deploy the app behind an OCI Load Balancer

If you **already** have a load balancer from Terraform or a prior lab, **open it** and confirm a **backend set** (HTTP port **3000**, health check **`/api/health`**) points at your app instances. You only need to **attach** new pool members in **§6**.

If you are **creating** a load balancer from scratch: **Networking → Load Balancers → Create** (public or private as required), add a **listener** (e.g. HTTP **80** or **3000**), then create a **backend set** and add backends (**§6**). Exact screens vary by shape (network load balancer vs flexible LB).

**Single-AD regions:** You still spread instances across **fault domains** within that AD; “multiple ADs” may not apply.

---

## 4. Configure instance pools across fault domains

#### Purpose

Provide redundancy through multiple application servers across fault domains.

### Steps

#### A. Create Instance Configuration

1. Go to **Compute → Instance Configurations**.
2. Click **Create Instance Configuration**.
3. Use your working training instance as a base.
4. Name it: `<student-id>-app-config`
5. Save configuration.

#### B. Create Instance Pool

1. Go to **Compute → Instance Pools**.
2. Click **Create Instance Pool**.
3. Name: `<student-id>-bharatmart-pool`
4. Use config: `<student-id>-app-config`
5. Set **Number of Instances = 2**
6. **Placement Configuration:**
   * Select **Multiple Fault Domains**
   * Distribute instances across FDs
7. Create.

### Expected Result

Instance pool created with instances across multiple Fault Domains.

---

## 5. Configure auto scaling

#### Purpose

Enable automatic scaling based on metrics.

### Steps

1. Go to **Compute → Instance Pools**.
2. Click on your instance pool.
3. Click **Auto Scaling Configuration**.
4. Click **Create Auto Scaling Configuration**.

#### Scaling Policies

**Scale-Out Policy (CPU-based):**
* **Metric:** CPU Utilization
* **Threshold:** > 70%
* **Duration:** 5 minutes
* **Action:** Add 1 instance

**Scale-In Policy (CPU-based):**
* **Metric:** CPU Utilization
* **Threshold:** < 30%
* **Duration:** 15 minutes
* **Action:** Remove 1 instance

5. Configure policies and click **Create**.

---

## 6. Attach Pools to Load Balancer

#### Purpose

Connect instance pools to Load Balancer backend set.

### Steps

1. Go to your Load Balancer.
2. Open **Backend Sets → Create Backend Set**
3. Name: `bharatmart-backend`
4. Policy: `ROUND_ROBIN`
5. **Health Check:**
   * Protocol: HTTP
   * Port: 3000
   * URL Path: `/api/health`
   * Interval: 30 seconds
6. Click **Add Backends**
7. Select instances from your instance pool
8. Port: `3000`
9. Save.

### Expected Result

Load Balancer shows healthy backends from instance pool.

---

## 7. Verify High Availability

#### Purpose

Validate that system maintains availability during failures.

### Steps

1. **Test Traffic Distribution:**
   ```bash
   curl http://<lb-ip>/
   ```
   Verify responses come from different instances.

2. **Simulate instance failure** (replace with your instance OCID):
   ```bash
   oci compute instance action --instance-id <INSTANCE_OCID> --action STOP --wait-for-state STOPPED
   ```

3. **Observe failover:**
   * Load Balancer marks instance unhealthy
   * Traffic routed to remaining instances
   * Service continues operating

4. **Verify auto scaling:**
   * Generate load on instances
   * Monitor CPU utilization
   * Verify auto-scaling adds instances when CPU > 70%

5. **Recover:** start the instance again when finished:
   ```bash
   oci compute instance action --instance-id <INSTANCE_OCID> --action START --wait-for-state RUNNING
   ```

---
