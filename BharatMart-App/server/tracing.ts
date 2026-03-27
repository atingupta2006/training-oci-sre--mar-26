import dotenv from 'dotenv';
dotenv.config();

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { FileSpanExporter } from './otelFileSpanExporter';

const serviceName = process.env.OTEL_SERVICE_NAME || 'bharatmart-backend';
const logFile = process.env.OTEL_TRACES_LOG_FILE?.trim();

if (logFile) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
    }),
    traceExporter: new FileSpanExporter(logFile),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  try {
    sdk.start();
    console.log(`OpenTelemetry: spans -> ${logFile} (${serviceName})`);
  } catch (err) {
    console.error('OpenTelemetry init failed:', err);
  }
} else {
  console.log('OpenTelemetry: off (set OTEL_TRACES_LOG_FILE in .env to enable)');
}
