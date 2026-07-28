import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const LIST_COLUMNS =
	"id, title, screen_name, slug, property_type, status, price, city_state, city, region, district, zone_type, payment_type, payment_terms, created_at";
const AGENT_JOIN = "users(id, full_name, user_info(avatar_url))";

// Agents only ever see their own assigned properties — pass their id to
// scope the list; everyone else (Admin/Manager/SAdmin) calls this with no
// argument and sees everything, optionally narrowed by the filter bar
// (city/district/propertyType/zoneType/price range, or picking an agent).
// Either way, each row's assigned agent(s) — for the table's avatar column —
// come along in the same query.
export async function listProperties({
	agentId,
	city,
	district,
	propertyType,
	zoneType,
	priceMin,
	priceMax,
} = {}) {
	const supabase = createAdminClient();

	let query = supabase
		.from("properties")
		.select(
			agentId
				? `${LIST_COLUMNS}, user_property!inner(user_id, ${AGENT_JOIN})`
				: `${LIST_COLUMNS}, user_property(${AGENT_JOIN})`,
		)
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (agentId) query = query.eq("user_property.user_id", agentId);
	if (city) query = query.eq("city", city);
	if (district) query = query.eq("district", district);
	if (propertyType) query = query.eq("property_type", propertyType);
	if (zoneType) query = query.eq("zone_type", zoneType);
	if (priceMin) query = query.gte("price", priceMin);
	if (priceMax) query = query.lte("price", priceMax);

	const { data, error } = await query;
	if (error) throw new Error(error.message);

	return (data ?? []).map((property) => {
		const { user_property, ...rest } = property;
		const assignedAgents = (user_property ?? [])
			.map((link) => link.users)
			.filter(Boolean)
			.map((agent) => ({ id: agent.id, name: agent.full_name, avatarUrl: agent.user_info?.avatar_url ?? null }));

		return { ...rest, assignedAgents };
	});
}

// Distinct city/district/zone_type values currently in use, for the filter
// bar's dropdowns — collected client-side from one row scan rather than
// three separate DISTINCT round-trips (fine at this table's size).
export async function listPropertyFilterOptions() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("properties")
		.select("city, district, zone_type")
		.is("deleted_at", null);

	if (error) throw new Error(error.message);

	const cities = new Set();
	const districts = new Set();
	const zoneTypes = new Set();
	for (const row of data ?? []) {
		if (row.city) cities.add(row.city);
		if (row.district) districts.add(row.district);
		if (row.zone_type) zoneTypes.add(row.zone_type);
	}

	return {
		cities: [...cities].sort((a, b) => a.localeCompare(b)),
		districts: [...districts].sort((a, b) => a.localeCompare(b)),
		zoneTypes: [...zoneTypes].sort((a, b) => a.localeCompare(b)),
	};
}

export async function getPropertyById(id) {
	const supabase = createAdminClient();
	const { data: property, error } = await supabase
		.from("properties")
		.select("*")
		.eq("id", id)
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	if (!property) return null;

	const { data: assignments, error: assignmentsError } = await supabase
		.from("user_property")
		.select("user_id")
		.eq("property_id", id);

	if (assignmentsError) throw new Error(assignmentsError.message);

	return { ...property, assignedUserIds: (assignments ?? []).map((row) => row.user_id) };
}

// For the /property/[slug] preview page — same shape as getPropertyById plus
// the assigned agents' display info (name/email), since the preview shows
// who else (if anyone) is on the listing.
export async function getPropertyBySlug(slug) {
	const supabase = createAdminClient();
	const { data: property, error } = await supabase
		.from("properties")
		.select("*, user_property(user_id, users(id, full_name, email))")
		.eq("slug", slug)
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	if (!property) return null;

	const { user_property, ...rest } = property;
	const assignedAgents = (user_property ?? []).map((link) => link.users).filter(Boolean);

	return { ...rest, assignedUserIds: assignedAgents.map((agent) => agent.id), assignedAgents };
}

// Powers the agent dashboard: counts by status among their assigned
// properties, plus sold count/volume for the current calendar month and
// lifetime, using `sold_at` (set by updatePropertyAction on the
// draft/published -> sold transition).
export async function getAgentPropertyStats(agentId) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("user_property")
		.select("properties(id, price, status, sold_at, deleted_at)")
		.eq("user_id", agentId);

	if (error) throw new Error(error.message);

	const properties = (data ?? []).map((row) => row.properties).filter((property) => property && !property.deleted_at);

	const byStatus = { draft: 0, published: 0, sold: 0, archived: 0 };
	let lifetimeSoldCount = 0;
	let lifetimeSoldVolume = 0;
	let monthCount = 0;
	let monthVolume = 0;

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

	for (const property of properties) {
		if (byStatus[property.status] !== undefined) byStatus[property.status] += 1;

		if (property.status === "sold") {
			const price = Number(property.price) || 0;
			lifetimeSoldCount += 1;
			lifetimeSoldVolume += price;
			if (property.sold_at && new Date(property.sold_at) >= monthStart) {
				monthCount += 1;
				monthVolume += price;
			}
		}
	}

	return {
		totalAssigned: properties.length,
		byStatus,
		thisMonth: { count: monthCount, volume: monthVolume },
		lifetime: { count: lifetimeSoldCount, volume: lifetimeSoldVolume },
	};
}

export async function listAssignableUsers() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("users")
		.select("id, full_name, email, role")
		.is("deleted_at", null)
		.order("full_name", { ascending: true });

	if (error) throw new Error(error.message);
	return data;
}
