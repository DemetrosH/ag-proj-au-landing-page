import { createClient } from '@supabase/supabase-js';

/**
 * Admin client using the Service Role Key to bypass RLS.
 * Useful for background synchronization tasks.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
