"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireUser } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLastKeepAlivePing } from "./queries";
import { siteSettingsSchema } from "./schemas";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// SAdmin/Admin only — an explicit role check rather than the "settings"
// page permission, since the user wants exactly those two roles to manage
// the public contact details regardless of how that permission is set.
export async function updateSiteSettingsAction(values) {
	const user = await requireUser();
	if (!["SAdmin", "Admin"].includes(user.role)) {
		return { error: "Only an admin or super admin can edit site settings." };
	}

	const parsed = siteSettingsSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("site_settings")
		.update({
			address: parsed.data.address || null,
			contact_number: parsed.data.contactNumber || null,
			contact_email: parsed.data.contactEmail || null,
			updated_by: user.id,
		})
		.eq("id", true);

	if (error) return { error: error.message };

	// The footer renders on every public page from the root layout.
	revalidatePath("/", "layout");
	revalidatePath("/admin/settings");
	return { success: true };
}

export async function triggerKeepAlivePingAction() {
	const user = await requirePermission("settings", "edit");

	const lastTriggeredAt = await getLastKeepAlivePing();
	if (lastTriggeredAt && Date.now() - new Date(lastTriggeredAt).getTime() < WEEK_MS) {
		return { error: "Already pinged this week — try again after the cooldown." };
	}

	const supabase = createAdminClient();
	const { error: pingError } = await supabase.from("properties").select("id").limit(1);
	if (pingError) return { error: pingError.message };

	const { data: inserted, error: insertError } = await supabase
		.from("keep_alive_pings")
		.insert({ triggered_by: user.id })
		.select("triggered_at")
		.single();
	if (insertError) return { error: insertError.message };

	revalidatePath("/admin/settings");
	return { ok: true, triggeredAt: inserted.triggered_at };
}
