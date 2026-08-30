import "server-only";
import fs from "node:fs";
import path from "node:path";
import { AGENT_SHOT_TYPES, agentPhotoPath } from "./agentShots";

// Per-agent photo library: three standard shots an admin drops into
// public/agents/ named {user_id}_<shot>.webp — same static-file, no-DB-
// column convention as property photos (see
// src/features/properties/imageFs.js). Lets the leaderboard entry form
// offer a quick "pick a photo" picker for a linked agent instead of
// requiring a pasted URL every time.
function hasAgentPhoto(userId, shotType) {
	if (!userId) return false;
	try {
		return fs.existsSync(path.join(process.cwd(), "public", "agents", `${userId}_${shotType}.webp`));
	} catch {
		return false;
	}
}

// { face: "/agents/<id>_face.webp" | null, medium: ..., three_quarter: ... }
export function getAgentPhotos(userId) {
	return Object.fromEntries(
		AGENT_SHOT_TYPES.map((shot) => [shot, hasAgentPhoto(userId, shot) ? agentPhotoPath(userId, shot) : null]),
	);
}

// One lookup per agent option, for a page that needs every agent's photo
// set at once (the leaderboard entry form's agent picker) rather than
// checking on demand per selection.
export function getAgentPhotosById(userIds) {
	return Object.fromEntries(userIds.map((id) => [id, getAgentPhotos(id)]));
}
