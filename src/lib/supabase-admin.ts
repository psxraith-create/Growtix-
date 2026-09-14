import { createClient, SupabaseClient } from "@supabase/supabase-js"

let cachedClient: SupabaseClient | null = null

/**
 * Lazily creates the Supabase admin (service role) client.
 *
 * The client is only instantiated when a route handler actually runs, so
 * importing this module during build-time page-data collection never
 * triggers "supabaseUrl is required" when env vars are absent.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Database not configured")
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return cachedClient
}