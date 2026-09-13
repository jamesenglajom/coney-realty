import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IDS = 100;

// Unlike every other public property read (listPublicProperties,
// getPublicPropertyBySlug), this deliberately has no `.in("status", [...])`
// filter — a bookmarked property that's since sold, gone to draft, or been
// archived should still show up on the saved-properties page with its real
// current status, not silently vanish or pretend it's still active. Only a
// genuinely deleted (deleted_at set) property drops off the list.
export async function getPropertiesByIds(ids) {
	const cleanIds = Array.isArray(ids) ? ids.filter((id) => typeof id === "string").slice(0, MAX_IDS) : [];
	if (cleanIds.length === 0) return [];

	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("properties")
		.select("id, slug, title, screen_name, property_type, status, price, city_state, custom_fields, image_urls")
		.in("id", cleanIds)
		.is("deleted_at", null);

	if (error) throw new Error(error.message);

	const byId = new Map((data ?? []).map((property) => [property.id, property]));

	// Preserve the caller's order (storage.js keeps most-recently-saved
	// first) and just drop any id that no longer resolves, rather than
	// erroring the whole page over one stale/removed bookmark.
	return cleanIds
		.map((id) => byId.get(id))
		.filter(Boolean)
		.map((property) => ({
			id: property.id,
			slug: property.slug,
			name: property.screen_name || property.title,
			city: property.city_state,
			price: property.price,
			type: property.property_type,
			status: property.status,
			imageUrl: property.image_urls?.[0] ?? null,
			beds: property.custom_fields?.beds ?? null,
			baths: property.custom_fields?.baths ?? null,
			carpark: property.custom_fields?.carpark ?? null,
			lotAreaSqm: property.custom_fields?.lot?.lot_area_sqm ?? null,
		}));
}
