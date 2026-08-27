import { createClient } from '@supabase/supabase-js'

// Клиент с service role — только для серверных actions, никогда не передавать клиенту
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
