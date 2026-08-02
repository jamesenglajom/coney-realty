import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listFieldSets() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("property_type_field_sets")
		.select("id, property_type, fields, created_at, updated_at")
		.is("deleted_at", null)
		.order("property_type", { ascending: true });

	if (error) throw new Error(error.message);
	return data;
}

export async function getFieldSetById(id) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("property_type_field_sets")
		.select("id, property_type, fields")
		.eq("id", id)
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	return data;
}

// { [propertyType]: fields[] } for every property type with an active field
// set — what PropertyForm reads to decide which structured inputs to show
// for the currently selected type. Property types with no configured set
// simply fall back to the freeform JSON textarea, same as before this
// feature existed.
export async function getActiveFieldSetsByType() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("property_type_field_sets")
		.select("property_type, fields")
		.is("deleted_at", null);

	if (error) throw new Error(error.message);

	return Object.fromEntries((data ?? []).map((row) => [row.property_type, row.fields ?? []]));
}
