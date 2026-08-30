// Plain data + a path helper — split out from imageFs.js (server-only, does
// the actual fs.existsSync checks) so client components like
// LeaderboardEntryModal can import the shot types/labels without pulling in
// "server-only".
export const AGENT_SHOT_TYPES = ["face", "medium", "three_quarter"];

export const AGENT_SHOT_LABELS = {
	face: "Face",
	medium: "Medium (waist-up)",
	three_quarter: "3/4 shot",
};

export function agentPhotoPath(userId, shotType) {
	return `/agents/${userId}_${shotType}.webp`;
}
