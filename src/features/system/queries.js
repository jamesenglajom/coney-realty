import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

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
