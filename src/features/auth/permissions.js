import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ACTION_TO_COLUMN = {
	view: "can_view",
	create: "can_create",
	edit: "can_edit",
	delete: "can_delete",
};

// Cached per-request: every requireUser()/requirePermission() call on the same
// page render reuses one lookup instead of re-querying Supabase per call.
export const getCurrentUser = cache(async function getCurrentUser() {
	const supabase = await createClient();
	const {
		data: { user: authUser },
	} = await supabase.auth.getUser();

	if (!authUser) return null;

	// user_info reads go through the admin client everywhere else in this
	// codebase (see features/users/queries.js) since RLS denies it by
	// default — the session client got the plain `users` columns fine, but
	// would silently come back with a null user_info embed here. Safe to
	// bypass RLS for this one row: authUser.id comes from the verified
	// session, not client-supplied input, so this only ever reads the
	// caller's own profile.
	const { data: profile } = await createAdminClient()
		.from("users")
		.select("id, email, full_name, role, user_info(avatar_url)")
		.eq("id", authUser.id)
		.is("deleted_at", null)
		.maybeSingle();

	if (!profile) return null;

	const { user_info, ...rest } = profile;
	return {
		...rest,
		avatarUrl: user_info?.avatar_url ?? "",
		// Set on new/reset accounts (see features/users/actions.js) — mirrors
		// the same flag src/proxy.js reads off the JWT to lock the account to
		// the Account > Change Password tab until they set their own password.
		mustChangePassword: Boolean(authUser.app_metadata?.must_change_password),
	};
});

export async function requireUser() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");
	return user;
}

const SADMIN_ALL_ALLOWED = { can_view: true, can_create: true, can_edit: true, can_delete: true };

// The full capability row for a page, driven by the permissions table so
// SAdmin can change it at runtime without a deploy. SAdmin's own row always
// reads as fully-allowed, regardless of what the table says, so a
// misconfigured or emptied table can never lock the super admin out.
export async function getPagePermissions(role, page) {
	if (role === "SAdmin") return SADMIN_ALL_ALLOWED;

	const supabase = await createClient();
	const { data: permission } = await supabase
		.from("permissions")
		.select("can_view, can_create, can_edit, can_delete")
		.eq("role", role)
		.eq("page", page)
		.maybeSingle();

	return {
		can_view: Boolean(permission?.can_view),
		can_create: Boolean(permission?.can_create),
		can_edit: Boolean(permission?.can_edit),
		can_delete: Boolean(permission?.can_delete),
	};
}

export async function requirePermission(page, action = "view") {
	const user = await requireUser();
	const permissions = await getPagePermissions(user.role, page);

	if (!permissions[ACTION_TO_COLUMN[action]]) redirect("/admin");

	return user;
}

// All pages' permissions for a role in one query — used to filter the
// sidebar nav, where checking each item one page at a time would mean one
// round-trip per nav item on every admin render.
export async function getRolePermissions(role) {
	if (role === "SAdmin") {
		const supabase = await createClient();
		const { data } = await supabase.from("permissions").select("page").eq("role", role);
		const pages = new Set((data ?? []).map((row) => row.page));
		// Cover pages that might not have a seeded row yet — SAdmin is always
		// fully-allowed regardless of what the table contains.
		[
			"dashboard",
			"users",
			"blogs",
			"properties",
			"settings",
			"viewings",
			"leaderboard",
			"testimonials",
			"propertyTypes",
			"media",
			"brand",
		].forEach((page) => pages.add(page));
		return Object.fromEntries([...pages].map((page) => [page, SADMIN_ALL_ALLOWED]));
	}

	const supabase = await createClient();
	const { data } = await supabase
		.from("permissions")
		.select("page, can_view, can_create, can_edit, can_delete")
		.eq("role", role);

	const map = {};
	for (const row of data ?? []) {
		map[row.page] = {
			can_view: Boolean(row.can_view),
			can_create: Boolean(row.can_create),
			can_edit: Boolean(row.can_edit),
			can_delete: Boolean(row.can_delete),
		};
	}
	return map;
}
