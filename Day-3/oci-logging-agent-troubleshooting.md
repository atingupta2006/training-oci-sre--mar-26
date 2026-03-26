# Day 3: OCI Unified Monitoring Agent & Logging — Troubleshooting Guide

Use this guide when **application logs** from **`api.log`** do not appear in OCI Logging, when the **parser** does not match what you set in the Console, or when **multiple agent configurations** cause confusion.

**Related lab:** `05-oci-logging-real-time-analysis-lab.md`  
**IAM / agent enablement:** `../Day-4/enable-logs-via-agent.md`  
**Terraform option 2 paths:** `notes-terraform-option-2.md`

---

## 1. Quick checks (on the backend VM)

Run as a user with `sudo`:

```bash
sudo systemctl status unified-monitoring-agent
```

After any change in **Logging → Agent configurations**, restart UMA:

```bash
sudo systemctl restart unified-monitoring-agent
```

Confirm the generated Fluentd config references your log file:

```bash
sudo grep -n 'api.log' /etc/unified-monitoring-agent/conf.d/fluentd_config/fluentd.conf
```

Confirm whether the tail source uses **JSON** or **plain line** parsing:

```bash
sudo grep -E '@type (json|none)' /etc/unified-monitoring-agent/conf.d/fluentd_config/fluentd.conf
```

For the **`<source>`** block that tails **`api.log`**, you want **`<parse> … @type json`** for structured BharatMart logs. If every line is **`@type none`**, the Console parser is **not** applied yet (or a different agent configuration is active).

---

## 2. Parser shows as “None” on the VM (`@type none`)

**Symptom:** `fluentd.conf` shows `@type none` under `<parse>` for `api.log`, even though you chose **JSON** in the Console.

**Common causes:**

1. **Console did not persist the parser** — In some cases the UI reports success but the saved Agent configuration still has **None**. Try **removing** the **log input** for `api.log` and **adding** a new log input with the same path and **JSON** + event time settings, then **Update**, then restart UMA.

2. **Wrong Agent configuration** — You edited one configuration while another (still `none`) is the one tied to the instance, or you are viewing stale merged output.

**Verify what OCI stored (API truth):**

```bash
oci logging unified-agent-configuration get --unified-agent-configuration-id <AGENT_CONFIG_OCID>
```

Inspect the log input’s parser (`JSON` vs `NONE`) in the JSON response.

---

## 3. Multiple Agent configurations (same VM, same file)

**Symptom:** `grep 'log_object_id' .../fluentd.conf` shows **several** different log OCIDs, or `grep 'api.log'` shows **multiple** `<source>` blocks for the same path.

**Cause:** Several students or several attempts created **multiple Agent configurations** in the same compartment; each adds another **tail** of `api.log` and another **destination** custom log.

**Effects:**

- Duplicate work on the instance (multiple Fluentd tails).
- **Log Explorer** may show data under **one** custom log but you may be searching **another** OCID.

**Cleanup:**

1. **Logging → Agent configurations** — List all configurations in the compartment.
2. Keep **one** configuration that has the correct **dynamic group**, path **`/opt/bharatmart/BharatMart-App/logs/api.log`**, parser **JSON**, and destination **your** custom log.
3. **Disable or delete** the others (coordinate with your instructor if a shared tenancy).
4. Restart UMA on the VM and confirm **one** `api.log` tail + **one** `log_object_id` for your pipeline.

---

## 4. Logs not visible in Log Explorer

**Symptom:** `fluentd.conf` looks correct but you see **no** lines (or only old lines) for the log you opened.

**Check:**

1. **Correct log resource** — Each `<match>` block uses a **`log_object_id`**. In **OCI → Logging → Log Groups → your custom log → copy OCID**, ensure it matches the **`log_object_id`** in `fluentd.conf` for the **JSON** pipeline you care about (see section 3 if there are several).

2. **Time range** — Widen Log Explorer to **Last hour** or more; ingestion can lag **2–5+ minutes** after changes.

3. **Traffic** — Generate requests (e.g. `curl` to the API) so new lines are appended to `api.log`.

4. **Buffer flush** — UMA often uses multi-minute **flush_interval**; wait a few minutes after restart.

---

## 5. No logs after switching parser to JSON

**Symptom:** Ingestion worked with parser **None**, then stopped or dropped after switching to **JSON**.

**Cause:** The **JSON** parser expects **every** line to be valid **single-line** JSON (NDJSON). Stack traces, plain text, or multiline JSON will fail parsing.

**Check file validity (sample):**

```bash
head -20 /opt/bharatmart/BharatMart-App/logs/api.log | while read -r line; do
  echo "$line" | python3 -m json.tool >/dev/null && echo OK || echo "BAD LINE"
done
```

Fix the application logging so each line is valid JSON, or temporarily use parser **None** while you fix mixed content.

**Time settings:** For BharatMart, use **time key** `timestamp`, **time format** `%Y-%m-%d %H:%M:%S`, **time type** STRING. A mismatched format can cause odd timestamps; total silence is less common but worth verifying in the Console.

---

## 6. IAM and plugins

**Symptom:** `grep` finds **no** `api.log` under `/etc/unified-monitoring-agent`.

**Check:**

- **Dynamic group** includes this instance.
- **Policies** allow the dynamic group to upload **log content** in the log group’s compartment.
- **Oracle Cloud Agent** plugins on the instance include **Custom Logs** / logging plugin (**Enabled**).

See **`../Day-4/enable-logs-via-agent.md`** for step-by-step enablement.

---

## 7. Logs and buffers

If UMA fails to start or crashes:

```bash
sudo journalctl -u unified-monitoring-agent -n 200 --no-pager
```

Optional: look for stuck buffer files (paths vary by release):

```bash
sudo find /opt/unifiedmonitoringagent/run/buffer -type f 2>/dev/null | head -30
```

---

## 8. Reference — BharatMart JSON parser (lab defaults)

| Setting | Value |
|--------|--------|
| Parser | JSON |
| Simple / nested | **Simple JSON** |
| Time type | STRING |
| Time key | `timestamp` |
| Time format | `%Y-%m-%d %H:%M:%S` |

---

## 9. Log Explorer: filters return no rows (custom JSON log)

**Symptom:** Queries like `level = 'error'` or `path = '/api/orders'` return nothing, even though logs appear in the stream.

**Cause:** Custom logs are wrapped in an envelope; parsed Winston fields are indexed under **`data`** (same as **`logContent.data`** in the JSON view). Top-level **`level`** / **`path`** are not the right field names for filters.

**Fix:** Use **`data.level`**, **`data.path`**, **`data.status_code`**, **`data.message`**, etc. Levels are **case-sensitive** (BharatMart often uses lowercase `info`, `error`).

Example (Advanced query):

```text
search "<compartmentOcid>/<logGroupOcid>/<logOcid>"
  | where data.level = 'error'
```

See **Task 3** in **`05-oci-logging-real-time-analysis-lab.md`** and the [Logging Query Language Specification](https://docs.oracle.com/en-us/iaas/Content/Logging/Reference/query_language_specification.htm).

---

## End of troubleshooting guide
