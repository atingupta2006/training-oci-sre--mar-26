# ============================================================================
# Deployment Commands for Option-1 (Single VM - Backend + Frontend)
# ============================================================================
# Run these commands manually one at a time after Terraform has created resources
# Note: Terraform user_data already installs Node.js, Git, clones repo, and runs npm install
# ============================================================================

# STEP 1: Get the output details from Terraform outputs

# STEP 2: Connect to the VM via SSH
# Replace YOUR_PUBLIC_IP with the IP from step 1, and YOUR_KEY with your SSH key path
ssh -i ~/.ssh/YOUR_KEY opc@YOUR_VM_PUBLIC_IP

# STEP 3: Once connected to the VM, run the following commands one at a time:
# ============================================================================

# Navigate to project directory (Wait 1 minute after boot for Terraform to clone the repo)
cd /home/opc/training-oci-sre--mar-26/BharatMart-App

# Setup Environment Variables
cp .env.example .env

# Automatically update .env with your VM's public IP
PUBLIC_IP=$(curl -s ifconfig.me)
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$PUBLIC_IP|g" .env
sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://$PUBLIC_IP:3000|g" .env

# Configure firewall and networking
sudo systemctl stop firewalld
sudo systemctl disable firewalld
sudo systemctl stop nftables
sudo systemctl disable nftables

# Enable IP forwarding
sudo sysctl net.ipv4.ip_forward
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
sudo sysctl net.ipv4.ip_forward

# Start backend server (runs on port 3000)
npm run dev:server

# In a new terminal/SSH session, start frontend server (runs on port 80)
# Navigate to project directory again
cd /home/opc/training-oci-sre--mar-26/BharatMart-App
sudo npm run dev -- --host 0.0.0.0 --port 80
