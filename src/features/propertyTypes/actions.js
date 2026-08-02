"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createFieldSetSchema, updateFieldSetSchema } from "./schemas";

function conflictMessage(error) {
	return error.code === "23505" ? "That property type already has a field set — edit it instead." : error.message;
}

export async function createFieldSetAction(values) {
	const currentUser = await requirePermission("propertyTypes", "create");

	const parsed = createFieldSetSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("property_type_field_sets").insert({
		property_type: parsed.data.propertyType,
		fields: parsed.data.fields,
		created_by: currentUser.id,
	});

	if (error) return { error: conflictMessage(error) };

	revalidatePath("/admin/property-types");
	return { success: true };
}

export async function updateFieldSetAction(values) {
	await requirePermission("propertyTypes", "edit");

	const parsed = updateFieldSetSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("property_type_field_sets")
		.update({ property_type: parsed.data.propertyType, fields: parsed.data.fields })
		.eq("id", parsed.data.id);

	if (error) return { error: conflictMessage(error) };

	revalidatePath("/admin/property-types");
	return { success: true };
}

export async function softDeleteFieldSetAction(id) {
	await requirePermission("propertyTypes", "delete");

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("property_type_field_sets")
		.update({ deleted_at: new Date().toISOString() })
		.eq("id", id);

	if (error) return { error: error.message };

	revalidatePath("/admin/property-types");
	return { success: true };
}
