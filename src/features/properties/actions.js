"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
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
		.insert({ ...toColumns(parsed.data), created_by: currentUser.id })
		.select("id")
		.single();

	if (error) {
		return { error: slugConflictMessage(error) };
	}

	const assignError = await syncAssignments(supabase, created.id, parsed.data.assignedUserIds);
	if (assignError) return { error: assignError.message };

	revalidatePath("/admin/properties");
	return { success: true };
}

export async function updatePropertyAction(values) {
	await requirePermission("properties", "edit");

	const parsed = updatePropertySchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("properties").update(toColumns(parsed.data)).eq("id", parsed.data.id);

	if (error) {
		return { error: slugConflictMessage(error) };
	}

	const assignError = await syncAssignments(supabase, parsed.data.id, parsed.data.assignedUserIds);
	if (assignError) return { error: assignError.message };

	revalidatePath("/admin/properties");
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
	return { success: true };
}
