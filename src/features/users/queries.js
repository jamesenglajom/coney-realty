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
		.select("id, email, full_name, role, created_at, user_info(phone, bio, avatar_url)")
		.eq("id", id)
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	if (!data) return null;

	const { user_info, ...user } = data;
	return {
		...user,
		phone: user_info?.phone ?? "",
		bio: user_info?.bio ?? "",
		avatarUrl: user_info?.avatar_url ?? "",
	};
}
