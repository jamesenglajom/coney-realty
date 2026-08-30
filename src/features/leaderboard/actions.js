"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { leaderboardEntrySchema, leaderboardConfigSchema } from "./schemas";

function revalidate() {
	revalidatePath("/admin/leaderboard");
	revalidatePath("/");
}

function toEntryColumns(data) {
	return {
		name: data.name,
		title: data.title || null,
		photo_url: data.photoUrl || null,
		agent_id: data.agentId || null,
	};
}

export async function createLeaderboardEntryAction(values) {
	await requirePermission("leaderboard", "create");

	const parsed = leaderboardEntrySchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { data: last } = await supabase
		.from("leaderboard_entries")
		.select("display_order")
		.is("deleted_at", null)
		.order("display_order", { ascending: false })
		.limit(1)
		.maybeSingle();

	const { error } = await supabase
		.from("leaderboard_entries")
		.insert({ ...toEntryColumns(parsed.data), display_order: (last?.display_order ?? 0) + 1 });

	if (error) return { error: error.message };

	revalidate();
	return { success: true };
}

export async function updateLeaderboardEntryAction(id, values) {
	await requirePermission("leaderboard", "edit");

	const parsed = leaderboardEntrySchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("leaderboard_entries").update(toEntryColumns(parsed.data)).eq("id", id);
	if (error) return { error: error.message };

	revalidate();
	return { success: true };
}

export async function deleteLeaderboardEntryAction(id) {
	await requirePermission("leaderboard", "delete");

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("leaderboard_entries")
		.update({ deleted_at: new Date().toISOString() })
		.eq("id", id);
	if (error) return { error: error.message };

	revalidate();
	return { success: true };
}

export async function reorderLeaderboardAction(orderedIds) {
	await requirePermission("leaderboard", "edit");

	if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
		return { error: "Invalid order payload." };
	}

	const supabase = createAdminClient();
	const { data: live, error: liveError } = await supabase
		.from("leaderboard_entries")
		.select("id")
		.is("deleted_at", null);
	if (liveError) return { error: liveError.message };

	const liveIds = new Set((live ?? []).map((row) => row.id));
	if (liveIds.size !== orderedIds.length || orderedIds.some((id) => !liveIds.has(id))) {
		return { error: "Order is out of sync — reload and try again." };
	}

	for (let index = 0; index < orderedIds.length; index += 1) {
		const { error } = await supabase
			.from("leaderboard_entries")
			.update({ display_order: index + 1 })
			.eq("id", orderedIds[index]);
		if (error) return { error: error.message };
	}

	revalidate();
	return { success: true };
}

export async function updateLeaderboardConfigAction(values) {
	const user = await requirePermission("leaderboard", "edit");

	const parsed = leaderboardConfigSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase
		.from("leaderboard_config")
		.update({
			heading: parsed.data.heading || "Top Producers",
			period_label: parsed.data.periodLabel || null,
			is_published: parsed.data.isPublished,
			show_ranks_6_to_10: parsed.data.showRanks6To10,
			updated_by: user.id,
		})
		.eq("id", true);

	if (error) return { error: error.message };

	revalidate();
	return { success: true };
}
