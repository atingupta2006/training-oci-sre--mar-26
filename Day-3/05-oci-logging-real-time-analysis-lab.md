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
- `timestamp`, `level`, `message`, `path`, `status_code`
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

Complete the steps below **in order**. **Task 1** confirms that system logs reach OCI Logging for your instance; resolve that before depending on custom log ingestion.

1. Finish **Task 1** (system logs).
2. On the Compute instance that writes **`api.log`** (typically a **backend** instance when using load-balanced option 2), enable **Oracle Cloud Agent** and the relevant **plugin** for custom log files in the Console.
3. Create the **Custom Log** resource (Step 1), then use **Logging → Agent configurations** (Step 3) so **Unified Monitoring Agent (UMA)** on the VM receives a **tail** of `api.log` and ships to that log. You do **not** need to edit JSON or other agent files on the VM for the standard flow—only **restart UMA** (Step 3) after Console and IAM changes.

---

### Step 1: Create OCI Log Group and Log (if not already done)

1. Go to **OCI Console → Observability & Management → Logging → Log Groups**
2. Click **Create Log Group** (name: `<student-id>-log-group` or use existing)
3. Create a **Log**:
   - Name: `<student-id>-bharatmart-api-log`
   - Log Type: Custom Log
   - Click **Create**
4. Copy the **Log OCID** from the log details page (needed when you create the **Agent configuration** in Step 3).

---

### Step 2: Enable Oracle Cloud Agent plugins (Console)

On the **same** Compute instance where the API runs and `api.log` is written:

1. **☰ → Compute → Instances** → open that instance.
2. Under **Resources**, open **Oracle Cloud Agent** (wording may be **Monitoring** or **Management** depending on UI version).
3. Ensure the **Oracle Cloud Agent** service is **enabled / running**.
4. Under **Plugins**, enable the plugin used for **custom log file** collection — commonly named **Custom Logs** or **Logging** (exact label varies by region and image).
5. Save. Wait **1–2 minutes** and confirm the plugin shows **Enabled**.

---

### Step 3: OCI Agent configuration and UMA (Console + one command on the VM)

On **Oracle Linux** with **Unified Monitoring Agent (UMA)**, custom log shipping is configured in the **Console**. The control plane pushes Fluentd configuration to the instance—you **do not** need to create or edit `config.json` under `/opt/oracle-cloud-agent` for this flow. After saving the Agent configuration, **restart UMA** on the VM so it loads the assignment.

**Troubleshooting:** If something does not work after following the steps below, use **`07-oci-logging-agent-troubleshooting.md`** (same Day-3 folder).

---

#### 3a. Prerequisites (IAM)

1. **Identity → Dynamic groups:** Define a rule that includes this backend instance (for example: `all { instance.compartment.id = '<your-compartment-ocid>' }`). See **`Day-3/policies.txt`** for related IAM patterns.

2. **Identity → Policies:** Grant that **dynamic group** permission to upload **log content** and use **log groups** in the compartment where your custom log lives. The instance uses **instance principal** via the dynamic group—not your user’s group.

---

#### 3b. Create the Agent configuration (Console)

1. Go to **Observability & Management → Logging → Agent configurations**.
2. Click **Create agent configuration** (wording may vary slightly).
3. **Name / compartment:** Use a clear name (e.g. `<student-id>-bharatmart-api-agent`) and the compartment where your resources live.
4. **Associate with a dynamic group:** Select the dynamic group from **3a** that contains the backend instance where `api.log` is written.
5. **Log inputs — Add** a log input:
   - **Log path / file:**  
     **`/opt/bharatmart/BharatMart-App/logs/api.log`**  
     (Terraform option 2 + training repo; see **`notes-terraform-option-2.md`** if your path differs.)
   - **Parser:** **JSON** (so each line is parsed as structured fields, not a single opaque string).

---

#### 3c. JSON parser and event time (BharatMart `api.log`)

BharatMart writes **one JSON object per line** (NDJSON) with **top-level** keys such as `timestamp`, `level`, `path`, `status_code`. Use these settings in the parser section of the log input:

| Setting | Value | Notes |
|--------|--------|--------|
| **Simple vs nested JSON** | **Simple JSON** | Use **Nested JSON** only if your payload is wrapped (e.g. JSON under a single parent key). |
| **Time type** | **STRING** | `timestamp` is a string, not Unix epoch. |
| **Time key** | **`timestamp`** | Field name in the JSON line. |
| **Time format** | **`%Y-%m-%d %H:%M:%S`** | Matches values like `2026-03-26 02:30:06`. |
| **Deep time key** | *(leave empty)* | Only for nested JSON with a dotted path. |
| **Estimate event time** | **Off / false** | Prefer the log line’s `timestamp`. |
| **Keep time key** | Optional | **On** if you still want `timestamp` in the record for queries. |
| **Timeout** | Default | Usually leave default. |
| **Replace empty strings as null** | Optional | Enable only if you need empty strings normalized. |
| **Null value pattern** | *(empty)* | Unless you use sentinel strings like `-` or `N/A`. |

If the Console **does not keep** the parser as JSON after you click **Update** (it reverts to **None**), try **removing** the log input and **adding** it again with the same path and JSON settings, then save. See **`07-oci-logging-agent-troubleshooting.md`**.

---

#### 3d. Destination log

- **Destination / custom log:** Select the **custom log** you created in **Step 1** (the **Log OCID** must match the log you open later in Log Explorer).

---

#### 3e. Save and apply on the VM

1. Click **Create** or **Update** on the Agent configuration.
2. **On the backend VM (SSH):** restart UMA:

   ```bash
   sudo systemctl restart unified-monitoring-agent
   sudo systemctl status unified-monitoring-agent
   ```

3. **Wait 2–5 minutes** for the control plane to push config and for the first chunks to flush (buffer flush is often on the order of minutes).

---

#### 3f. Verify (optional but recommended)

On the backend VM:

```bash
sudo grep -R "api.log" /etc/unified-monitoring-agent/conf.d/fluentd_config/fluentd.conf
sudo grep -E '@type (json|none)' /etc/unified-monitoring-agent/conf.d/fluentd_config/fluentd.conf
sudo lsof /opt/bharatmart/BharatMart-App/logs/api.log
```

For the **active** `<source>` that tails `api.log`, you want **`<parse> … @type json`** (not only `@type none`). If you still see only `none`, or multiple duplicate tails, see **`07-oci-logging-agent-troubleshooting.md`**.

**Note:** Older docs sometimes describe editing **`/opt/oracle-cloud-agent/plugins/logging/config.json`**. That path is **not** part of this lab when using **Agent configurations** + UMA. For legacy detail, see **`BharatMart-App/docs/06-observability/08-oci-cloud-agent-setup.md`**.

---

### Step 4: Verify log collection

1. Generate log entries (on the **backend** VM, or from your laptop against the **load balancer**):
   ```bash
   export API=http://127.0.0.1:3000
   curl -sS "$API/api/products" -o /dev/null
   curl -sS "$API/api/orders" -o /dev/null
   ```
   From a laptop (replace with your LB IP): `export API=http://<LB_IP>:3000` then the same `curl` lines.

2. Wait **2–5 minutes** for logs to appear (longer immediately after plugin or configuration changes).

**If no lines appear:** Confirm **Step 3** shows `api.log` under `/etc/unified-monitoring-agent`, Task 1 shows system log activity, the plugin is **Enabled** on the **backend**, and IAM allows the **dynamic group** to upload log content. Allow several minutes before retesting. See **`07-oci-logging-agent-troubleshooting.md`** and **`../Day-4/enable-logs-via-agent.md`**.

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

---

### Understanding the log shape (custom application log)

When you use a **JSON** parser on `api.log`, OCI still wraps each event in a **CloudEvents-style** envelope. In the Console you may see **`logContent`** with nested **`data`** (metadata under **`oracle`**, **`source`**, **`subject`**, etc.). The **Winston fields** from your app (for example `level`, `path`, `status_code`, `message`) appear under **`logContent.data`** in the raw JSON.

In **Logging Search** (including [Advanced search queries](https://docs.oracle.com/en-us/iaas/Content/Logging/Concepts/searchinglogs.htm)), those application fields are indexed under the **`data`** prefix — not at the top level. Use **`data.<fieldname>`** in filters. Field names are **case-sensitive**; BharatMart uses **lowercase** levels such as **`info`** and **`error`**.

Examples of paths in **`data`**: `data.level`, `data.path`, `data.status_code`, `data.message`, `data.eventType`.

---

### Try these queries

Use **Advanced** mode if your UI offers it, with a **`search`** scope and **`where`** (see [Logging Query Language Specification](https://docs.oracle.com/en-us/iaas/Content/Logging/Reference/query_language_specification.htm)). Replace the placeholder with your log scope (compartment / log group / log), or rely on the log context you already selected in the Search UI.

**Pattern:**

```text
search "<compartmentOcid>/<logGroupOcid>/<logOcid>"
  | where data.level = 'error'
```

If the Console only shows a **simple** filter row, enter the **field** as `data.level`, `data.path`, etc., when the field picker allows it.

#### System logs (`<student-id>-syslog`)

Structure differs from custom logs. Try:

* `level = 'ERROR'` — may work for syslog severity (case-sensitive).
* `where logContent = '*systemd*'` or `where logContent = '*ssh*'` — broad text match on the full payload (wildcards as in the query language spec).

#### Application logs (`<student-id>-bharatmart-api-log`, JSON parser)

Use the **`data.`** prefix for Winston fields:

| Goal | Example (`where` clause or filter) |
|------|-------------------------------------|
| Application **error** lines | `data.level = 'error'` |
| **Info** request lines | `data.level = 'info'` |
| Specific **route** (example: orders API) | `data.path = '/api/orders'` |
| **Root** path (common in samples) | `data.path = '/'` |
| HTTP **5xx** responses | `data.status_code >= 500` |
| By **event** type | `data.eventType = 'api_request'` |
| Text in **message** | `where logContent = '*Order*'` — or filter on `data.message` if exposed as a string field in your scope |

**Do not** use bare `level`, `path`, or `status_code` alone for custom logs — they are not top-level indexed fields; **`data.level`**, **`data.path`**, **`data.status_code`** are.

---

### Expected Results:

* System logs show boot messages, systemd events, SSH logs
* Application logs show API requests, errors, and business fields under **`data`**
* Queries using **`data.*`** match the structured JSON you parsed on the agent

---

## 6. Hands-On Task 4 — Analyze Log Patterns

#### Purpose

Use log analysis to identify patterns and issues.

### Steps:

1. **Analyze Error Patterns:**
   - Query: `data.level = 'error'` (custom log JSON fields live under **`data`**)
   - Identify common error messages (for example **`data.message`**)
   - Note error frequency

2. **Analyze Request Patterns:**
   - Query: `data.path = '/api/orders'` (or **`data.path = '/'`** for root traffic)
   - Identify peak request times
   - Note response times (for example **`data.response_time_ms`** when present)

3. **Correlate with Metrics:**
   - Check `/metrics` endpoint for error counts
   - Compare log error count with metrics
   - Identify discrepancies

---

## 7. Summary of the Hands-On

In this exercise, you learned how to:

* Understand monitoring vs observability
* Enable system logs on a compute instance
* Configure application log ingestion (Console: plugins, **Agent configuration** with JSON parser — see **Step 3**; IAM; on VM: **restart UMA** only, then verify). For problems, see **`07-oci-logging-agent-troubleshooting.md`**.
* Use OCI Logging to search, filter, and read logs
* Analyze log patterns for troubleshooting

These form the foundation for debugging, incident resolution, and SLO validation.

---

## 8. Appendix — Expected results

### Task 1: System logs

#### Settings:

* Log Group: `<student-id>-log-group`
* Log Name: `<student-id>-syslog`
* Source: System Logs
* Status: **Active**

#### Outcome:

* VM syslog entries appear within minutes
* Log group shows new log stream

### Task 2: Application log ingestion

#### Configuration:

* Log created: `<student-id>-bharatmart-api-log`
* Oracle Cloud Agent plugins enabled (Custom Logs / equivalent)
* **Agent configuration** ties dynamic group + **`api.log`** path to that custom log (parser **JSON** per **Step 3**); **UMA restarted**; optional **`grep api.log`** / **`@type json`** under `/etc/unified-monitoring-agent` confirms apply. See **`07-oci-logging-agent-troubleshooting.md`** if ingestion or parsing fails.

#### Outcome:

* Application log entries appear in OCI Logging within a few minutes
* Structured JSON logs parsed correctly

### Task 3: Log search

#### Example queries:

* **Syslog:** `level = 'ERROR'` (may apply to system log shape) or `where logContent = '*keyword*'`
* **Custom JSON log (BharatMart):** use **`data.`** prefix — `data.level = 'error'`, `data.path = '/api/orders'`, `data.status_code >= 500`
* See **Task 3** section for full **`search` / `where`** patterns and envelope explanation

### Using these results

These logs:

* Help diagnose VM failures
* Support troubleshooting of the BharatMart application
* Provide audit-level visibility into system events
* Enable log-based metrics creation (next lab)

---

## End of Hands-On Document

