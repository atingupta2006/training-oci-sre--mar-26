# Day 2: Define SLI/SLOs for a Sample Web App Running on OCI Load Balancer + Compute (Demonstration)

### Audience Context: IT Engineers and Developers

---

## 0. Deployment Assumptions

This is an instructor-led demonstration. Students observe the SLI/SLO definition process.

**Assumed Context:**
* **BharatMart** deployed on OCI with Load Balancer
* **OCI Monitoring** access available
* **In OCI Metric Explorer:** load balancer and compute metrics (default namespaces)
* **Application** Prometheus metrics: available via **`curl`** to **`/metrics`** on the API (port **3000**); they are **not** in OCI unless you ingest custom metrics (not assumed here)

---

## 1. Purpose

Demonstrate how to define meaningful SLIs and SLOs for BharatMart application running on OCI, using both infrastructure metrics and application metrics.

---

## 2. Prerequisites

* BharatMart deployed on OCI with Load Balancer
* OCI Monitoring access
* Load balancer and compute metrics in OCI; optional **`curl`** to **`/metrics`** for Prometheus names on the API

---

## 3. What You'll Demonstrate

1. **Identify Critical User Journeys**
   * Order placement flow
   * Product browsing flow
   * Payment processing flow

2. **Select Appropriate Metrics**
   * Load Balancer latency for user-facing experience
   * Application error rates from `/metrics` endpoint
   * Infrastructure health metrics

3. **Define SLIs**
   * Availability SLI
   * Latency SLI
   * Error Rate SLI

4. **Set SLO Targets**
   * Based on historical performance
   * Aligned with business requirements
   * Achievable with current architecture

5. **Calculate Error Budgets**
   * Based on SLO targets
   * Monthly traffic estimates
   * Policy thresholds

---

## 4. Demonstration Steps

#### Step 1: Review Current Metrics

1. Access **OCI Console** → **Observability & Management** → **Monitoring** → **Metric Explorer**
2. Review **OCI-native** metrics (no extra setup):
   - **Load balancer** namespace (often **`oci_loadbalancer`**): e.g. response-time and response-count style metrics — exact names vary by UI
   - **Compute** namespace **`oci_computeagent`:** `CpuUtilization`, `MemoryUtilization`, etc.

3. **Separately**, show **application** Prometheus metrics (not in Metric Explorer unless you ingest them):
   ```bash
   curl -sS "http://<load-balancer-ip>:3000/metrics" | head -40
   ```
   Examples: `http_request_duration_seconds`, `http_requests_total`. Use these to explain **SLIs** that map to user experience; use **OCI LB metrics** in the Console for **operator** dashboards without custom ingestion.

#### Step 2: Define Availability SLI

1. **SLI Definition:**
   ```
   SLI: Percentage of successful HTTP requests (2xx/3xx status codes)
   Measurement: Load balancer response metrics in OCI when available; optional detail from Prometheus `http_requests_total` via curl
   ```

2. **Query in Metric Explorer (OCI-native):**
   - Namespace: **`oci_loadbalancer`** (or the LB namespace your region shows)
   - Pick a **response count** or **status** style metric your UI lists for the load balancer (names vary)
   - Relate successful vs total responses if the metric dimensions allow; otherwise discuss qualitatively

   **Optional — deeper accuracy:** use Prometheus on the API: `curl "http://<LB_IP>:3000/metrics"` and **`http_requests_total`** by **`status_code`** (not in OCI without ingestion).

3. **Set SLO:**
   ```
   SLO: 99.5% availability over 30-day window
   ```

#### Step 3: Define Latency SLI

1. **SLI Definition:**
   ```
   SLI: P99 latency for order API requests
   Measurement: Load balancer latency in OCI; app histogram `http_request_duration_seconds` only on Prometheus `/metrics`
   ```

2. **Query in Metric Explorer (OCI-native):**
   - Namespace: **`oci_loadbalancer`**
   - Metric: a **backend response time** or **latency** metric offered for your load balancer (e.g. **`BackendResponseTime`** if listed)
   - Statistic: **P99** or **mean** per UI

   **Note:** `http_request_duration_seconds` exists on **`/metrics`** (Prometheus) but **not** in OCI Metric Explorer unless ingested.

3. **Set SLO:**
   ```
   SLO: P99 latency < 500ms for order API
   ```

#### Step 4: Define Error Rate SLI

1. **SLI Definition:**
   ```
   SLI: Percentage of 5xx errors
   Measurement: Load balancer or HTTP error metrics in OCI when listed; optional detail from Prometheus via curl
   ```

2. **In Metric Explorer:** use load balancer or HTTP error style metrics if your namespace exposes them; or demonstrate **5xx** from **`curl "http://<LB_IP>:3000/metrics"`** / **`http_requests_total`** for teaching (not in OCI without ingestion).

3. **Set SLO:**
   ```
   SLO: Error rate < 0.5% (aligned with 99.5% availability SLO)
   ```

#### Step 5: Calculate Error Budget

1. **Assumptions:**
   - Monthly traffic: 2,000,000 requests
   - Availability SLO: 99.5%

2. **Calculation:**
   ```
   Allowed failures = 0.5% of 2,000,000 = 10,000 failures/month
   ```

3. **Policy Thresholds:**
   - **Warning (50%):** 5,000 failures → Slow feature velocity
   - **Critical (75%):** 7,500 failures → Pause releases
   - **Exhausted (100%):** 10,000 failures → Full freeze

---

## 5. Key Points to Emphasize

* **User-Facing Focus:** SLIs should measure what users experience
* **Multiple Data Sources:** Combine Load Balancer and application metrics
* **Realistic Targets:** SLOs based on historical performance, not aspirations
* **Business Alignment:** Error budgets tied to business impact

---

## 6. What Students Should Observe

* How to identify critical user journeys
* Metric selection for SLI definition
* SLO target setting process
* Error budget calculation methodology

