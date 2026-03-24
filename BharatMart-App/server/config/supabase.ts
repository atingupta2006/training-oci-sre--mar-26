import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { externalCallLatencyMs } from './metrics';
import { getMockSupabaseClient } from './mockSupabase';

// ✅ Load env file based on environment
const envFile = '.env';

dotenv.config({ path: envFile });

console.log('  process.env.ENV_FILE:', process.env.ENV_FILE);
console.log('  process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('  ENV FILE:', envFile);

// ✅ Strict backend-only configuration (NO fallbacks to anon or VITE)
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export let useMemoryFallback = false;

if (!supabaseUrl || !serviceRoleKey || !serviceRoleKey.startsWith('eyJhbGciOi')) {
  console.warn('⚠️ Supabase config missing or invalid. Falling back to local in-memory DB.');
  useMemoryFallback = true;
} else if (supabaseUrl.includes('mock.supabase')) {
  console.warn('⚠️ Mock Supabase URL detected. Falling back to local in-memory DB.');
  useMemoryFallback = true;
}

// ✅ Safe debug logging (no secrets leaked)
console.log('Supabase Backend Config:');
console.log('  ENV FILE:', envFile);
console.log('  URL:', useMemoryFallback ? 'MOCK_IN_MEMORY' : supabaseUrl);
console.log('  Using SERVICE_ROLE_KEY:', useMemoryFallback ? 'false' : 'true');

// ✅ Backend client using SERVICE ROLE only
const supabaseClient = useMemoryFallback ? null : createClient(
  supabaseUrl as string,
  serviceRoleKey as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export function enableMemoryFallback() {
  if (!useMemoryFallback) {
    console.warn('⚠️ Supabase connection failed! Switching to In-Memory Fallback Mode.');
    useMemoryFallback = true;
  }
}

import { SupabaseClient } from '@supabase/supabase-js';
const mockClient = getMockSupabaseClient();

// Wrap supabase client to time all operations
export const supabase: SupabaseClient<any, "public", any> = new Proxy({} as any, {
  get(target, prop) {
    const activeClient = useMemoryFallback ? mockClient : supabaseClient;
    if (!activeClient) return undefined;

    const value = (activeClient as any)[prop];
    if (typeof value === 'object' && value !== null && !useMemoryFallback) {
      return new Proxy(value as any, {
        get(innerTarget: any, innerProp: string | symbol) {
          const innerValue = innerTarget[innerProp];
          if (typeof innerValue === 'function') {
            return function(...args: any[]) {
              const startTime = Date.now();
              const result = (innerValue as Function).apply(innerTarget, args);
              if (result && typeof result.then === 'function') {
                return result.then((res: any) => {
                  const duration = Date.now() - startTime;
                  externalCallLatencyMs.observe({ dependency: 'supabase' }, duration);
                  return res;
                }).catch((err: any) => {
                  const duration = Date.now() - startTime;
                  externalCallLatencyMs.observe({ dependency: 'supabase' }, duration);
                  throw err;
                });
              }
              const duration = Date.now() - startTime;
              externalCallLatencyMs.observe({ dependency: 'supabase' }, duration);
              return result;
            };
          }
          return innerValue;
        }
      });
    }
    return value;
  }
});
