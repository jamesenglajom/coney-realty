import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Listing/reading other users' full records is an elevated operation already
// gated by requirePermission() at the page level, so this goes through the
// admin client (bypasses RLS) rather than the per-user session client.

export async function listUsers() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("users")
		.select("id, email, full_name, role, created_at")
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data;
}

export async function getUserById(id) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("users")
		.select("id, email, full_name, role, created_at")
		.eq("id", id)
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	return data;
}
