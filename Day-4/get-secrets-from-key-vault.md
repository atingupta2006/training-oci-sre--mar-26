# OCI — Working with Vault Secrets

Use **your** secret OCID and **your** region’s Vault secrets endpoint. Do not commit real OCIDs into shared repos.

**Related lab:** `06-oci-vault-secrets-resilience-lab.md`

---

## 1. Retrieve secret using OCI CLI (API key auth)

```bash
oci secrets secret-bundle get \
  --secret-id "<YOUR_SECRET_OCID>" \
  --stage CURRENT \
  --query "data.\"secret-bundle-content\".content" \
  --raw-output
```

If the output is base64-encoded, decode:

```bash
echo "<BASE64_VALUE>" | base64 --decode
```

Or in one step (GNU `base64`):

```bash
oci secrets secret-bundle get \
  --secret-id "<YOUR_SECRET_OCID>" \
  --stage CURRENT \
  --query "data.\"secret-bundle-content\".content" \
  --raw-output | base64 --decode
```

---

## 2. Retrieve secret using Python (API key / config file)

Secrets endpoint format: `https://secrets.vaults.<region>.oci.oraclecloud.com` (replace `<region>` with e.g. `ap-mumbai-1`).

```python
import oci
import base64

config = oci.config.from_file()
endpoint = "https://secrets.vaults.<region>.oci.oraclecloud.com"
client = oci.secrets.SecretsClient(config, service_endpoint=endpoint)

secret_id = "<YOUR_SECRET_OCID>"
bundle = client.get_secret_bundle(secret_id).data
encoded = bundle.secret_bundle_content.content
decoded = base64.b64decode(encoded).decode()
print(decoded)
```

---

## 3. Retrieve using instance principals (on OCI Compute)

Requires a **dynamic group** + **policy** allowing `read secret-bundles` for that instance (see `06-oci-vault-secrets-resilience-lab.md`).

```python
import oci
import base64

signer = oci.auth.signers.InstancePrincipalsSecurityTokenSigner()
client = oci.secrets.SecretsClient(
    config={},
    signer=signer,
    service_endpoint="https://secrets.vaults.<region>.oci.oraclecloud.com",
)

secret_id = "<YOUR_SECRET_OCID>"
bundle = client.get_secret_bundle(secret_id).data
decoded = base64.b64decode(bundle.secret_bundle_content.content).decode()
print(decoded)
```

CLI equivalent on the instance (`--auth` must be on the `oci` command, before the pipe):

```bash
oci secrets secret-bundle get \
  --secret-id "<YOUR_SECRET_OCID>" \
  --stage CURRENT \
  --auth instance_principal \
  --query "data.\"secret-bundle-content\".content" \
  --raw-output | base64 --decode
```