import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestTotal, chaosEventsTotal, simulatedLatencyMs } from '../config/metrics';

export async function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const statusCode = res.statusCode.toString();

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });
  });

  const chaosEnabled = process.env.CHAOS_ENABLED === 'true';
  const chaosLatencyMs = parseInt(process.env.CHAOS_LATENCY_MS || '0', 10);
  const chaosErrorRate = parseFloat(process.env.CHAOS_ERROR_RATE || '0');

  // Never delay LB health probes or liveness paths (OCI + Supabase timeouts already stress /api/health)
  const skipChaos =
    req.path === '/' ||
    req.path === '/api/health' ||
    req.path.startsWith('/api/health/');

  const rate = Number.isFinite(chaosErrorRate) ? Math.min(Math.max(chaosErrorRate, 0), 1) : 0;
  if (!skipChaos && chaosEnabled && rate > 0 && Math.random() < rate) {
    chaosEventsTotal.inc();
    res.status(500).json({ error: 'Chaos: simulated server error' });
    return;
  }

  if (!skipChaos && chaosLatencyMs > 0) {
    simulatedLatencyMs.set(chaosLatencyMs);
    await new Promise(resolve => setTimeout(resolve, chaosLatencyMs));
  }

  next();
}
