import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRICE_BANDS } from "./data";

// Public property data (PLP-equivalent: homepage search/featured sections)
// cached for a day to cut repeat-request load on Supabase, since this is the
// site's highest-traffic, anonymous-access surface. Property mutations
// (properties/actions.js) call revalidateTag(PUBLIC_PROPERTIES_TAG) so
// edits/sold-status changes don't sit stale for the full window.
export const PUBLIC_PROPERTIES_TAG = "public-properties";
const ONE_DAY_SECONDS = 60 * 60 * 24;

// Uses the admin client (not the session-bound one) for two reasons: it
// avoids opening a public RLS policy just for this narrow read, and —
// unlike the session client — it doesn't call the dynamic cookies() API,
// which unstable_cache doesn't allow inside the function it wraps.
async function _listPublishedCityStates() {
	const supabase = createAdminClient();
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

export const listPublishedCityStates = unstable_cache(_listPublishedCityStates, ["list-published-city-states"], {
	revalidate: ONE_DAY_SECONDS,
	tags: [PUBLIC_PROPERTIES_TAG],
});

// Uses the admin client rather than opening up a public RLS policy on
// `users`/`user_info` — those tables hold more than we want exposed by a
// row-level policy, so the trust boundary here is this function's explicit
// column list rather than a correlated RLS rule.
async function _matchListedAgents({ location, type, price } = {}) {
	const supabase = createAdminClient();

	let query = supabase
		.from("properties")
		.select("id, price, user_property(user_id, users(id, email, full_name, user_info(phone, bio, avatar_url)))")
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
					phone: user.user_info?.phone ?? null,
					bio: user.user_info?.bio ?? null,
					avatarUrl: user.user_info?.avatar_url ?? null,
					listingsCount: 1,
				});
			}
		}
	}

	return Array.from(agentsById.values()).sort((a, b) => b.listingsCount - a.listingsCount);
}

export const matchListedAgents = unstable_cache(_matchListedAgents, ["match-listed-agents"], {
	revalidate: ONE_DAY_SECONDS,
	tags: [PUBLIC_PROPERTIES_TAG],
});

// One agent's public profile: contact details plus their currently published,
// non-deleted listings. Powers /agents/[id]. Cached per-request so
// generateMetadata() and the page component don't double-query.
export const getAgentProfile = cache(async function getAgentProfile(id) {
	const supabase = createAdminClient();

	const { data: user, error: userError } = await supabase
		.from("users")
		.select("id, email, full_name, role, user_info(phone, bio, avatar_url)")
		.eq("id", id)
		.is("deleted_at", null)
		.maybeSingle();

	if (userError) throw new Error(userError.message);
	if (!user) return null;

	const { data: links, error: linksError } = await supabase
		.from("user_property")
		.select(
			"properties(id, slug, title, screen_name, property_type, price, city_state, city, region, district, custom_fields, status, deleted_at)",
		)
		.eq("user_id", id);

	if (linksError) throw new Error(linksError.message);

	const listings = (links ?? [])
		.map((link) => link.properties)
		.filter((property) => property && property.status === "published" && !property.deleted_at)
		.map((property) => ({
			id: property.id,
			slug: property.slug,
			name: property.screen_name || property.title,
			city: property.city_state,
			price: property.price,
			type: property.property_type,
			beds: property.custom_fields?.beds ?? null,
			baths: property.custom_fields?.baths ?? null,
			lotAreaSqm: property.custom_fields?.lot?.lot_area_sqm ?? null,
		}));

	return {
		id: user.id,
		name: user.full_name || user.email,
		email: user.email,
		phone: user.user_info?.phone ?? null,
		bio: user.user_info?.bio ?? null,
		avatarUrl: user.user_info?.avatar_url ?? null,
		listings,
	};
});

// "Top agents" for the homepage leaderboard, ranked by real closed-listing
// volume/count instead of the old hardcoded rating — there's no reviews
// table yet, so rating isn't a thing we can compute honestly.
async function _listTopAgents(limit = 8) {
	const supabase = createAdminClient();

	const { data, error } = await supabase
		.from("user_property")
		.select(
			"user_id, users(id, email, full_name, user_info(phone, bio, avatar_url)), properties(price, city_state, status, deleted_at)",
		);

	if (error) throw new Error(error.message);

	const byAgent = new Map();
	for (const row of data ?? []) {
		const property = row.properties;
		if (!property || property.status !== "published" || property.deleted_at) continue;

		const user = row.users;
		if (!user) continue;

		const price = Number(property.price) || 0;
		const existing = byAgent.get(user.id);
		if (existing) {
			existing.deals += 1;
			existing.volume += price;
			if (property.city_state) existing.regions.add(property.city_state);
		} else {
			byAgent.set(user.id, {
				id: user.id,
				name: user.full_name || user.email,
				phone: user.user_info?.phone ?? null,
				bio: user.user_info?.bio ?? null,
				avatarUrl: user.user_info?.avatar_url ?? null,
				deals: 1,
				volume: price,
				regions: new Set(property.city_state ? [property.city_state] : []),
			});
		}
	}

	return Array.from(byAgent.values())
		.map((agent) => ({ ...agent, regions: Array.from(agent.regions) }))
		.sort((a, b) => b.volume - a.volume || b.deals - a.deals)
		.slice(0, limit);
}

export const listTopAgents = unstable_cache(_listTopAgents, ["list-top-agents"], {
	revalidate: ONE_DAY_SECONDS,
	tags: [PUBLIC_PROPERTIES_TAG],
});

// Featured listings for the homepage, with whichever agent (if any) is
// assigned first. Uses the admin client to cross into user_property/users,
// same trust boundary reasoning as matchListedAgents/listTopAgents above.
async function _listFeaturedProperties(limit = 6) {
	const supabase = createAdminClient();

	const { data, error } = await supabase
		.from("properties")
		.select(
			"id, slug, title, screen_name, property_type, price, city_state, custom_fields, user_property(users(id, full_name))",
		)
		.eq("status", "published")
		.is("deleted_at", null)
		.order("price", { ascending: false })
		.limit(limit);

	if (error) throw new Error(error.message);

	return (data ?? []).map((property) => {
		const agent = property.user_property?.[0]?.users ?? null;
		return {
			id: property.id,
			slug: property.slug,
			name: property.screen_name || property.title,
			city: property.city_state,
			price: property.price,
			type: property.property_type,
			beds: property.custom_fields?.beds ?? null,
			baths: property.custom_fields?.baths ?? null,
			lotAreaSqm: property.custom_fields?.lot?.lot_area_sqm ?? null,
			agent: agent ? { id: agent.id, name: agent.full_name } : null,
		};
	});
}

export const listFeaturedProperties = unstable_cache(_listFeaturedProperties, ["list-featured-properties"], {
	revalidate: ONE_DAY_SECONDS,
	tags: [PUBLIC_PROPERTIES_TAG],
});

export const PUBLIC_PROPERTIES_PAGE_SIZE = 12;

// Paginated, filterable catalog for /properties — same public column list
// and location/type/price vocabulary as matchListedAgents above, just
// returning properties themselves (with a total count for pagination)
// instead of the agents attached to them.
async function _listPublicProperties({ city, propertyType, price, page = 1 } = {}) {
	const supabase = createAdminClient();

	let query = supabase
		.from("properties")
		.select(
			"id, slug, title, screen_name, property_type, price, city_state, custom_fields, user_property(users(id, full_name))",
			{ count: "exact" },
		)
		.eq("status", "published")
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (city) query = query.eq("city_state", city);
	if (propertyType) query = query.eq("property_type", propertyType);

	const bandIndex = Number(price);
	const band = bandIndex > 0 ? PRICE_BANDS[bandIndex] : null;
	if (band) {
		query = query.gte("price", band.min);
		if (Number.isFinite(band.max)) query = query.lte("price", band.max);
	}

	const safePage = Math.max(1, Number(page) || 1);
	const from = (safePage - 1) * PUBLIC_PROPERTIES_PAGE_SIZE;
	const to = from + PUBLIC_PROPERTIES_PAGE_SIZE - 1;

	const { data, error, count } = await query.range(from, to);
	if (error) throw new Error(error.message);

	const properties = (data ?? []).map((property) => {
		const agent = property.user_property?.[0]?.users ?? null;
		return {
			id: property.id,
			slug: property.slug,
			name: property.screen_name || property.title,
			city: property.city_state,
			price: property.price,
			type: property.property_type,
			beds: property.custom_fields?.beds ?? null,
			baths: property.custom_fields?.baths ?? null,
			lotAreaSqm: property.custom_fields?.lot?.lot_area_sqm ?? null,
			agent: agent ? { id: agent.id, name: agent.full_name } : null,
		};
	});

	return { properties, total: count ?? 0, page: safePage };
}

export const listPublicProperties = unstable_cache(_listPublicProperties, ["list-public-properties"], {
	revalidate: ONE_DAY_SECONDS,
	tags: [PUBLIC_PROPERTIES_TAG],
});

// One property's public-safe detail (no address_line/lat/lng — those are
// treated as private everywhere else in the app, see PropertyForm) plus its
// assigned agents' contact info, for /property/[slug]. Only ever returns a
// published, non-deleted property — same visibility rule as every other
// public property surface, so a sold/draft/archived slug 404s like it was
// never there. Per-request cache() (not unstable_cache) since it's keyed by
// slug rather than a short list of filter combinations — same choice as
// getAgentProfile above.
export const getPublicPropertyBySlug = cache(async function getPublicPropertyBySlug(slug) {
	const supabase = createAdminClient();

	const { data: property, error } = await supabase
		.from("properties")
		.select(
			"id, slug, title, screen_name, property_type, price, city_state, city, region, district, zone_type, payment_type, payment_terms, custom_fields, user_property(users(id, full_name, email, user_info(phone, avatar_url)))",
		)
		.eq("slug", slug)
		.eq("status", "published")
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	if (!property) return null;

	const { user_property, ...rest } = property;
	const agents = (user_property ?? [])
		.map((link) => link.users)
		.filter(Boolean)
		.map((agent) => ({
			id: agent.id,
			name: agent.full_name || agent.email,
			email: agent.email,
			phone: agent.user_info?.phone ?? null,
			avatarUrl: agent.user_info?.avatar_url ?? null,
		}));

	return {
		...rest,
		name: rest.screen_name || rest.title,
		location: rest.city_state || [rest.city, rest.region, rest.district].filter(Boolean).join(", ") || null,
		beds: rest.custom_fields?.beds ?? null,
		baths: rest.custom_fields?.baths ?? null,
		lotAreaSqm: rest.custom_fields?.lot?.lot_area_sqm ?? null,
		agents,
	};
});

// Real counts for the homepage stats band — replaces the old hardcoded
// marketing numbers (which included a "client rating" with no reviews
// system behind it at all) with what the properties/users tables actually
// contain.
async function _getPublicPropertyStats() {
	const supabase = createAdminClient();

	const [{ data: properties, error: propertiesError }, { count: agentCount, error: agentError }] = await Promise.all([
		supabase.from("properties").select("price, district").eq("status", "published").is("deleted_at", null),
		supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "Agent").is("deleted_at", null),
	]);

	if (propertiesError) throw new Error(propertiesError.message);
	if (agentError) throw new Error(agentError.message);

	const totalValue = (properties ?? []).reduce((sum, property) => sum + (Number(property.price) || 0), 0);
	const districts = new Set((properties ?? []).map((property) => property.district).filter(Boolean));

	return {
		totalListings: properties?.length ?? 0,
		totalValue,
		totalAgents: agentCount ?? 0,
		districtsCovered: districts.size,
	};
}

export const getPublicPropertyStats = unstable_cache(_getPublicPropertyStats, ["public-property-stats"], {
	revalidate: ONE_DAY_SECONDS,
	tags: [PUBLIC_PROPERTIES_TAG],
});

// For the homepage Testimonial section — looks up the quoted agent's current
// name/avatar live, so if they add a real photo later (Settings > Profile)
// it shows up automatically; the quote copy itself stays authored content.
export async function getAgentByEmail(email) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("users")
		.select("full_name, user_info(avatar_url)")
		.ilike("email", email)
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	if (!data) return null;

	return { name: data.full_name, avatarUrl: data.user_info?.avatar_url ?? null };
}
