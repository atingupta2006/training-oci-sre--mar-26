"""Example: retrieve a Vault secret using API key config (~/.oci/config). Set SECRET_OCID and region."""
import os
import oci
import base64

SECRET_OCID = os.environ.get("SECRET_OCID", "<YOUR_SECRET_OCID>")
REGION = os.environ.get("OCI_REGION", "ap-mumbai-1")

config = oci.config.from_file()
endpoint = f"https://secrets.vaults.{REGION}.oci.oraclecloud.com"
client = oci.secrets.SecretsClient(config, service_endpoint=endpoint)

bundle = client.get_secret_bundle(SECRET_OCID).data
encoded = bundle.secret_bundle_content.content
print(base64.b64decode(encoded).decode())
