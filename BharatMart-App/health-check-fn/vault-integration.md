 # Vault integration — health-check function
 
 Practical runbook: secure the `health-check` function with OCI Vault and Resource Principal.
 
 Quick summary
 - Use Resource Principal so the function authenticates to OCI without API keys.
 - Store secret values in Vault; save only the secret OCID in function config.
 - Grant a dynamic group read permission to secrets in the compartment.
 
 What is a Resource Principal
 -----------------------------------
 Resource Principal is an OCI authentication method that lets a running OCI service (Functions, Instances, etc.) call OCI APIs on its own behalf. It avoids embedding keys and uses short-lived service credentials.
 
 When to use it
 - Use Resource Principal for deployed functions
 - For local testing use user credentials (`oci` CLI) and set `SECRET_OCID` locally.
 
 1) Variables (example)
 ```bash
 COMPARTMENT_OCID="ocid1.compartment.oc1..example"
 APP_NAME="bharatmart-app"                 # Fn Application name
 FUNCTION_NAME="health-check"             # Fn function name
 SECRET_OCID="ocid1.vaultsecret.oc1..xxx" # Secret created in Vault
 DYNAMIC_GROUP_NAME="dg-fn-healthchecks"
 ```
 
 2) Create a dynamic group (console preferred)
 - Console: Identity → Dynamic Groups → Create Dynamic Group.
 - Matching rule: paste a rule that selects your function resource principals.
   (Use the Console helper — it offers templates for Functions resource principals.)
 
 CLI (advanced / placeholder):
 ```bash
 # NOTE: customize MATCHING_RULE per your environment
 MATCHING_RULE="principal.type = 'RESOURCE_PRINCIPAL' and request.context.principalName = 'fn/<your-application>/<your-function>'"
 oci iam dynamic-group create --name "$DYNAMIC_GROUP_NAME" --matching-rule "$MATCHING_RULE" --description "DG for functions to read vault secrets"
 ```
 
 3) Create a policy to allow the dynamic group to read secrets
 ```
 Allow dynamic-group <DYNAMIC_GROUP_NAME> to read secret-family in compartment <COMPARTMENT_OCID>
 Allow dynamic-group <DYNAMIC_GROUP_NAME> to use vaults in compartment <COMPARTMENT_OCID>
 ```
 
 4) Verify dynamic group and policy
 
 5) Set the secret OCID on the function (store OCID only)
 ```bash
 fn config function $APP_NAME $FUNCTION_NAME SECRET_OCID "$SECRET_OCID"
 fn config function $APP_NAME $FUNCTION_NAME REQUEST_TIMEOUT "5"
 fn config function $APP_NAME $FUNCTION_NAME RETRIES "1"
 fn config function $APP_NAME $FUNCTION_NAME BACKOFF_SECONDS "1.0"
 fn config function $APP_NAME $FUNCTION_NAME LATENCY_THRESHOLD_MS "1000"
 fn config function $APP_NAME $FUNCTION_NAME ORDERS_FAILED_THRESHOLD "0"
 ```
 
 6) Deploy or redeploy function
 ```bash
 cd health-check-fn
 fn build
 fn deploy --app $APP_NAME
 ```
 
 7) Test (invoke)
 ```bash
 # invoke and view the JSON response
 fn invoke $APP_NAME $FUNCTION_NAME
 # list invocations
 fn list calls $APP_NAME $FUNCTION_NAME
 # inspect a specific call (replace <call-id>)
 fn get call <call-id>
 ```
 
 Code snippet — Resource Principal retrieval (drop into `func.py`)
 -----------------------------------------------------------------
 ```python
 import os, base64
 import oci

 SECRET_OCID = os.getenv("SECRET_OCID")
 signer = oci.auth.signers.get_resource_principals_signer()
 secrets_client = oci.secrets.SecretsClient(config={}, signer=signer)
 resp = secrets_client.get_secret_bundle(secret_id=SECRET_OCID)
 content = resp.data.secret_bundle_content.content
 secret_value = base64.b64decode(content).decode("utf-8")
 # use secret_value and then clear it: del secret_value
 ```
 
 Debugging & troubleshooting commands
 ------------------------------------
 1) Manually retrieve secret with your user credentials (quick check).
 ```bash
 oci secrets secret-bundle get --secret-id $SECRET_OCID --query "data.\"secret-bundle-content\".content" --raw-output | base64 --decode
 ```
 2) Check function invocation output and logs
 ```bash
 fn invoke $APP_NAME $FUNCTION_NAME
 fn list calls $APP_NAME $FUNCTION_NAME
 fn get call <call-id>
 ```
 3) Verify dynamic group / policy existence
 ```bash
 oci iam dynamic-group get --dynamic-group-id <dynamic-group-ocid>
 oci iam policy list --compartment-id $COMPARTMENT_OCID
 ```
 4) If Resource Principal calls fail, check function logs for errors and use manual secret fetch to isolate:
 - If manual CLI fetch works but function fails, it's an IAM/dynamic-group issue.
 - If manual fetch fails, validate SECRET_OCID and Vault state.
 
 Common error patterns and fixes
 --------------------------------
 - "Not authorized" / 403: Verify policy statements and that the dynamic group matching rule actually matches the function's resource principal.
 - "Secret not found": Confirm SECRET_OCID is correct and secret is in same compartment or policy covers the compartment.
 - "Base64 decode error": Verify secret encoding (plain vs base64) when storing secret.
 
 Local testing tips
 ------------------
 - For local tests use `oci` CLI with your user API keys:
   ```bash
   export SECRET_OCID="ocid1.vaultsecret.oc1..xxx"
   oci secrets secret-bundle get --secret-id $SECRET_OCID --query "data.\"secret-bundle-content\".content" --raw-output | base64 --decode
   ```
 - You can also set `SECRET_OCID` in `health-check-fn/.env` and run the local Python test:
   ```bash
   python3 -c "from func import handler; import json; print(json.loads(handler(None,None).data))"
   ```
 
 Security checklist
 -------------------------
 - Store OCIDs in function config, never secret values.
 - Restrict dynamic group to only the function principals you need.
 - Clear secret values from memory after use.
 - Do not print secrets or pass them on command lines.
 
 Extra: how to find function OCID (useful when creating matching rule)
 -------------------------------------------------------------------
 ```bash
 oci functions function list --application-id <application-ocid> --compartment-id $COMPARTMENT_OCID
 ```
 Use the function OCID as input if you craft a precise matching rule for the dynamic group.
