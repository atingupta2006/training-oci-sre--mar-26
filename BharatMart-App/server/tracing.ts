import dotenv from 'dotenv';
dotenv.config();

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

/** Optional exporter headers: comma-separated key=value (values may be URL-encoded). */
function parseOtlpHeaders(): Record<string, string> | undefined {
  const raw = process.env.OTEL_EXPORTER_OTLP_HEADERS;
  if (!raw?.trim()) return undefined;
  const headers: Record<string, string> = {};
  for (const segment of raw.split(',')) {
    const idx = segment.indexOf('=');
    if (idx === -1) continue;
    const key = segment.slice(0, idx).trim();
    let val = segment.slice(idx + 1).trim();
    try {
      val = decodeURIComponent(val);
    } catch {
      // leave raw
    }
    if (key) headers[key] = val;
  }
  return Object.keys(headers).length ? headers : undefined;
}

const serviceName = process.env.OTEL_SERVICE_NAME || 'bharatmart-backend';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (otlpEndpoint) {
  const otlpHeaders = parseOtlpHeaders();
  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({
      url: otlpEndpoint,
      ...(otlpHeaders && { headers: otlpHeaders }),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  try {
    sdk.start();
    console.log(`Tracing: ${serviceName} -> ${otlpEndpoint}`);
  } catch (err) {
    console.error('Tracing init failed:', err);
  }
}
