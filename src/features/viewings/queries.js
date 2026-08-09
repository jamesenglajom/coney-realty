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
	"id, visitor_name, visitor_email, visitor_phone, preferred_date, preferred_time, message, status, created_at, viewing_request_properties(properties(id, slug, screen_name, title, user_property(users(id, full_name, email))))";

function mapViewingRequestRow(request) {
	return {
		...request,
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

// Scoped to whatever properties this agent is assigned to (via user_property)
// — powers the "Viewing requests" section on an Agent's own dashboard, so
// they see (and can act on) requests naming their listings without needing
// the admin-wide "viewings" page permission.
export async function listViewingRequestsForAgent(agentId) {
	const supabase = createAdminClient();

	const { data: assigned, error: assignedError } = await supabase
		.from("user_property")
		.select("property_id")
		.eq("user_id", agentId);
	if (assignedError) throw new Error(assignedError.message);

	const propertyIds = (assigned ?? []).map((row) => row.property_id);
	if (propertyIds.length === 0) return [];

	const { data: joins, error: joinsError } = await supabase
		.from("viewing_request_properties")
		.select("viewing_request_id")
		.in("property_id", propertyIds);
	if (joinsError) throw new Error(joinsError.message);

	const requestIds = [...new Set((joins ?? []).map((row) => row.viewing_request_id))];
	if (requestIds.length === 0) return [];

	const { data, error } = await supabase
		.from("viewing_requests")
		.select(VIEWING_REQUEST_COLUMNS)
		.in("id", requestIds)
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return (data ?? []).map(mapViewingRequestRow);
}
