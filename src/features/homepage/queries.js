import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRICE_BANDS } from "./data";

// Properties already have a public-read RLS policy for published rows, so
// the regular (anon/session) client is the right trust boundary here.
export async function listPublishedCityStates() {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("properties")
		.select("city_state")
		.eq("status", "published")
		.is("deleted_at", null)
		.not("city_state", "is", null);

	if (error) throw new Error(error.message);

	const unique = [...new Set(data.map((row) => row.city_state).filter(Boolean))];
	return unique.sort((a, b) => a.localeCompare(b));
}

// Uses the admin client rather than opening up a public RLS policy on
// `users` — that table holds more than we want exposed by a row-level
// policy, so the trust boundary here is this function's explicit column
// list (id, email, full_name only) rather than a correlated RLS rule.
export async function matchListedAgents({ location, type, price } = {}) {
	const supabase = createAdminClient();

	let query = supabase
		.from("properties")
		.select("id, price, user_property(user_id, users(id, email, full_name))")
		.eq("status", "published")
		.is("deleted_at", null);

	if (location) query = query.eq("city_state", location);
	if (type) query = query.eq("property_type", type);

	const bandIndex = Number(price);
	const band = bandIndex > 0 ? PRICE_BANDS[bandIndex] : null;
	if (band) {
		query = query.gte("price", band.min);
		if (Number.isFinite(band.max)) query = query.lte("price", band.max);
	}

	const { data, error } = await query;
	if (error) throw new Error(error.message);

	const agentsById = new Map();
	for (const property of data ?? []) {
		for (const link of property.user_property ?? []) {
			const user = link.users;
			if (!user) continue;
			const existing = agentsById.get(user.id);
			if (existing) {
				existing.listingsCount += 1;
			} else {
				agentsById.set(user.id, {
					id: user.id,
					name: user.full_name || user.email,
					email: user.email,
					listingsCount: 1,
				});
			}
		}
	}

	return Array.from(agentsById.values()).sort((a, b) => b.listingsCount - a.listingsCount);
}
