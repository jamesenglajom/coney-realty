import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listAgentContactRequests() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("agent_contact_requests")
		.select(
			"id, visitor_email, contact_method, search_location, search_property_type, search_price_band, created_at, agent:agent_id(id, full_name, email)",
		)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data;
}
