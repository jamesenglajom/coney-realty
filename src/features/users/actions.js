"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireUser } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getUserByEmail } from "./queries";
import {
	createUserSchema,
	updateUserSchema,
	updateOwnProfileSchema,
	changePasswordSchema,
	changeEmailSchema,
	computeDefaultPassword,
} from "./schemas";

// Live duplicate-check for the create-user form — lets an admin see "this
// email already exists" before submitting, not just after a failed insert.
export async function checkEmailAvailabilityAction(email) {
	await requirePermission("users", "create");

	if (!email || !email.includes("@")) return { exists: false };

	const existing = await getUserByEmail(email);
	if (!existing) return { exists: false };

	return {
		exists: true,
		name: existing.full_name || existing.email,
		role: existing.role,
		removed: Boolean(existing.deleted_at),
	};
}

export async function createUserAction(values) {
	const currentUser = await requirePermission("users", "create");

	const parsed = createUserSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const { email, fullName, role, phone, bio, avatarUrl } = parsed.data;

	if (role === "SAdmin" && currentUser.role !== "SAdmin") {
		return { error: "Only a super admin can assign the SAdmin role." };
	}

	const supabase = createAdminClient();
	const password = computeDefaultPassword(email);

	const { data: created, error: authError } = await supabase.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
	});

	if (authError) {
		return { error: authError.message };
	}

	const { error: insertError } = await supabase.from("users").insert({
		id: created.user.id,
		email,
		full_name: fullName,
		role,
	});

	if (insertError) {
		// Don't leave an orphaned auth account with no matching profile row.
		await supabase.auth.admin.deleteUser(created.user.id);
		return { error: insertError.message };
	}

	const { error: infoError } = await supabase.from("user_info").insert({
		user_id: created.user.id,
		phone: phone || null,
		bio: bio || null,
		avatar_url: avatarUrl || null,
	});
	if (infoError) return { error: infoError.message };

	revalidatePath("/admin/users");
	return { success: true, password };
}

export async function updateUserAction(values) {
	const currentUser = await requirePermission("users", "edit");

	const parsed = updateUserSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const { id, fullName, role, phone, bio, avatarUrl } = parsed.data;

	if (role === "SAdmin" && currentUser.role !== "SAdmin") {
		return { error: "Only a super admin can assign the SAdmin role." };
	}

	const supabase = createAdminClient();

	// A SAdmin account is never editable through this admin flow (by anyone,
	// including another SAdmin) — self-service for that account happens via
	// Settings instead. Checked server-side too, not just hidden in the UI.
	const { data: target, error: targetError } = await supabase
		.from("users")
		.select("role")
		.eq("id", id)
		.maybeSingle();
	if (targetError) return { error: targetError.message };
	if (target?.role === "SAdmin") return { error: "SAdmin accounts can't be edited here." };

	const { error } = await supabase.from("users").update({ full_name: fullName, role }).eq("id", id);

	if (error) {
		return { error: error.message };
	}

	const { error: infoError } = await supabase
		.from("user_info")
		.upsert({ user_id: id, phone: phone || null, bio: bio || null, avatar_url: avatarUrl || null });
	if (infoError) return { error: infoError.message };

	revalidatePath("/admin/users");
	return { success: true };
}

// Self-service — any signed-in user (including Agents, who have no access to
// the "users" page permission at all) can update their own contact info.
// The target is always the caller's own session id, never a client-supplied
// one, so there's no way to edit someone else's account through this action.
// Email lives in changeOwnEmailAction below, not here.
export async function updateOwnProfileAction(values) {
	const currentUser = await requireUser();

	const parsed = updateOwnProfileSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const { fullName, phone, bio, avatarUrl } = parsed.data;

	const supabase = createAdminClient();

	const { error: userError } = await supabase.from("users").update({ full_name: fullName }).eq("id", currentUser.id);
	if (userError) return { error: userError.message };

	const { error: infoError } = await supabase
		.from("user_info")
		.upsert({ user_id: currentUser.id, phone: phone || null, bio: bio || null, avatar_url: avatarUrl || null });
	if (infoError) return { error: infoError.message };

	revalidatePath("/admin/profile");
	revalidatePath("/admin", "layout");
	return { success: true };
}

// Self-service email change (Settings > Change email). user_property rows
// are keyed by user id, never email, so this never touches a user's
// property assignments. Since the account's password is derived from the
// email (computeDefaultPassword), changing the email re-derives and resets
// the password to match — the old password stops working the moment the
// email changes, so the returned `password` must be shown to the user.
export async function changeOwnEmailAction(values) {
	const currentUser = await requireUser();

	const parsed = changeEmailSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const { newEmail } = parsed.data;
	if (newEmail === currentUser.email) {
		return { error: "That's already your email address." };
	}

	const supabase = createAdminClient();
	const password = computeDefaultPassword(newEmail);

	const { error: authError } = await supabase.auth.admin.updateUserById(currentUser.id, {
		email: newEmail,
		password,
		email_confirm: true,
	});
	if (authError) return { error: authError.message };

	const { error: userError } = await supabase.from("users").update({ email: newEmail }).eq("id", currentUser.id);
	if (userError) return { error: userError.message };

	revalidatePath("/admin/settings");
	revalidatePath("/admin", "layout");
	return { success: true, password };
}

// Admin-initiated reset for a user who's lost access (they contact the
// admin, the admin clicks Reset Password) — sets the account back to the
// same deterministic default used at creation, which the returned `password`
// lets the admin relay to them.
export async function resetUserPasswordAction(userId) {
	await requirePermission("users", "edit");

	const supabase = createAdminClient();
	const { data: targetUser, error: fetchError } = await supabase
		.from("users")
		.select("email, role")
		.eq("id", userId)
		.is("deleted_at", null)
		.maybeSingle();

	if (fetchError) return { error: fetchError.message };
	if (!targetUser) return { error: "User not found." };
	if (targetUser.role === "SAdmin") return { error: "SAdmin accounts can't be reset here." };

	const password = computeDefaultPassword(targetUser.email);
	const { error } = await supabase.auth.admin.updateUserById(userId, { password });
	if (error) return { error: error.message };

	return { success: true, password };
}

// Self-service password change. Re-authenticates with the current password
// first (via the session-bound client, not the admin client) so a change
// can't happen without knowing it — this is the one place a signed-in user
// is asked to prove they still are who they say they are.
export async function changeOwnPasswordAction(values) {
	const currentUser = await requireUser();

	const parsed = changePasswordSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = await createClient();
	const { error: reauthError } = await supabase.auth.signInWithPassword({
		email: currentUser.email,
		password: parsed.data.currentPassword,
	});
	if (reauthError) return { error: "Current password is incorrect." };

	const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
	if (updateError) return { error: updateError.message };

	return { success: true };
}

export async function softDeleteUserAction(id) {
	const currentUser = await requirePermission("users", "delete");

	if (id === currentUser.id) {
		return { error: "You can't delete your own account." };
	}

	const supabase = createAdminClient();

	const { data: target, error: targetError } = await supabase.from("users").select("role").eq("id", id).maybeSingle();
	if (targetError) return { error: targetError.message };
	if (target?.role === "SAdmin") return { error: "SAdmin accounts can't be removed." };

	const { error } = await supabase.from("users").update({ deleted_at: new Date().toISOString() }).eq("id", id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/admin/users");
	return { success: true };
}
