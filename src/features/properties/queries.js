import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listProperties() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("properties")
		.select(
			"id, title, slug, property_type, status, price, city_state, city, region, district, zone_type, payment_type, payment_terms, created_at",
		)
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data;
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
