import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Bypasses RLS with the service role key. Only import this from Server Actions —
// never from a Server Component that renders user-controllable data, and never
// from anything a Client Component could pull into its bundle.
export function createAdminClient() {
	return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}
