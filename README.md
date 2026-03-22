# SRE with Oracle Cloud Infrastructure — Training Program

Welcome to the **5-Day SRE Training Program** built around the **BharatMart** e-commerce platform on Oracle Cloud Infrastructure (OCI).

---

## 📂 Repository Structure

```
SRE_Repeat_Training/
├── Day-1/          # SRE Fundamentals, Culture & OCI Alignment
├── Day-2/          # SLIs, SLOs, Error Budgets & Monitoring
├── Day-3/          # Reducing Toil, Observability & Automation
├── Day-4/          # High Availability, Resilience & Incident Response
├── Day-5/          # Culture, On-Call & DevOps Integration
├── BharatMart-App/ # Hands-on SRE training platform (Node.js + React)
├── SRE-Concepts-Reference/ # Deep SRE theory reference (supplementary)
└── Presentations/  # Slides and course outline documents
```

---

## 🎓 5-Day Curriculum

### Day 1 — SRE Fundamentals & OCI Alignment
| # | File | Type |
|---|---|---|
| 01 | What is Site Reliability Engineering | Theory |
| 02 | History of SRE | Theory |
| 03 | SRE vs DevOps vs Platform Engineering | Theory |
| 04 | Principles of SRE (SLI, SLO, Error Budget) | Theory |
| 05 | OCI Architecture Overview | Theory |
| 06 | Multi-Region OCI Tenancy | Demo |
| 07 | Terraform + OCI Resource Manager | Demo |
| 08 | Configure Cloud Shell & SDKs | **Lab** |
| 09 | Identity Domains & IAM Policies | **Lab** |

### Day 2 — SLIs, SLOs, Error Budgets & Monitoring
| # | File | Type |
|---|---|---|
| 01 | Defining SLIs & SLOs for Cloud-Native Services | Theory |
| 02 | Error Budgets & Policy Enforcement | Theory |
| 03 | How OCI Integrates with SRE Principles | Theory |
| 04 | Define SLI/SLOs for BharatMart | Demo |
| 05 | Error Budget Breach Simulation | Demo |
| 06 | Setup OCI Monitoring (Metrics Explorer, Alarms) | **Lab** |
| 08 | Alerting Workflows (OCI Notifications + Email) | **Lab** |
| 09 | Dashboards & Visualization | **Lab** |

### Day 3 — Reducing Toil, Observability & Automation
| # | File | Type |
|---|---|---|
| 01 | What is Toil and Why It Must Be Reduced | Theory |
| 02 | Observability: Metrics, Logs, Traces | Theory |
| 03 | The Role of Automation in SRE | Theory |
| 04 | Terraform + OCI Resource Manager Demo | Demo |
| 05 | OCI Logging Service Real-Time Analysis | **Lab** |
| 06 | Logging Metrics + OCI Monitoring Integration | **Lab** |

### Day 4 — High Availability, Resilience & Incident Response
| # | File | Type |
|---|---|---|
| 01 | Anti-fragility and Chaos Engineering | Theory |
| 02 | OCI Services for HA and Resilience | Theory |
| 03 | Learning from Failure, Postmortem Culture | Theory |
| 04 | Failure Injection & Chaos Demo | Demo |
| 05 | Load Balancer + Auto Scaling | **Lab** |
| 06 | OCI Vault + Secrets Resilience | **Lab** |
| 07 | Blameless Postmortem Simulation | **Lab** |

### Day 5 — SRE Culture, On-Call & Automation
| # | File | Type |
|---|---|---|
| 01 | Organizational Shift to SRE | Theory |
| 02 | Blameless Culture, On-Call, Rotational Health | Theory |
| 03 | Secure Automation Practices | Theory |
| 04 | SRE in Context of ITIL, Agile, DevOps | Theory |
| 05 | Service Connector Hub — Incident Response | **Lab** |

---

## 📋 IAM Policies — Quick Reference

Each day folder contains a `policies.txt` file with **pre-verified, copy-paste ready** IAM policy strings. **Do not write IAM policies from scratch.** Use these.

```
Day-1/policies.txt  ← SRE Student Baseline + Cloud Shell access
Day-2/policies.txt  ← Monitoring, Telemetry, Notifications
Day-3/policies.txt  ← Logging Service, Resource Manager
Day-4/policies.txt  ← Load Balancer, Auto Scaling, Vault
Day-5/policies.txt  ← Service Connector Hub, Events, Functions
```

---

## 🎯 The 80/20 SRE Rule

> **Spend 20% of your time on Configuration. Spend 80% on Observation and Response.**

All labs in this training are designed to get you to the observation phase quickly. Pre-configured OCI resources let you focus on what matters: detecting issues, understanding metrics, and responding to incidents.

---

## 🚀 BharatMart Application — Quick Start

BharatMart is a production-grade e-commerce platform designed for SRE training. It has:
- Prometheus metrics (`/metrics` endpoint)
- Health check (`/api/health`)
- System info (`/api/system/info`)
- Chaos engineering support (configurable)

### Prerequisites
- Node.js 20+, npm
- Supabase account (for database)

### Start BharatMart
```bash
cd BharatMart-App

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Terminal 1 — Backend
npm run dev:server

# Terminal 2 — Frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Metrics: http://localhost:3000/metrics
- Health: http://localhost:3000/api/health

---

## 📚 SRE Concepts Reference (Supplementary)

The `SRE-Concepts-Reference/` folder contains deep-dive SRE theory organized into 4 pillars:

- **01-Foundations** — How SRE relates to DevOps, Implementing SLOs
- **02-Engineering** — Monitoring, Alerting, Eliminating Toil, On-Call, Incident Response, Postmortem Culture
- **03-Operations** — System Design, Data Pipeline patterns
- **04-Advanced** — Config Design, Canary Releases, SRE Engagement Model, Team Lifecycles

> **Note:** Some topics are marked `(Skip)` — these are optional advanced readings.

---

## ✅ Prerequisites for Students

Before Day 1, ensure you have:
- Access to an OCI tenancy (credentials provided by trainer)
- SSH client (PuTTY or built-in terminal)
- Basic Linux command line familiarity
- Web browser for OCI Console

---

## 🧭 After Completing All 5 Days

Students should be able to:
- Define SLIs, SLOs, and Error Budgets for real services
- Set up monitoring, alarms, and dashboards in OCI
- Use OCI Logging for real-time observability
- Design high-availability architectures on OCI
- Conduct blameless postmortems
- Integrate SRE practices into CI/CD pipelines
