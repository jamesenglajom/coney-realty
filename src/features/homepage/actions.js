"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const recordContactSchema = z.object({
	visitorEmail: z.string().trim().min(1).email(),
	visitorName: z.string().trim().optional(),
	agentId: z.string().uuid(),
	contactMethod: z.enum(["email", "call"]),
	searchLocation: z.string().trim().optional(),
	searchPropertyType: z.string().trim().optional(),
	searchPriceBand: z.string().trim().optional(),
});

// Public, unauthenticated action — fired when a visitor clicks Email/Call on
// a matched agent. Insert-only and can't read anything back, so there's no
// data-leak surface in exposing this without a session check.
export async function recordAgentContactAction(values) {
	const parsed = recordContactSchema.safeParse(values);
	if (!parsed.success) return { error: "Invalid contact request." };

	const supabase = createAdminClient();
	const { error } = await supabase.from("agent_contact_requests").insert({
		visitor_email: parsed.data.visitorEmail,
		visitor_name: parsed.data.visitorName || null,
		agent_id: parsed.data.agentId,
		contact_method: parsed.data.contactMethod,
		search_location: parsed.data.searchLocation || null,
		search_property_type: parsed.data.searchPropertyType || null,
		search_price_band: parsed.data.searchPriceBand || null,
	});

	if (error) return { error: error.message };
	return { success: true };
}
