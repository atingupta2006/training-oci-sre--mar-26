# Day 3: Use OCI Logging Service for Real-Time Log Stream Analysis - Hands-on Lab

### Audience Context: IT Engineers and Developers

> **Terraform option 2:** See **`notes-terraform-option-2.md`** for load balancer URL, SSH (frontend → backend), and app log path (`/opt/bharatmart/BharatMart-App/logs/api.log` when using the training repo layout). Use **`path`** in log queries (matches `server/middleware/logger.ts`), not `route`.

---

## 1. Objective of This Hands-On

By completing this exercise, students will:

* Understand monitoring vs observability
* Identify the core observability signals used in this course (metrics and logs)
* Enable system logs on a compute instance
* Use OCI Logging to search, filter, and read logs
* Analyze application logs for troubleshooting

---

## 2. Background Concepts

### 2.1 Monitoring vs Observability

**Monitoring** answers: *"Is the system healthy?"*

* Uses predefined metrics
* Detects known failure modes
* Examples: CPU, memory, uptime, error count

**Observability** answers: *"Why is the system behaving this way?"*

* Allows root cause analysis
* Handles unknown failure modes
* Uses metrics and logs together

### 2.2 Observability Signals

In this course, observability work centers on **two signals**:

1. **Metrics** - Numerical values over time
2. **Logs** - Text-based, detailed events

In this lab, students focus on **logs**.

### 2.3 BharatMart Structured Logs

The BharatMart application uses **structured JSON logging** via Winston logger. Logs contain fields like:
- `timestamp`, `level`, `message`, `route`, `status_code`
- Business context: `orderId`, `userId`, `paymentStatus`

---

## 3. Hands-On Task 1 — Enable System Logs for Compute Instance

#### Purpose

Ensure your VM emits system logs to OCI Logging.

These logs help SREs:

* Diagnose OS-level issues
* Debug app crashes
* Track network or disk failures

### Steps:

1. Open the **Navigation Menu (☰)**.
2. Go to **Compute → Instances**.
3. Select your instance (name depends on your stack; option 2 often has **`bharatmart-fe-1`** or a backend from the pool).
4. Scroll down to **Resources → Management**.
5. Click **Logging**.
6. Click **Enable Logging**.
7. Choose:

   * **Log Group:** Create one → `<student-id>-log-group`
   * **Log Name:** `<student-id>-syslog`
   * **Source:** System logs
8. Click **Enable Log**.

### Expected Result:

* System log begins receiving entries within a few minutes
* Status shows **Active**

---

## 4. Hands-On Task 2 — Configure Application Log Ingestion

#### Purpose

Ingest BharatMart application logs into OCI Logging Service.

### Steps:

#### Step 1: Create OCI Log Group and Log

1. Go to **OCI Console → Observability & Management → Logging → Log Groups**
2. Click **Create Log Group** (name: `<student-id>-log-group` or use existing)
3. Create a **Log**:
   - Name: `<student-id>-bharatmart-api-log`
   - Log Type: Custom Log
   - Click **Create**

#### Step 2: Configure OCI Cloud Agent for Log Collection

1. **SSH to your Compute instance:**
   ```bash
   ssh -i ~/.ssh/your-key opc@<instance-ip>
   ```

2. **Verify Cloud Agent is installed:**
   ```bash
   systemctl status unified-monitoring-agent
   ```

3. **Configure log source:**
   Edit Cloud Agent logging configuration:
   ```bash
   sudo nano /opt/oracle-cloud-agent/plugins/logging/config.json
   ```

   Add log source configuration:
   ```json
   {
     "logSources": [
       {
         "logId": "<LOG_OCID>",
         "logPath": "/path/to/bharatmart/logs/api.log",
         "logType": "custom",
         "parser": "json"
       }
     ]
   }
   ```

   Replace:
   - `<LOG_OCID>` with the OCID of the Log you created (found in Log details)
   - **`/opt/bharatmart/BharatMart-App/logs/api.log`** for Terraform option 2 with the training repo (`app_source_subpath = "BharatMart-App"`), unless `LOG_FILE` in `.env` overrides it.
   
   **Log Path Guidance:**
   - Resolve **`LOG_FILE`** from the app `.env` on the VM (default relative path is under the app root).
   - See **`BharatMart-App/docs/06-observability/08-oci-cloud-agent-setup.md`** for more Cloud Agent detail.

4. **Restart Cloud Agent:**
   ```bash
   sudo systemctl restart unified-monitoring-agent
   ```

#### Step 3: Verify Log Collection

1. Generate log entries (on the **backend** VM, or from your laptop against the **load balancer**):
   ```bash
   export API=http://127.0.0.1:3000
   curl -sS "$API/api/products" -o /dev/null
   curl -sS "$API/api/orders" -o /dev/null
   ```
   From a laptop (replace with your LB IP): `export API=http://<LB_IP>:3000` then the same `curl` lines.

2. Wait 2-3 minutes for logs to be ingested

---

## 5. Hands-On Task 3 — View and Search Logs in OCI Logging

#### Purpose

Learn how to explore and analyze logs in OCI Logging Service.

### Steps:

1. Open **Navigation Menu → Observability & Management → Logging**.
2. Click **Log Groups**.
3. Select your log group: `<student-id>-log-group`.
4. Open your log: `<student-id>-syslog` or `<student-id>-bharatmart-api-log`.
5. Click **Search** to filter and inspect logs.

### Try These Queries:

#### System Logs:

* `level = 'ERROR'` - Shows system errors
* `text LIKE 'systemd'` - Shows service-level events
* `text LIKE 'ssh'` - Reveals SSH login logs

#### Application Logs (if structured JSON):

* `level = 'error'` - Shows application errors
* `path = '/api/orders'` - Shows logs for order API
* `status_code >= 500` - Shows server errors
* `message contains 'Order created'` - Shows successful order creation

### Expected Results:

* System logs show boot messages, systemd events, SSH logs
* Application logs show API requests, errors, business events
* Queries filter and display relevant log entries

---

## 6. Hands-On Task 4 — Analyze Log Patterns

#### Purpose

Use log analysis to identify patterns and issues.

### Steps:

1. **Analyze Error Patterns:**
   - Query: `level = 'error'`
   - Identify common error messages
   - Note error frequency

2. **Analyze Request Patterns:**
   - Query: `path = '/api/orders'`
   - Identify peak request times
   - Note response times

3. **Correlate with Metrics:**
   - Check `/metrics` endpoint for error counts
   - Compare log error count with metrics
   - Identify discrepancies

---

## 7. Summary of the Hands-On

In this exercise, you learned how to:

* Understand monitoring vs observability
* Enable system logs on a compute instance
* Configure application log ingestion via OCI Cloud Agent
* Use OCI Logging to search, filter, and read logs
* Analyze log patterns for troubleshooting

These form the foundation for debugging, incident resolution, and SLO validation.

---

## 8. Solutions Key (Instructor Reference)

### ✔ Solution Key — Task 1: Enable System Logs

#### Expected Settings:

* Log Group: `<student-id>-log-group`
* Log Name: `<student-id>-syslog`
* Source: System Logs
* Status: **Active**

#### Expected Student Outcome:

* VM syslog entries appear within minutes
* Log group shows new log stream

### ✔ Solution Key — Task 2: Application Log Ingestion

#### Expected Configuration:

* Log created: `<student-id>-bharatmart-api-log`
* Cloud Agent configured with log path
* Agent restarted successfully

#### Expected Outcome:

* Application log entries appear in OCI Logging within 2-3 minutes
* Structured JSON logs parsed correctly

### ✔ Solution Key — Task 3: Log Search

#### Expected Working Queries:

* `level = 'ERROR'` → shows system errors
* `level = 'error'` → shows application errors
* `path = '/api/orders'` → shows order API logs
* `status_code >= 500` → shows server errors

### Why This Matters:

These logs:

* Help diagnose VM failures
* Support troubleshooting of the BharatMart application
* Provide audit-level visibility into system events
* Enable log-based metrics creation (next lab)

---

## End of Hands-On Document

