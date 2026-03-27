# Day 4: Run Failure Injection Using OCI CLI and Chaos Simulation Scripts - Demonstration

### Audience Context: IT Engineers and Developers

---

## 0. Deployment Assumptions

This is an instructor-led demonstration. Students observe failure injection using chaos engineering.

**Assumed Context:**
* **BharatMart** deployed on OCI with monitoring
* **OCI CLI** configured and accessible
* **Chaos engineering** features available in application

---

## 1. Purpose

Demonstrate how to inject controlled failures to test system resilience and validate failover mechanisms.

---

## 2. Prerequisites

* BharatMart deployed with Load Balancer and multiple backends
* OCI CLI installed and configured
* Monitoring and alerting configured
* Chaos engineering enabled in application

---

## 3. What You'll Demonstrate

1. **Chaos Engineering Concepts**
   * Controlled failure injection
   * System behavior under stress
   * Resilience validation

2. **Failure Scenarios**
   * Instance failures
   * Latency injection
   * Error injection
   * Network issues

3. **Observing System Response**
   * Automatic failover
   * Monitoring and alerting
   * Recovery mechanisms

---

## 4. Demonstration Steps

#### Step 1: Baseline system state

1. **List backend instances** (replace compartment / pool as appropriate):
   ```bash
   oci compute instance list --compartment-id <COMPARTMENT_OCID> --query "data[*].{id:id,displayName:\"display-name\",state:\"lifecycle-state\"}" --output table
   ```
2. **Confirm Load Balancer health** in the Console (**Networking → Load Balancers → Backend sets**) or with CLI if configured.
3. **Review metrics** (Grafana, OCI Monitoring, or `curl http://<LB_IP>:3000/api/health`).

---

#### Step 2: Inject instance failure

1. **Stop one backend instance** (get `<INSTANCE_OCID>` from the pool or Console):
   ```bash
   oci compute instance action --instance-id <INSTANCE_OCID> --action STOP --wait-for-state STOPPED
   ```

2. **Observe system response:**
   * Load Balancer detects failure
   * Traffic automatically rerouted
   * Health checks mark backend as unhealthy
   * Remaining backends handle traffic

3. **Monitor Metrics:**
   * Show latency spike during failover
   * Verify service continues operating
   * Confirm no errors for users

---

#### Step 3: Inject Latency (Chaos Engineering)

1. **Enable Chaos Engineering:**
   ```bash
   # SSH to instance
   ssh opc@<instance-ip>
   
   # Set chaos environment variable
   export CHAOS_ENABLED=true
   export CHAOS_LATENCY_MS=500
   
   # Restart the app service (replace with your actual systemd unit name)
   sudo systemctl restart bharatmart-api
   ```

2. **Observe Impact:**
   * Metrics show latency increase (P95 > 500ms)
   * Users experience slower responses
   * Alarms trigger if thresholds exceeded

3. **Monitor system behavior:**
   * Check if auto-scaling triggers
   * Verify timeout and retry logic
   * Observe error handling

---

#### Step 4: Recovery (required)

1. **Disable chaos** if you enabled it: unset `CHAOS_*`, restart the app, or restore the unit file as per your deployment.
2. **Start the stopped instance:**
   ```bash
   oci compute instance action --instance-id <INSTANCE_OCID> --action START --wait-for-state RUNNING
   ```
3. Confirm **backend health** on the load balancer before ending the session.

---

## 5. Wrap-up

* Summarize what the LB and pool did during stop/start.
* Record any unexpected alarms or gaps in monitoring.

---
