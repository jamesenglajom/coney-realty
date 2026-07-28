"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission, requireUser } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { PUBLIC_PROPERTIES_TAG } from "@/features/homepage/queries";
import { createPropertySchema, updatePropertySchema } from "./schemas";

const NOMINATIM_USER_AGENT = "ConeyRealty-Admin-PropertyForm/1.0 (internal admin tool, occasional lookups only)";

function firstNonEmpty(...values) {
	for (const value of values) {
		if (value) return value;
	}
	return "";
}

async function fetchWithRetry(url, options, attempts = 3) {
	let lastError;
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			const response = await fetch(url, options);
			if (!response.ok) throw new Error(`Nominatim responded ${response.status}`);
			return await response.json();
		} catch (error) {
			lastError = error;
			if (attempt < attempts - 1) {
				await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
			}
		}
	}
	throw lastError;
}

// Reverse-geocodes lat/lng into address/city/region/district via OSM's free
// Nominatim endpoint (no API key, but rate-limited to ~1 req/sec and
// requires an identifying User-Agent per their usage policy) — fine for an
// admin form used occasionally, not for bulk lookups. Run server-side rather
// than fetched from the browser: Node's fetch can set a real User-Agent,
// which browser fetch can't override. Gated by requireUser() only (not a
// page permission) since it's a read-only third-party lookup, not a
// mutation — the bar is just "signed in", matching every property form this
// is used from.
export async function reverseGeocodeAction(lat, lng) {
	await requireUser();

	const latNum = Number(lat);
	const lngNum = Number(lng);
	if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
		return { error: "Enter valid latitude and longitude first." };
	}

	const url = `https://nominatim.openstreetmap.org/reverse?lat=${latNum}&lon=${lngNum}&format=jsonv2&addressdetails=1`;

	let result;
	try {
		result = await fetchWithRetry(url, { headers: { "User-Agent": NOMINATIM_USER_AGENT } });
	} catch {
		return { error: "Couldn't reach the geocoding service. Try again in a moment." };
	}

	if (!result || result.error) {
		return { error: "No address found for that location." };
	}

	// Nominatim's address object has no fixed keys — what's present depends
	// on how OSM data is tagged in that specific area (dense urban vs. rural,
	// country-specific admin levels), so each field is a fallback chain
	// rather than a direct key lookup. These chains are tuned for Philippine
	// addresses (our only market); revisit if this app ever covers other
	// countries — a rural PH lookup returns town/village where an urban one
	// returns city/suburb.
	const address = result.address ?? {};
	const cityName = firstNonEmpty(address.city, address.town, address.municipality, address.village);
	// Our schema has no separate province field — existing seeded data folds
	// it into `city` as "City, Province" whenever the location isn't the
	// province's namesake city (e.g. "Samal, Davao del Norte"), and Nominatim
	// only returns a `state` (province) for those non-namesake cases, so this
	// reproduces that convention rather than inventing a new one.
	const province = firstNonEmpty(address.state);
	const city = province ? `${cityName}, ${province}` : cityName;
	const region = firstNonEmpty(address.region, address.state);
	const district = firstNonEmpty(address.city_district, address.suburb, address.county, address.village);

	return {
		success: true,
		addressLine: firstNonEmpty(result.display_name),
		city,
		region,
		district,
	};
}

function toNumberOrNull(value) {
	if (value === undefined || value === null || value === "") return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
}

function toCustomFields(value) {
	if (!value) return {};
	try {
		const parsed = JSON.parse(value);
		return typeof parsed === "object" && parsed !== null ? parsed : {};
	} catch {
		return {};
	}
}

function toColumns(data) {
	return {
		title: data.title,
		screen_name: data.screenName || null,
		slug: data.slug,
		property_type: data.propertyType,
		status: data.status,
		price: toNumberOrNull(data.price),
		address_line: data.addressLine || null,
		city_state: data.cityState || null,
		city: data.city || null,
		region: data.region || null,
		district: data.district || null,
		zone_type: data.zoneType || null,
		payment_type: data.paymentType || null,
		payment_terms: data.paymentTerms || null,
		lat: toNumberOrNull(data.lat),
		lng: toNumberOrNull(data.lng),
		custom_fields: toCustomFields(data.customFields),
	};
}

async function syncAssignments(supabase, propertyId, userIds) {
	const { error: deleteError } = await supabase.from("user_property").delete().eq("property_id", propertyId);
	if (deleteError) return deleteError;
	if (userIds.length === 0) return null;

	const rows = userIds.map((userId) => ({ property_id: propertyId, user_id: userId }));
	const { error: insertError } = await supabase.from("user_property").insert(rows);
	return insertError ?? null;
}

function slugConflictMessage(error) {
	return error.code === "23505" ? "That slug is already in use." : error.message;
}

export async function createPropertyAction(values) {
	const currentUser = await requirePermission("properties", "create");

	const parsed = createPropertySchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { data: created, error } = await supabase
		.from("properties")
		.insert({
			...toColumns(parsed.data),
			sold_at: parsed.data.status === "sold" ? new Date().toISOString() : null,
			created_by: currentUser.id,
		})
		.select("id")
		.single();

	if (error) {
		return { error: slugConflictMessage(error) };
	}

	const assignError = await syncAssignments(supabase, created.id, parsed.data.assignedUserIds);
	if (assignError) return { error: assignError.message };

	revalidatePath("/admin/properties");
	revalidateTag(PUBLIC_PROPERTIES_TAG);
	return { success: true };
}

export async function updatePropertyAction(values) {
	await requirePermission("properties", "edit");

	const parsed = updatePropertySchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();

	// sold_at tracks the moment status *becomes* 'sold' (for "this month's
	// sales" stats) — set once on that transition, cleared if status moves
	// away from 'sold', left untouched on any other edit to an already-sold
	// property.
	const { data: existing, error: existingError } = await supabase
		.from("properties")
		.select("status, sold_at")
		.eq("id", parsed.data.id)
		.maybeSingle();
	if (existingError) return { error: existingError.message };

	let soldAt = existing?.sold_at ?? null;
	if (parsed.data.status === "sold" && existing?.status !== "sold") soldAt = new Date().toISOString();
	else if (parsed.data.status !== "sold") soldAt = null;

	const { error } = await supabase
		.from("properties")
		.update({ ...toColumns(parsed.data), sold_at: soldAt })
		.eq("id", parsed.data.id);

	if (error) {
		return { error: slugConflictMessage(error) };
	}

	const assignError = await syncAssignments(supabase, parsed.data.id, parsed.data.assignedUserIds);
	if (assignError) return { error: assignError.message };

	revalidatePath("/admin/properties");
	revalidateTag(PUBLIC_PROPERTIES_TAG);
	return { success: true };
}

// One-click "Mark as sold" from the properties table, without opening the
// full edit form. Gated the same as any other property edit (SAdmin/Admin/
// Manager have properties:edit=true; Agent doesn't), which is exactly the
// SAdmin/Admin/Manager-only rule this button needs — no new permission
// entries required. Takes an explicit sold date (a sale may have closed
// before it's entered into the system) rather than always stamping "now".
export async function markPropertySoldAction(id, soldDate) {
	await requirePermission("properties", "edit");

	const parsedDate = soldDate ? new Date(soldDate) : new Date();
	if (Number.isNaN(parsedDate.getTime())) return { error: "Enter a valid sold date." };

	const supabase = createAdminClient();
	const { data: existing, error: fetchError } = await supabase
		.from("properties")
		.select("id")
		.eq("id", id)
		.is("deleted_at", null)
		.maybeSingle();

	if (fetchError) return { error: fetchError.message };
	if (!existing) return { error: "Property not found." };

	const { error } = await supabase
		.from("properties")
		.update({ status: "sold", sold_at: parsedDate.toISOString() })
		.eq("id", id);

	if (error) return { error: error.message };

	revalidatePath("/admin/properties");
	revalidateTag(PUBLIC_PROPERTIES_TAG);
	return { success: true };
}

// Undo for an accidental "Mark sold" — reverts to published and clears
// sold_at. Only acts if the property is currently sold, so it can't
// clobber some other status via a stale/duplicate click.
export async function unmarkPropertySoldAction(id) {
	await requirePermission("properties", "edit");

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("properties")
		.update({ status: "published", sold_at: null })
		.eq("id", id)
		.eq("status", "sold");

	if (error) return { error: error.message };

	revalidatePath("/admin/properties");
	revalidateTag(PUBLIC_PROPERTIES_TAG);
	return { success: true };
}

export async function softDeletePropertyAction(id) {
	await requirePermission("properties", "delete");

	const supabase = createAdminClient();
	const { error } = await supabase.from("properties").update({ deleted_at: new Date().toISOString() }).eq("id", id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/admin/properties");
	revalidateTag(PUBLIC_PROPERTIES_TAG);
	return { success: true };
}
