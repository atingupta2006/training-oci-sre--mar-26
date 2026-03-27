import { context, trace } from '@opentelemetry/api';

/** Fields to merge into structured logs so api.log can be grep’d next to otel-spans.jsonl by trace_id. */
export function getActiveTraceLogFields(): Record<string, string> {
  const sc = trace.getSpan(context.active())?.spanContext();
  if (!sc?.traceId) return {};
  return { trace_id: sc.traceId, span_id: sc.spanId };
}
