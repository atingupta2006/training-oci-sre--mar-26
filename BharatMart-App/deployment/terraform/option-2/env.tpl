# env.tpl – BharatMart shared .env template
NODE_ENV=production
DEPLOYMENT_MODE=oci

# ===== DATABASE (SUPABASE) =====
DATABASE_TYPE=supabase
SUPABASE_URL=${supabase_url}
SUPABASE_ANON_KEY=${supabase_anon_key}
SUPABASE_SERVICE_ROLE_KEY=${supabase_service_role_key}

# ===== AUTH =====
AUTH_PROVIDER=supabase
JWT_SECRET=${jwt_secret}

# ===== SERVER =====
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=http://${lb_ip}
CORS_ORIGIN=*

# ===== WORKERS (OPTIONAL, DISABLED) =====
WORKER_MODE=none
QUEUE_REDIS_URL=

# ===== CACHE =====
CACHE_TYPE=memory

# ===== LOGGING =====
LOG_LEVEL=debug
LOG_FORMAT=json
LOG_FILE=./logs/api.log

# ===== METRICS =====
ENABLE_METRICS=true

# ===== FRONTEND (VITE) =====
VITE_API_URL=http://${lb_ip}:3000
VITE_APP_NAME=BharatMart
VITE_SUPABASE_URL=${supabase_url}
VITE_SUPABASE_ANON_KEY=${supabase_anon_key}

# ===== ADMIN SEED =====
ADMIN_EMAIL=${admin_email}
ADMIN_PASSWORD=${admin_password}

%{ if otel_tracing_enabled ~}
# ===== OTEL (see server/tracing.ts; optional headers for OCI APM) =====
OTEL_SERVICE_NAME=${otel_service_name}
OTEL_EXPORTER_OTLP_ENDPOINT=${otel_otlp_endpoint}
OTEL_TRACES_SAMPLER=${otel_traces_sampler}
%{ if otel_exporter_otlp_headers != "" ~}
OTEL_EXPORTER_OTLP_HEADERS=${otel_exporter_otlp_headers}
%{ endif ~}
%{ endif ~}

# ===== CHAOS (LB-safe: skips / and /api/health/*) — see CHAOS_ERROR_RATE in docs/04-configuration/01-environment-variables.md =====
CHAOS_ENABLED=${chaos_enabled}
CHAOS_LATENCY_MS=${chaos_latency_ms}
CHAOS_ERROR_RATE=${chaos_error_rate}
