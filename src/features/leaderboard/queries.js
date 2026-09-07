import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvatarForSeed } from "@/features/homepage/data";

// Quick way to populate the board without touching photo_url per entry:
// drop public/top_10/rank1.jpg .. rank10.jpg and whoever currently sits at
// that position (drag-and-drop order, 1-indexed) picks it up automatically.
// Still only a fallback — an entry's own photo_url (e.g. one picked from an
// agent's photo library, see src/features/users/imageFs.js) wins if set.
function rankPhotoIfExists(rank) {
	try {
		const filePath = path.join(process.cwd(), "public", "top_10", `rank${rank}.jpg`);
		return fs.existsSync(filePath) ? `/top_10/rank${rank}.jpg` : null;
	} catch {
		return null;
	}
}

const ENTRY_COLUMNS = "id, name, title, photo_url, agent_id, display_order, users(id, full_name, user_info(avatar_url))";

// Admin view — every non-deleted entry in board order.
export async function listLeaderboardEntries() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("leaderboard_entries")
		.select(ENTRY_COLUMNS)
		.is("deleted_at", null)
		.order("display_order", { ascending: true });

	if (error) throw new Error(error.message);

	return (data ?? []).map((entry) => ({
		id: entry.id,
		name: entry.name,
		title: entry.title,
		photoUrl: entry.photo_url,
		agentId: entry.agent_id,
		displayOrder: entry.display_order,
		agentName: entry.users?.full_name ?? null,
		agentAvatarUrl: entry.users?.user_info?.avatar_url ?? null,
	}));
}

export async function getLeaderboardConfig() {
	const supabase = createAdminClient();
	const { data } = await supabase
		.from("leaderboard_config")
		.select("heading, period_label, is_published, show_ranks_6_to_10")
		.eq("id", true)
		.maybeSingle();

	return {
		heading: data?.heading || "Top Producers",
		periodLabel: data?.period_label ?? null,
		isPublished: Boolean(data?.is_published),
		showRanks6To10: data?.show_ranks_6_to_10 ?? true,
	};
}

const HIDDEN_LEADERBOARD = {
	config: { heading: "Top Producers", periodLabel: null, isPublished: false, showRanks6To10: true },
	entries: [],
};

// Homepage read — config plus entries with a resolved photo (own photo →
// linked agent avatar → deterministic placeholder). Degrades to "hidden"
// on any error (e.g. the migration hasn't been run yet) so a leaderboard
// problem never takes down the public site. cache()'d since the homepage
// now reads this twice (the poster grid and the experimental panorama
// section both want the same top-5) — dedupes to one DB round trip.
export const getPublicLeaderboard = cache(async function getPublicLeaderboard() {
	try {
		const [config, entries] = await Promise.all([getLeaderboardConfig(), listLeaderboardEntries()]);

		return {
			config,
			entries: entries.map((entry, index) => ({
				id: entry.id,
				name: entry.name,
				title: entry.title,
				agentId: entry.agentId,
				photo:
					entry.photoUrl || rankPhotoIfExists(index + 1) || entry.agentAvatarUrl || getAvatarForSeed(entry.id),
			})),
		};
	} catch {
		return HIDDEN_LEADERBOARD;
	}
});
