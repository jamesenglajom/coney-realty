// Client-safe Storage URL builders — no "server-only" import, since this is
// just string interpolation against the public Supabase URL (already
// exposed via NEXT_PUBLIC_SUPABASE_URL). Split out from storage.js (which
// does the actual admin/service-role Storage API calls) so client
// components — PropertyCoverImage, PropertyPhotoGallery's probing — can
// build a URL without pulling in server-only code, same convention as
// src/features/users/agentShots.js vs imageFs.js.
export const MEDIA_BUCKET = "media";

export function getMediaUrl(path) {
	return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}
