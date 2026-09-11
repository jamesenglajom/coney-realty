// Client-safe Storage URL builders — no "server-only" import, since this is
// just string interpolation against the public Supabase URL (already
// exposed via NEXT_PUBLIC_SUPABASE_URL). Split out from storage.js (which
// does the actual admin/service-role Storage API calls) so client
// components can build a URL without pulling in server-only code.
export const MEDIA_BUCKET = "media";

// The bucket's library folders — flat pools of arbitrarily-named webp
// files, browsed/picked from wherever a photo is needed (the admin media
// page itself, or a picker embedded in the testimonials/leaderboard/
// property/user forms). A plain constant, so it lives here rather than in
// actions.js — a "use server" file may only export async functions.
//
// agent-headshots is excluded for now — every agent-photo picker (users,
// testimonials, leaderboard) uses agent-half-body only. The Storage folder
// and its files are untouched; re-add "agent-headshots" here to bring it
// back into the media page and pickers.
export const MEDIA_FOLDERS = ["properties", "agent-half-body"];

export function getMediaUrl(path) {
	return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}
