import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Public-site contact details, read for the footer. Goes through the admin
// client (the table is deny-by-default RLS) — same convention as the rest
// of the homepage's server-only reads.
export async function getSiteSettings() {
	const supabase = createAdminClient();
	const { data } = await supabase
		.from("site_settings")
		.select("address, contact_number, contact_email")
		.eq("id", true)
		.maybeSingle();

	return {
		address: data?.address ?? null,
		contactNumber: data?.contact_number ?? null,
		contactEmail: data?.contact_email ?? null,
	};
}

export async function getLastKeepAlivePing() {
	const supabase = createAdminClient();
	const { data } = await supabase
		.from("keep_alive_pings")
		.select("triggered_at")
		.order("triggered_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	return data?.triggered_at ?? null;
}
