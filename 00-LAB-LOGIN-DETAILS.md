# OCI Lab Access Details — SRE with Oracle Cloud Infrastructure

## How to Log In to OCI Console

**URL:** https://www.oracle.com/in/cloud/sign-in.html

---

## Step-by-Step Login Instructions

1. Open: **https://www.oracle.com/in/cloud/sign-in.html**
2. Enter Cloud Account Name: **`subsacadwizz`** → Click **Next**
3. On the Sign-In page, click **"Oracle Cloud Infrastructure Direct Sign-In"**
4. Enter your **Username** (see table below) and **Password** (given by trainer)
5. You may be prompted to change your password on first login — set it as instructed by the trainer

---

## Your Login Credentials

| Participant # | OCI Username | Cloud Account | Domain | Region |
|---|---|---|---|---|
| 01 | `u02` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 02 | `u03` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 03 | `u05` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 04 | `u07` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 05 | `u08` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 06 | `u09` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 07 | `u10` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 08 | `u11` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 09 | `u12` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 10 | `u14` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 11 | `u15` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 12 | `u16` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 13 | `u18` | `subsacadwizz` | `Default` | `ap-mumbai-1` |
| 14 | `u19` | `subsacadwizz` | `Default` | `ap-mumbai-1` |

> **Password will be announced by the trainer at the start of Day 1.**

---

## OCI Console Home Region

- **Region:** India West (Mumbai) — `ap-mumbai-1`
- After login, confirm you are in the **Mumbai** region (top-right region selector)
- **Do NOT switch regions** — all lab resources are in Mumbai

---

## Cloud Shell Access

Once logged in, you can open Cloud Shell (no installation needed):

1. Click the **Cloud Shell icon** (>_) in the top-right OCI Console toolbar
2. Cloud Shell opens with OCI CLI pre-configured for your user
3. Verify: `oci iam user get --user-id <your-OCID>`

---

## Compartment for All Labs

All resources you create must be in the compartment:  **`sre-lab-compartment`**

> If you do not see this compartment, ask the trainer — a policy may need to be applied.

---

## Support During Training

- Raise your hand or message the trainer on Zoom chat
- Do NOT create resources outside `sre-lab-compartment`
- Do NOT change your OCI username or account settings
