import { Router, Request, Response } from 'express';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { supabase } from '../config/supabase';

const router = Router();

const tracer = trace.getTracer('bharatmart-routes', '1.0.0');

// GET /api/health
// Health check endpoint (liveness probe)
// Returns basic health status with database connectivity check
router.get('/health', async (_req, res) => {
  return tracer.startActiveSpan('health.products_probe', async (span) => {
    span.setAttribute('bharatmart.probe', 'products_table');
    try {
      const startTime = Date.now();

      const { data, error } = await supabase.from('products').select('id').limit(1);

      const responseTime = Date.now() - startTime;
      span.setAttribute('db.response_time_ms', responseTime);

      if (error) {
        console.error('❌ Health check products query failed:', error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        return res.status(500).json({
          ok: false,
          count: 0,
        });
      }

      span.setStatus({ code: SpanStatusCode.OK });
      return res.status(200).json({
        ok: true,
        count: data?.length ?? 0,
      });
    } catch (err) {
      console.error('❌ Unexpected health error:', err);
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      return res.status(500).json({
        ok: false,
        count: 0,
      });
    }
  });
});


router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('products').select('id').limit(1);
    const responseTime = Date.now() - startTime;

    if (error) throw error;

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'ok',
          responseTimeMs: responseTime
        },
        service: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'failed',
          error: (error as Error).message
        },
        service: 'ok',
      },
    });
  }
});

export default router;
