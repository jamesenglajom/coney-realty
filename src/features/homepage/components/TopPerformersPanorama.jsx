import { getPublicLeaderboard } from "@/features/leaderboard/queries";
import TopPerformersPanoramaClient from "./TopPerformersPanoramaClient";

// A different visual treatment of the same top-5 data Leaderboard.jsx
// rendered (that section is now commented out of the homepage — see
// src/app/(public)/page.jsx) — clean editorial Montserrat instead of the
// printed-poster script/serif, an expanding-panorama interaction instead
// of a static grid. Reads the exact same backend-managed config
// (heading/period label/isPublished) via getPublicLeaderboard(), which is
// cache()'d, so admins keep using the one existing /admin/leaderboard page
// regardless of which homepage section is live.
export default async function TopPerformersPanorama() {
	const { config, entries } = await getPublicLeaderboard();

	if (!config.isPublished || entries.length === 0) return null;

	return (
		<TopPerformersPanoramaClient
			entries={entries.slice(0, 5)}
			rest={config.showRanks6To10 ? entries.slice(5, 10) : []}
			heading={config.heading}
			periodLabel={config.periodLabel}
		/>
	);
}
