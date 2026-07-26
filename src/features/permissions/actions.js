"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { updatePermissionSchema, actionColumn } from "./schemas";

export async function updatePermissionAction(values) {
	const currentUser = await requireUser();

	// Hard-gated to SAdmin regardless of what the `settings` page permission
	// says for other roles — letting anyone else edit this table would let
	// them grant their own role more access than intended (privilege escalation).
	if (currentUser.role !== "SAdmin") {
		return { error: "Only a super admin can change permissions." };
	}

	const parsed = updatePermissionSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const { role, page, action, value } = parsed.data;
	const column = actionColumn(action);

	const supabase = createAdminClient();
	const { error } = await supabase.from("permissions").update({ [column]: value }).eq("role", role).eq("page", page);

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/admin/settings");
	revalidatePath("/admin", "layout");
	return { success: true };
}
