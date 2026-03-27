############################################################
# variables.tf – All inputs for BharatMart deployment
############################################################

########################
# OCI AUTH (MANDATORY)
########################

variable "tenancy_ocid" {
  description = "OCI Tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI User OCID"
  type        = string
}

variable "fingerprint" {
  description = "API signing key fingerprint"
  type        = string
}

variable "region" {
  description = "OCI Region (e.g. ap-mumbai-1)"
  type        = string
}

variable "private_key_path" {
  description = "Path to private API key (for local Terraform CLI)"
  type        = string
  default     = ""
}

variable "private_key" {
  description = "Raw private key content (for OCI Resource Manager)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "private_key_password" {
  description = "Password for encrypted private key (if any)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "compartment_ocid" {
  description = "Target compartment OCID"
  type        = string
}

########################
# PROJECT SETTINGS
########################

variable "project_name" {
  description = "Name prefix for all BharatMart resources"
  type        = string
  default     = "bharatmart"
}

########################
# SSH
########################

variable "ssh_public_key" {
  description = "SSH public key to inject in compute instances"
  type        = string
}

variable "ssh_ingress_cidr" {
  description = "CIDR allowed for SSH access"
  type        = string
  default     = "0.0.0.0/0"
}

########################
# GITHUB REPO
########################

variable "github_repo_url" {
  description = "Public GitHub repo URL containing BharatMart app (frontend + backend)"
  type        = string
}

variable "app_source_subpath" {
  description = "Directory under the clone root (/opt/bharatmart) where package.json lives. Empty string = app at repo root (e.g. oci-multi-tier-web-app-ecommerce). Use 'BharatMart-App' for github.com/.../training-oci-sre--mar-26."
  type        = string
  default     = ""
}

########################
# ENVIRONMENT VARIABLES (split instead of giant .env)
########################

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase anon key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for auth"
  type        = string
  sensitive   = true
}

variable "admin_email" {
  description = "Initial admin user email"
  type        = string
  default     = "admin@bharatmart.com"
}

variable "admin_password" {
  description = "Initial admin user password"
  type        = string
  sensitive   = true
  default     = "Admin@123"
}

########################
# CHAOS & OBSERVABILITY (backend .env)
########################

variable "chaos_enabled" {
  description = "Enable chaos middleware (CHAOS_ERROR_RATE injected 500s, CHAOS_LATENCY_MS delay). Paths / and /api/health/* are excluded from chaos so LB probes stay healthy."
  type        = bool
  default     = true
}

variable "chaos_latency_ms" {
  description = "Milliseconds to await on each non-health request (0 = no added latency). Health paths excluded in metricsMiddleware."
  type        = number
  default     = 80
}

variable "chaos_error_rate" {
  description = "Probability 0–1 of returning HTTP 500 on non-health routes when chaos_enabled (e.g. 0.1 = 10%). Matches Day-2 CHAOS_ERROR_RATE lab docs."
  type        = number
  default     = 0
}

variable "otel_tracing_enabled" {
  description = "When true, sets OTEL_TRACES_LOG_FILE and OTEL_SERVICE_NAME for the Node backend (NDJSON span file). Matches BharatMart server/tracing.ts."
  type        = bool
  default     = false
}

variable "otel_traces_log_file" {
  description = "Absolute path for span NDJSON (OTEL_TRACES_LOG_FILE). Leave empty to use <app_root>/logs/otel-spans.jsonl (app_root is /opt/bharatmart or /opt/bharatmart/<app_source_subpath>)."
  type        = string
  default     = ""
}

variable "otel_service_name" {
  description = "OTEL_SERVICE_NAME for the backend resource (default bharatmart-backend)."
  type        = string
  default     = "bharatmart-backend"
}

########################
# IMAGE SELECTION
########################

variable "os_version" {
  description = "Oracle Linux version for auto-discovered image"
  type        = string
  default     = "9"
}

variable "use_custom_images" {
  description = "Use custom image IDs instead of auto-discovery"
  type        = bool
  default     = false
}

variable "frontend_custom_image_id" {
  description = "Custom image ID for frontend instances (if use_custom_images = true)"
  type        = string
  default     = null
}

variable "backend_custom_image_id" {
  description = "Custom image ID for backend instances (if use_custom_images = true)"
  type        = string
  default     = null
}

########################
# FRONTEND SETTINGS
########################

variable "frontend_instance_count" {
  description = "Number of frontend instances"
  type        = number
  default     = 1
}

variable "frontend_shape" {
  description = "Compute shape for frontend (e.g. VM.Standard.E5.Flex)"
  type        = string
  default     = "VM.Standard.E5.Flex"
}

variable "frontend_flex_ocpus" {
  description = "OCPUs for frontend flex shape"
  type        = number
  default     = 2
}

variable "frontend_flex_memory_gbs" {
  description = "Memory (GB) for frontend flex shape"
  type        = number
  default     = 12
}

variable "frontend_port" {
  description = "Frontend HTTP port (NGINX)"
  type        = number
  default     = 80
}

########################
# BACKEND (INSTANCE POOL)
########################

variable "backend_shape" {
  description = "Compute shape for backend instance pool nodes"
  type        = string
  default     = "VM.Standard.E5.Flex"
}

variable "backend_flex_ocpus" {
  description = "OCPUs for backend flex shape"
  type        = number
  default     = 2
}

variable "backend_flex_memory_gbs" {
  description = "Memory (GB) for backend flex shape"
  type        = number
  default     = 12
}

variable "backend_api_port" {
  description = "Backend API port"
  type        = number
  default     = 3000
}

variable "backend_lb_health_check_path" {
  description = "HTTP path for the load balancer health check on the backend listener. Default '/' hits Express root (no DB). Use '/api/health' only if you want probes to match Day-2 lab text (depends on Supabase; may mark backends unhealthy if DB is down)."
  type        = string
  default     = "/"
}

variable "backend_pool_initial_size" {
  description = "Initial backend instance pool size"
  type        = number
  default     = 2
}

variable "backend_pool_min_size" {
  description = "Minimum backend pool size"
  type        = number
  default     = 1
}

variable "backend_pool_max_size" {
  description = "Maximum backend pool size"
  type        = number
  default     = 10
}

########################
# AUTOSCALING
########################

variable "backend_cpu_scale_out_threshold" {
  description = "CPU% above which backend should scale out"
  type        = number
  default     = 70
}

variable "backend_cpu_scale_in_threshold" {
  description = "CPU% below which backend should scale in"
  type        = number
  default     = 30
}

########################
# LOAD BALANCER
########################

variable "lb_min_bandwidth_mbps" {
  description = "Min bandwidth (Mbps) for flexible LB"
  type        = number
  default     = 10
}

variable "lb_max_bandwidth_mbps" {
  description = "Max bandwidth (Mbps) for flexible LB"
  type        = number
  default     = 100
}
