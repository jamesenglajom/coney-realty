"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { PUBLIC_PROPERTIES_TAG } from "@/features/homepage/queries";
import { createPropertySchema, updatePropertySchema } from "./schemas";

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
