# Configuration Files Guide

This directory contains example environment variable configuration files for the BharatMart SRE training platform. All config files are kept synchronized with the codebase requirements.

## 📚 Quick Navigation

- [Main Config Files](#main-configuration-files)
- [Sample Configurations](#sample-configurations) - Scenario-specific configs
- [Which Config Should I Use?](#which-config-should-i-use) - Decision guide
- [Environment Variable Reference](#environment-variable-reference)
- [Usage Instructions](#usage-instructions)
- [Security Considerations](#security-considerations)

---

## Main Configuration Files

These are the primary configuration templates:

| File | Purpose | Use Case |
|------|---------|----------|
| **`backend.env.example`** | Backend API server | Copy to `.env` for backend deployment |
| **`frontend.env.example`** | Frontend React app | Copy to `.env` for frontend deployment |
| **`workers.env.example`** | Background workers | Copy to `.env` for worker processes |

**Quick Start:**
```bash
# Backend
cp config/backend.env.example .env

# Frontend  
cp config/frontend.env.example .env

# Workers
cp config/workers.env.example .env
```

---

## Sample Configurations

The `samples/` directory contains **12 pre-configured environment files** for different deployment scenarios. All files have been recently synchronized with the latest codebase requirements, including observability, chaos engineering, and admin seed variables.

### Development Scenarios

| File | Description | Setup Time | Dependencies |
|------|-------------|------------|--------------|
| **`local-dev-minimal.env`** | Minimal local development (zero dependencies) | 1 minute | None - uses Supabase cloud DB |
| **`local-dev-full.env`** | Full local stack (PostgreSQL + Redis) | 10 minutes | Local PostgreSQL + Redis |

### Single VM Deployments

| File | Description | Use Case | Cost |
|------|-------------|----------|------|
| **`single-vm-basic.env`** | Basic single VM setup | Testing, small deployments | $20-50/month |
| **`single-vm-production.env`** | Production-ready single VM | Small production workloads | $50-100/month |
| **`single-vm-local-stack.env`** | Self-hosted (no external services) | Air-gapped, privacy-first | $20-100/month |

### Multi-Tier Deployments

| File | Description | Infrastructure | Scale |
|------|-------------|----------------|-------|
| **`multi-vm-supabase.env`** | Multi-VM with Supabase DB | 2-10 VMs, Load Balancer | 10K-100K users |
| **`hybrid-supabase-oci.env`** | Supabase DB + OCI compute | Best value combo | 10K-50K users |
| **`kubernetes-production.env`** | Kubernetes deployment | K8s cluster, HPA | 100K+ users |
| **`oci-full-stack.env`** | Complete OCI stack | All OCI services | Enterprise scale |

### Service-Specific Variations

| File | Description | Focus |
|------|-------------|-------|
| **`db-postgresql.env`** | Direct PostgreSQL connection | Custom DB setup |
| **`cache-redis-cluster.env`** | Redis cluster for high availability | High-traffic caching |
| **`workers-bull-redis.env`** | Bull Queue with Redis workers | Advanced job processing |

---

## Which Config Should I Use?

### Decision Tree

```
Are you developing locally?
├─ YES → Need full local stack?
│   ├─ YES → Use: local-dev-full.env (PostgreSQL + Redis)
│   └─ NO  → Use: local-dev-minimal.env (Supabase cloud)
│
└─ NO → What's your deployment target?
    ├─ Single VM
    │   ├─ Production? → Use: single-vm-production.env
    │   ├─ Self-hosted? → Use: single-vm-local-stack.env
    │   └─ Testing? → Use: single-vm-basic.env
    │
    ├─ Multiple VMs
    │   ├─ Using Supabase? → Use: multi-vm-supabase.env
    │   └─ Hybrid setup? → Use: hybrid-supabase-oci.env
    │
    ├─ Kubernetes
    │   └─ Use: kubernetes-production.env
    │
    ├─ Oracle Cloud (OCI)
    │   └─ Use: oci-full-stack.env
    │
    └─ Need specific service config?
        ├─ Direct PostgreSQL? → Use: db-postgresql.env
        ├─ Redis Cluster? → Use: cache-redis-cluster.env
        └─ Advanced Workers? → Use: workers-bull-redis.env
```

### Quick Reference by Scenario

| Your Scenario | Recommended Config | Notes |
|---------------|-------------------|-------|
| **Learning/Testing** | `local-dev-minimal.env` | Fastest setup, no local services |
| **Local Development** | `local-dev-full.env` | Full stack locally |
| **Small Production** | `single-vm-production.env` | Single server deployment |
| **Self-Hosted** | `single-vm-local-stack.env` | No external dependencies |
| **Scalable Production** | `multi-vm-supabase.env` | Multiple VMs, managed DB |
| **Cost-Effective** | `hybrid-supabase-oci.env` | Best value combo |
| **Enterprise** | `kubernetes-production.env` | Full K8s orchestration |
| **OCI Native** | `oci-full-stack.env` | Complete OCI stack |

---

## Usage Instructions

### Step 1: Choose Your Config File

Based on your scenario, copy the appropriate sample file:

```bash
# Example: Using local development minimal
cp config/samples/local-dev-minimal.env .env
```

### Step 2: Edit Environment Variables

Open `.env` and replace placeholder values:

```bash
# Required: Replace these
SUPABASE_URL=https://zdqkotajomqmcfrnxmac.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcWtvdGFqb21xbWNmcm54bWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDc0MTAsImV4cCI6MjA4OTg4MzQxMH0.yloNemspJzogcf20w7nw4CyUlRb8RknH5jqO6Kcy-5k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcWtvdGFqb21xbWNmcm54bWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMwNzQxMCwiZXhwIjoyMDg5ODgzNDEwfQ.xlThdGsWexYFH3nGIUiU6Yd7stt2v3321GITXcAABzA
JWT_SECRET=your-secure-random-64-char-string

# Optional: Enable chaos engineering (for SRE training)
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=100
```

### Step 3: Verify Configuration

Check that all required variables are set:

```bash
# Backend will show errors for missing required variables
npm run dev:server
```

---

## Environment Variable Reference

All config files include the following variable categories:

### Core Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment (development/production) |
| `DEPLOYMENT_MODE` | Yes | `single-vm` | Deployment mode (single-vm/multi-tier/kubernetes) |
| `PORT` | No | `3000` | Server port |
| `HOST` | No | `0.0.0.0` | Server host binding |
| `FRONTEND_URL` | Yes | - | Frontend URL for CORS |

### Database Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_TYPE` | Yes | Database type: `supabase`, `postgresql`, `oci-autonomous` |
| `SUPABASE_URL` | Yes* | Supabase project URL (*if using Supabase) |
| `SUPABASE_ANON_KEY` | Yes* | Supabase anonymous key (*if using Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Supabase service role key - backend only (*if using Supabase) |
| `DATABASE_URL` | Yes* | PostgreSQL connection string (*if using direct PostgreSQL) |
| `POSTGRES_HOST` | Conditional | PostgreSQL host (if using direct PostgreSQL) |
| `POSTGRES_PORT` | Conditional | PostgreSQL port (default: 5432) |
| `POSTGRES_DB` | Conditional | PostgreSQL database name |
| `POSTGRES_USER` | Conditional | PostgreSQL username |
| `POSTGRES_PASSWORD` | Conditional | PostgreSQL password |
| `DATABASE_POOL_MIN` | No | Minimum connection pool size |
| `DATABASE_POOL_MAX` | No | Maximum connection pool size |

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUTH_PROVIDER` | Yes | `supabase` | Auth provider: `supabase`, `local` |
| `JWT_SECRET` | Yes | - | JWT secret key (min 32 chars) |

### Cache Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `CACHE_TYPE` | Yes | Cache type: `memory`, `redis`, `oci-cache` |
| `CACHE_REDIS_URL` | Yes* | Redis cache URL (*if CACHE_TYPE=redis) |
| `CACHE_TTL` | No | Default cache TTL in seconds |
| `CACHE_PREFIX` | No | Cache key prefix |

### Worker Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `WORKER_MODE` | Yes | Worker mode: `in-process`, `bull-queue`, `noop` |
| `WORKER_TYPE` | Conditional | Worker type: `email`, `order`, `payment`, `all` |
| `WORKER_CONCURRENCY` | No | Number of concurrent jobs per worker |
| `QUEUE_REDIS_URL` | Yes* | Queue Redis URL (*if WORKER_MODE=bull-queue) |
| `QUEUE_ATTEMPTS` | No | Number of retry attempts for failed jobs |
| `QUEUE_BACKOFF_DELAY` | No | Backoff delay in milliseconds |

### Logging

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOG_LEVEL` | No | `info` | Log level: `error`, `warn`, `info`, `debug` |
| `LOG_FORMAT` | No | `json` | Log format: `json`, `dev` |
| `LOG_FILE` | No | `./logs/api.log` | Log file path |

### Observability

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_METRICS` | No | `true` | Enable Prometheus metrics |
| `METRICS_PORT` | No | - | Metrics port (uses same port if not set) |

### Chaos Engineering

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CHAOS_ENABLED` | No | `false` | Enable chaos injection (for SRE training) |
| `CHAOS_LATENCY_MS` | No | `0` | Latency injection in milliseconds |

### Frontend Configuration (Vite)

**Note:** All frontend variables require `VITE_` prefix to be accessible in the browser.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_APP_NAME` | No | Application name |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (frontend only) |

### Admin Seed

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_EMAIL` | No | Admin user email (for db:init script) |
| `ADMIN_PASSWORD` | No | Admin user password (for db:init script) |

### Security

| Variable | Required | Description |
|----------|----------|-------------|
| `CORS_ORIGIN` | Yes | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window |
| `SECRETS_PROVIDER` | No | Secrets provider: `env`, `oci-vault` |

---

## Variable Naming Conventions

### Redis URLs

The codebase uses different Redis URL variables depending on the component:

- **Cache:** `CACHE_REDIS_URL` (used by `server/adapters/cache/redis.ts`)
- **Queue:** `QUEUE_REDIS_URL` (used by `server/adapters/workers/bull-queue.ts`)
- **Legacy Fallback:** `REDIS_URL` (used as fallback in some config files)

**Best Practice:** Use specific variables (`CACHE_REDIS_URL`, `QUEUE_REDIS_URL`) for clarity, but `REDIS_URL` will work as a fallback.

### Frontend Variables

All frontend variables **must** have the `VITE_` prefix to be accessible in the browser during build and runtime.

Example:
```bash
# ✅ Correct - accessible in frontend
VITE_API_URL=http://localhost:3000

# ❌ Wrong - not accessible in frontend
API_URL=http://localhost:3000
```

---

## Security Considerations

⚠️ **Critical Security Warnings:**

1. **Never commit `.env` files** to version control (already in `.gitignore`)
2. **Use strong secrets** for production:
   - `JWT_SECRET` - Minimum 32 characters, use cryptographically secure random string
   - `SESSION_SECRET` - Unique random string
3. **Service role keys are backend-only:**
   - `SUPABASE_SERVICE_ROLE_KEY` - Never expose to frontend
   - Use `SUPABASE_ANON_KEY` for frontend instead
4. **Use environment-specific values:**
   - Development: Weak secrets are OK for local testing
   - Production: Must use strong, unique secrets
5. **Consider secrets management:**
   - OCI Vault (set `SECRETS_PROVIDER=oci-vault`)
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault

### Secrets Placeholders

All config files use consistent placeholders:

- `<REPLACE_THIS>` - Must be replaced with actual value
- `<REPLACE_WITH_YOUR_...>` - Descriptive placeholder indicating what to replace
- `<OPTIONAL>` - Optional variable, can be left empty
- `<STORED_IN_K8S_SECRET>` - Value stored in Kubernetes secret (for K8s configs)

---

## Recent Updates

All config files have been **synchronized** (as of 2024-12-19) to include:

✅ **Chaos Engineering** - `CHAOS_ENABLED`, `CHAOS_LATENCY_MS`  
✅ **Admin Seed Variables** - `ADMIN_EMAIL`, `ADMIN_PASSWORD`  
✅ **Consistent Logging** - `LOG_FORMAT`, `LOG_FILE`  
✅ **Frontend Variables** - All `VITE_*` variables where applicable  
✅ **Authentication** - `AUTH_PROVIDER`, `JWT_SECRET` where missing

All variables have been verified against actual code usage in:
- `server/config/*.ts`
- `server/adapters/*/*.ts`
- `server/middleware/*.ts`

---

## Code References

### Backend Configuration

- `server/config/deployment.ts` - Deployment configuration and mode selection
- `server/config/supabase.ts` - Supabase client configuration
- `server/config/redis.ts` - Redis configuration (legacy fallback)
- `server/config/queue.ts` - Queue configuration (legacy fallback)
- `server/config/logger.ts` - Winston logger configuration
- `server/config/metrics.ts` - Prometheus metrics definitions

### Adapters

- `server/adapters/cache/redis.ts` - Redis cache adapter
- `server/adapters/cache/memory.ts` - In-memory cache adapter
- `server/adapters/workers/bull-queue.ts` - Bull queue adapter
- `server/adapters/workers/in-process.ts` - In-process worker adapter
- `server/adapters/database/supabase.ts` - Supabase database adapter
- `server/adapters/database/postgresql.ts` - PostgreSQL database adapter

### Middleware

- `server/middleware/metricsMiddleware.ts` - Metrics and chaos engineering
- `server/middleware/logger.ts` - Request logging
- `server/middleware/auth.ts` - JWT authentication

### Frontend Configuration

- `src/lib/supabase.ts` - Supabase client (uses `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `src/lib/api.ts` - API client (uses `VITE_API_URL`)

---

## Validation

All environment variables in the example files have been verified against actual code usage:

✅ **Backend variables** match `server/config/*.ts` files  
✅ **Frontend variables** match `src/lib/*.ts` files  
✅ **Worker variables** match `server/workers/*.ts` files  
✅ **Adapter variables** match `server/adapters/*/*.ts` files  
✅ **Middleware variables** match `server/middleware/*.ts` files  
✅ **All scenarios** include only relevant variables for their deployment type

---

## Troubleshooting

### Missing Variables

If you see errors about missing environment variables:

1. Check the error message for the missing variable name
2. Refer to this README or the sample config files
3. Ensure the variable is set in your `.env` file
4. Verify variable naming (case-sensitive)

### Variable Not Working

**Frontend variables not accessible:**
- Ensure variable has `VITE_` prefix
- Restart Vite dev server after changing `.env`

**Redis connection issues:**
- Verify `CACHE_REDIS_URL` or `QUEUE_REDIS_URL` is set correctly
- Check Redis server is running
- Test connection: `redis-cli -u $CACHE_REDIS_URL PING`

**Database connection issues:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check database type matches: `DATABASE_TYPE=supabase`
- Test connection with Supabase dashboard

---

## See Also

### Documentation

- 📖 [Environment Variables Reference](../docs/04-configuration/01-environment-variables.md) - Complete variable documentation
- 🏗️ [Deployment Configuration](../docs/04-configuration/06-deployment-configuration.md) - Deployment modes explained
- 🚀 [Quick Start Guide](../docs/01-getting-started/02-quick-start.md) - Get started in minutes
- 🔧 [Database Adapters](../docs/04-configuration/02-database-adapters.md) - Database adapter details
- ⚙️ [Cache Adapters](../docs/04-configuration/03-cache-adapters.md) - Cache configuration
- 👷 [Worker Adapters](../docs/04-configuration/04-worker-adapters.md) - Worker configuration

### Deployment Guides

- 📦 [Local Development](../deployment/terraform/README.md)
- 🖥️ [Single VM Deployment](../deployment/terraform/README.md)
- 🔄 [Multi-Tier Deployment](../deployment/terraform/README.md)
- ☸️ [Kubernetes Deployment](../deployment/terraform/README.md)
- ☁️ [OCI Deployment](../deployment/terraform/README.md)

---

**Last Updated:** 2024-12-19  
**Total Config Files:** 15 (3 main + 12 samples)  
**Status:** ✅ All files synchronized with codebase
