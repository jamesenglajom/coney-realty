import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

	const { data: profile } = await supabase
		.from("users")
		.select("id, email, full_name, role")
		.eq("id", authUser.id)
		.is("deleted_at", null)
		.maybeSingle();

	return profile ?? null;
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
		["dashboard", "users", "blogs", "properties", "settings"].forEach((page) => pages.add(page));
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
