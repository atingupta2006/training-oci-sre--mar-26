# **Day 5 — Archiving Monitoring metrics with OCI Connector Hub**

### **Audience**

Cloud Engineers, DevOps Engineers, Observability Teams, and SREs.

### **Purpose**

This lab follows Oracle’s documented scenario **Monitoring → Connector Hub → Object Storage**, which archives **metric datapoints** from selected **Monitoring namespaces** into a bucket.

Primary Oracle references (keep these open while you work):

* [Scenario: Sending Metrics to Object Storage](https://docs.oracle.com/en-us/iaas/Content/connector-hub/metricssource.htm)  
* [Creating a Connector with a Monitoring Source](https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector-monitoring-source.htm) (detailed Console behavior, gzip, batch rollover)  
* [Creating a Connector](https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector.htm) (general flow)  

The product is often called **Service Connector Hub (SCH)** in older material; documentation and the Console often use **Connector Hub**.

This lab is **not** a substitute for **Alarm** history or **Alarm notification** delivery—those are separate from archiving **raw metric data** through Connector Hub.

---

# **0. Concepts before you begin**

## **0.1 What this connector actually moves**

Per Oracle, a **Monitoring** source connector retrieves **metric datapoints** for namespaces whose names begin with **`oci_`** (for example `oci_computeagent`, `oci_blockstore`). The **Object Storage** target stores **objects** (Oracle documents **gzip** compression). The payload is **metric data**, not OCI **Alarm notification** messages.

If you need to persist **alarm notifications** (messages when an alarm fires), use a different design (for example **Notifications**, **Streaming**, or **Logging** as a source). Do not expect this lab’s bucket to mirror the Alarm UI or “one file per alarm transition.”

## **0.2 What is Connector Hub?**

Connector Hub is a **managed data movement** service: **source** → optional **tasks** → **target**. Here: **Monitoring** → **Object Storage**.

Overview: [Connector Hub](https://docs.oracle.com/en-us/iaas/Content/connector-hub/home.htm).

## **0.3 Retention and delivery (Oracle-documented)**

* **Monitoring source retention in Connector Hub** is **24 hours** (see [Creating a Connector with a Monitoring Source](https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector-monitoring-source.htm)). The connector moves data on a schedule; **first objects can take several minutes** after creation.  
* For **Object Storage** targets, Oracle documents **batch rollover** (e.g. **100 MB** or **7 minutes**) and **gzip** compression—see the same page under **Considerations for Object Storage targets**.  
* Connectors that **fail to move data** for an extended period can be **automatically deactivated**—see [Overview of Connector Hub](https://docs.oracle.com/en-us/iaas/Content/connector-hub/overview.htm#deactivate) and confirm results at the target.

## **0.4 Why Object Storage as target?**

Object Storage is durable and cost-effective for long-term metric retention and downstream analytics.

---

# **1. Architecture for this lab**

```
Monitoring (metric namespaces, e.g. oci_computeagent) → Connector Hub → Object Storage (.gz objects)
```

1. You choose one **metrics compartment** (Oracle’s term) and **one or more namespaces** (this lab: **`oci_computeagent`** only, to keep volume small).  
2. **All metrics in the selected namespaces** for that compartment are retrieved—see Oracle’s [Creating a Connector](https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector.htm) (Monitoring source section).  
3. You can add **+ Another compartment** (up to **5** metric compartments and **50** namespaces total across compartments—Oracle limits).  

No application code is required for the basic pipeline.

---

# **2. Prerequisites**

* OCI tenancy with rights to create **buckets**, **connectors**, and **alarms** (for the optional verification step).  
* A **compute instance** in the **metrics compartment** you use for the connector so **`oci_computeagent`** metrics exist.  
* Console access.  
* **Expect UI variance:** use the Console **Search** bar and type **Connector Hub** if the menu path differs from this doc.

---

# **3. Step 1 — Create the Object Storage bucket**

1. Open **Storage → Object Storage → Buckets** (or search **Buckets**).  
2. Select your lab compartment.  
3. Click **Create bucket**.  
4. Set **Name** to `incident-events-archive` (or another allowed name) and **Standard** tier unless your org requires otherwise.  
5. Create the bucket.

This bucket holds **archived metric objects** from Connector Hub.

---

# **4. Step 2 — Create the connector**

1. Open **Connector Hub** (search **Connector Hub** in the Console if needed).  
2. Click **Create connector** (wording may vary).

## **4.1 Basic information**

* **Name:** e.g. `metric-archival-connector`  
* **Compartment:** compartment where the **connector resource** should live (often the same as your lab compartment).

## **4.2 Configure source and target (Monitoring → Object Storage)**

On the create flow, **configure the connector** and choose:

* **Source:** **Monitoring**  
* **Target:** **Object Storage**

Then **configure the source** to match Oracle’s [Monitoring source instructions](https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector-monitoring-source.htm) and the [metrics scenario](https://docs.oracle.com/en-us/iaas/Content/connector-hub/metricssource.htm):

* **Metrics compartment:** the compartment that contains your compute instance (the compartment whose **metrics** you want).  
* **Namespaces:** **select one or more** [metric namespaces](https://docs.oracle.com/en-us/iaas/Content/Monitoring/Concepts/monitoringoverview.htm#concepts__metricnamespacedefinition2). Namespaces must begin with **`oci_`**. For this lab, select **`oci_computeagent`** only (Oracle’s example scenario uses **`oci_computeagent`** and **`oci_blockstore`**—you may add **`oci_blockstore`** if you use block volumes and want those metrics too).  
  * The Console uses **namespace selection**, not a “regex” field in the documented flow. If you use **CLI/API**, JSON may differ—see [MonitoringSourceDetails](https://docs.oracle.com/en-us/iaas/api/#/en/serviceconnectors/latest/datatypes/MonitoringSourceDetails).  
**Configure the target:**

* **Compartment:** compartment that contains the bucket.  
* **Bucket:** `incident-events-archive`  
* **Object name prefix** (optional): e.g. `metrics/` (Oracle’s field name; keeps objects grouped).  

**Optional:** expand **Show additional options** for batch size/time if your team needs non-default batching (defaults are documented in [Creating a Connector with a Monitoring Source](https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector-monitoring-source.htm)).

## **4.3 Default policies and finish**

If the Console offers **default policies** for the connector to read metrics and write objects, **accept** them when your role allows—see [Authentication and Authorization](https://docs.oracle.com/en-us/iaas/Content/connector-hub/overview.htm#Authenti). If you cannot accept them, use **`policies.txt`** (POLICY 14–15) and [Securing Connector Hub](https://docs.oracle.com/en-us/iaas/Content/Security/Reference/sch_security.htm#iam-policies).

Click **Create** and wait until the connector is **Active**.

---

# **5. Step 3 — Create a test alarm (optional but recommended)**

An alarm does **not** drive what the connector writes; it is a practical check that **Monitoring** is evaluating **metrics** for your instance.

1. Go to **Observability & Management → Monitoring → Alarms → Create alarm**.  
2. Example rule: namespace **`oci_computeagent`**, metric **`CpuUtilization`**, statistic **Mean** (or **max** per Console), operator **greater than**, threshold **`1`**, interval **1 minute** (use the minimum interval the Console allows).  
3. Set **severity** and create the alarm.

If the metric stays above the threshold, the alarm should show **FIRING**. The bucket fills **according to Connector Hub’s metric delivery** (batch rollover and schedule), not on each alarm transition.

---

# **6. Step 4 — Validate the pipeline**

## **6.1 Connector**

1. Open **Connector Hub** → your connector’s **details** page.  
2. Review **metrics** (if shown), **work requests**, and any **errors**. Optionally [enable connector logs](https://docs.oracle.com/en-us/iaas/Content/connector-hub/enable-logs.htm) for delivery details.  
3. If nothing moves for a long time, see [Troubleshooting Connectors](https://docs.oracle.com/en-us/iaas/Content/connector-hub/troubleshooting.htm) and [No data is being moved](https://docs.oracle.com/en-us/iaas/Content/connector-hub/troubleshooting.htm#nodata).

## **6.2 Object Storage**

1. Open the bucket (from the connector details page, Oracle suggests selecting the bucket name shown there).  
2. Open the prefix **`metrics/`** (or the prefix you set).  
3. After some delay, you should see **`.gz`** objects (Oracle: **gzip**). Object names follow the service format described in [Creating a Connector with a Monitoring Source](https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector-monitoring-source.htm).  
4. **Download** an object and decompress (for example `gunzip` locally) to inspect **metric-related** JSON lines.

---

# **7. Real-world notes (short)**

* **Metric archive vs alarm trail:** Use this pattern for **long-term metric retention**. Use **Notifications**, **Streaming**, **Logging**, or other services for **notification** and **log** archival.  
* **Cost and scope:** Selecting many namespaces or compartments increases data moved—stay within Oracle limits and business needs.  
* **Centralization:** Multiple connectors can land in one bucket if IAM and residency rules allow.  
* **Downstream:** Object Storage is a common staging area for analytics and SIEM ingestion.

---

# **8. When the Console does not match this doc**

OCI updates navigation and wizards often. If a control is missing or labeled differently:

* Use **Search** for **Connector Hub** and **Monitoring**.  
* Compare your screen to [Creating a Connector with a Monitoring Source](https://docs.oracle.com/en-us/iaas/Content/connector-hub/create-service-connector-monitoring-source.htm).  
* Some options vary by **region** or **subscription**.  
* Official troubleshooting: [Troubleshooting Connectors](https://docs.oracle.com/en-us/iaas/Content/connector-hub/troubleshooting.htm).

---

# **9. Troubleshooting**

| Symptom | What to check |
|--------|----------------|
| Connector **Active** but **no objects** | Wait (batch rollover and first run can take time). Confirm **metrics compartment**, **namespace** selection, and metrics emission. See [No data is being moved](https://docs.oracle.com/en-us/iaas/Content/connector-hub/troubleshooting.htm#nodata). |
| **403 / not authorized** | **`policies.txt`** (POLICY 14–15) and [Securing Connector Hub](https://docs.oracle.com/en-us/iaas/Content/Security/Reference/sch_security.htm#iam-policies). |
| **High** object volume or cost | Select **fewer** namespaces or compartments; review [delivery details](https://docs.oracle.com/en-us/iaas/Content/connector-hub/overview.htm#delivery). |
| Alarm not **FIRING** | Instance may be idle; adjust threshold or confirm **oci_computeagent** metrics exist for the instance. |

---

# **10. IAM (if Console default policies are not enough)**

If you must write group policies, start from **`Day-5/policies.txt`** (POLICY 14–15). Use the **exact** resource type **`serviceconnectors`** (no hyphen) for Connector Hub—see [Securing Connector Hub](https://docs.oracle.com/en-us/iaas/Content/Security/Reference/sch_security.htm#iam-policies) and [Details for Connector Hub](https://docs.oracle.com/en-us/iaas/Content/Identity/Reference/serviceconnectorhubpolicyreference.htm). For Object Storage, see [Object Storage policies](https://docs.oracle.com/en-us/iaas/Content/Identity/Reference/objectstoragepolicyreference.htm).

---

# **11. Optional cleanup**

1. Delete or disable the test alarm.  
2. Stop or delete the connector if allowed.  
3. Empty or delete objects under **`metrics/`** per your retention rules.

---

# **12. Lab summary**

You configured **Monitoring → Connector Hub → Object Storage** to archive **metric namespaces** (lab: **`oci_computeagent`**) into a bucket, aligned with Oracle’s **Sending Metrics to Object Storage** scenario. You noted **gzip** delivery, **batch rollover** timing, **24-hour** source retention in Connector Hub, **namespace selection** in the Console, and **Console** variability.

---

## End of lab document
