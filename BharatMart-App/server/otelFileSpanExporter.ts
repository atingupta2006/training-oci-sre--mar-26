import fs from 'fs';
import path from 'path';
import type { HrTime } from '@opentelemetry/api';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';

function hrTimeToMs(hr: HrTime): number {
  return hr[0] * 1e3 + hr[1] / 1e6;
}

/**
 * Appends one JSON object per line (NDJSON) for finished spans.
 */
export class FileSpanExporter implements SpanExporter {
  constructor(private readonly filePath: string) {}

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    try {
      const dir = path.dirname(this.filePath);
      fs.mkdirSync(dir, { recursive: true });
      let chunk = '';
      for (const span of spans) {
        chunk += JSON.stringify(this.toRecord(span)) + '\n';
      }
      fs.appendFileSync(this.filePath, chunk, 'utf8');
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (err) {
      resultCallback({ code: ExportResultCode.FAILED, error: err as Error });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  private toRecord(span: ReadableSpan): Record<string, unknown> {
    const sc = span.spanContext();
    return {
      traceId: sc.traceId,
      spanId: sc.spanId,
      parentSpanId: span.parentSpanId ?? null,
      name: span.name,
      kind: span.kind,
      startTimeMs: hrTimeToMs(span.startTime),
      endTimeMs: hrTimeToMs(span.endTime),
      durationMs: hrTimeToMs(span.duration),
      attributes: span.attributes,
      status: span.status,
      serviceName: span.resource.attributes['service.name'],
    };
  }
}
