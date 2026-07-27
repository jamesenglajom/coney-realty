import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Listing/reading other users' full records is an elevated operation already
// gated by requirePermission() at the page level, so this goes through the
// admin client (bypasses RLS) rather than the per-user session client.

export async function listUsers({ query } = {}) {
	const supabase = createAdminClient();
	let request = supabase
		.from("users")
		.select("id, email, full_name, role, created_at")
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (query) {
		const escaped = query.replace(/[%_]/g, (match) => `\\${match}`);
		request = request.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%`);
	}

	const { data, error } = await request;
	if (error) throw new Error(error.message);
	return data;
}

// For the create-user form's live duplicate check. Deliberately does NOT
// filter by deleted_at — a soft-deleted user's Supabase Auth account still
// exists and still owns that email, so checking only non-deleted rows would
// tell an admin an email is free when auth.admin.createUser would still
// reject it.
export async function getUserByEmail(email) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("users")
		.select("id, email, full_name, role, deleted_at")
		.ilike("email", email)
		.maybeSingle();

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
