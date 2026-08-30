import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPropertyImage, propertyImagePath } from "@/features/properties/imageFs";
import { getPropertyImageForSeed } from "@/features/homepage/data";

// Public-safe read (used by the /schedule-viewing form) — goes through the
// admin client like the rest of src/features/homepage/queries.js does, with
// the published/not-deleted filter applied explicitly rather than relying on
// the properties table's RLS policy.
export async function listPropertyOptionsForViewingForm() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("properties")
		.select("id, slug, screen_name, title, city_state, price")
		.eq("status", "published")
		.is("deleted_at", null)
		.order("screen_name", { ascending: true });

	if (error) throw new Error(error.message);

	return (data ?? []).map((property) => ({
		id: property.id,
		slug: property.slug,
		name: property.screen_name || property.title,
		city: property.city_state,
		price: property.price,
		// Real photo when one exists — same fallback pool the PLP/PDP use, so
		// a property without photos yet still gets a plausible preview instead
		// of a broken image.
		image: hasPropertyImage(property.slug) ? propertyImagePath(property.slug) : getPropertyImageForSeed(property.id),
	}));
}

const VIEWING_REQUEST_COLUMNS =
	"id, visitor_name, visitor_email, visitor_phone, preferred_date, preferred_time, message, status, created_at, referring_agent:users(id, full_name, email), viewing_request_properties(properties(id, slug, screen_name, title, user_property(users(id, full_name, email))))";

function mapViewingRequestRow(request) {
	return {
		...request,
		referringAgent: request.referring_agent
			? { id: request.referring_agent.id, name: request.referring_agent.full_name || request.referring_agent.email }
			: null,
		properties: (request.viewing_request_properties ?? [])
			.map((row) => row.properties)
			.filter(Boolean)
			.map((property) => ({
				id: property.id,
				slug: property.slug,
				name: property.screen_name || property.title,
				agents: (property.user_property ?? [])
					.map((row) => row.users)
					.filter(Boolean)
					.map((user) => ({ id: user.id, name: user.full_name || user.email })),
			})),
	};
}

export async function listViewingRequests() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("viewing_requests")
		.select(VIEWING_REQUEST_COLUMNS)
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return (data ?? []).map(mapViewingRequestRow);
}

// Scoped to whichever requests this agent was actually referred (via
// referring_agent_id — see src/features/viewings/referral.js), not whatever
// properties they happen to be assigned to. Powers the "Viewing requests"
// section on an Agent's own dashboard, so they see (and can act on) leads
// they're credited for without needing the admin-wide "viewings" permission.
export async function listViewingRequestsForAgent(agentId) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("viewing_requests")
		.select(VIEWING_REQUEST_COLUMNS)
		.eq("referring_agent_id", agentId)
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return (data ?? []).map(mapViewingRequestRow);
}
