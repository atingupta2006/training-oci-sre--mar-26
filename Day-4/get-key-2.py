"""Example: retrieve a Vault secret using instance principal on OCI Compute. Set SECRET_OCID and region."""
import os
import oci
import base64

SECRET_OCID = os.environ.get("SECRET_OCID", "<YOUR_SECRET_OCID>")
REGION = os.environ.get("OCI_REGION", "ap-mumbai-1")

signer = oci.auth.signers.InstancePrincipalsSecurityTokenSigner()
client = oci.secrets.SecretsClient(
    config={},
    signer=signer,
    service_endpoint=f"https://secrets.vaults.{REGION}.oci.oraclecloud.com",
)

bundle = client.get_secret_bundle(SECRET_OCID).data
print(base64.b64decode(bundle.secret_bundle_content.content).decode())
