"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLastKeepAlivePing } from "./queries";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
