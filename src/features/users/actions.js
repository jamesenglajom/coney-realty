"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserSchema, updateUserSchema } from "./schemas";

export async function createUserAction(values) {
	const currentUser = await requirePermission("users", "create");

	const parsed = createUserSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const { email, fullName, role, password, phone, bio, avatarUrl } = parsed.data;

	if (role === "SAdmin" && currentUser.role !== "SAdmin") {
		return { error: "Only a super admin can assign the SAdmin role." };
	}

	const supabase = createAdminClient();

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
	return { success: true };
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

export async function softDeleteUserAction(id) {
	const currentUser = await requirePermission("users", "delete");

	if (id === currentUser.id) {
		return { error: "You can't delete your own account." };
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("users").update({ deleted_at: new Date().toISOString() }).eq("id", id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/admin/users");
	return { success: true };
}
