# Day 2: Alarms + email notifications — Hands-on Lab

You will create a CPU alarm on a compute instance, an email notification topic, and attach the topic to the alarm.

Prerequisites: correct compartment in the Console; an email address you can confirm; lab **06** completed (so you know how to pick an instance and `oci_computeagent` metrics).

> Terraform option 2: pick a backend pool member or a frontend such as `bharatmart-fe-1` for the CPU alarm. Task 3 needs `custom.bharatmart` data in Metric Explorer; if it is missing, skip that task. See **`notes-terraform-option-2.md`** in this folder.

---

## Task 1 — CPU alarm (no email yet)

Build an alarm that fires when mean CPU stays above **70%** for **1 minute**.

1. **☰ → Observability & Management → Alarms**.
2. **Create alarm** (or **Create** in list view).
3. **Define alarm:**
   - **Name:** `<student-id>-cpu-alarm`
   - **Compartment:** your training compartment
4. **Build a metric query** (wording may vary slightly by UI version):
   - **Metric namespace:** `oci_computeagent`
   - **Metric name:** `CpuUtilization`
   - **Resource:** select **your compute instance** (the BharatMart VM you chose).
   - **Statistic:** **mean**
   - **Interval between notifications:** leave default or **1 minute** (match trigger below).
5. **Trigger rule:**
   - **Operator:** greater than (**>**)
   - **Threshold:** `70`
   - **Trigger delay:** **1 minute** (alarm must breach for this long).
6. **Severity:** **Warning** (or Critical).
7. **Notifications:** leave **empty** for now → **Next** / **Create**.

**Pass:** Alarms list shows **`<student-id>-cpu-alarm`**, state **OK** (until CPU spikes).

---

## Task 2 — Email topic + subscribe + attach to alarm

### A. Topic

1. Open **Notifications**: **☰ → Developer Services → Application Integration → Notifications**, or type **Notifications** in the Console search bar.
2. **Topics → Create topic**
   - **Name:** `<student-id>-cpu-topic`
   - **Compartment:** same as above
3. **Create**

### B. Email subscription

1. Open the topic **`...-cpu-topic`**.
2. **Create subscription**
   - **Protocol:** **Email**
   - **Endpoint:** your address
3. **Create** → open the **confirmation email** → **confirm** (required).

### C. Attach topic to alarm

1. **☰ → Observability & Management → Alarms**
2. Open **`<student-id>-cpu-alarm`**
3. **Edit** (or **Manage notifications**)
4. **Notification destination:** select topic **`<student-id>-cpu-topic`** → **Save**

The alarm should list the topic under notifications, and the email subscription should show as confirmed.

---

## Task 3 — Optional: application metric alarm

Only if **`custom.bharatmart`** appears in **Metric Explorer** with data.

1. **Create alarm**
2. **Name:** `<student-id>-api-latency-alarm`
3. **Namespace:** `custom.bharatmart`
4. **Metric name:** `http_request_duration_seconds` (not `api_latency_seconds`)
5. **Statistic:** mean or percentile per UI
6. **Threshold:** e.g. **0.5** (seconds) — tune to your scale
7. **Trigger delay:** **2 minutes**
8. **Notifications:** same topic or a new one → **Create**

If the namespace does not exist, **skip** — use infrastructure alarms only.

---

## Optional — force a CPU alarm to fire (test)

SSH to the **same instance** the alarm monitors, then (Oracle Linux):

```bash
sudo yum install -y stress-ng 2>/dev/null || true
stress-ng --cpu 4 --timeout 120s
```

Watch **Alarms** → state should move to **Firing** after delay, then email arrives. Stop stress; state returns to **OK**.

---

## For instructors

| Check | Expected |
|-------|----------|
| Alarm query | `oci_computeagent` / `CpuUtilization` / correct instance |
| Topic | Present; email subscription confirmed |
| Alarm | Notification topic attached |
