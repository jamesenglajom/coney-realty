import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEDIA_BUCKET, getMediaUrl } from "./publicUrls";

// Shared Supabase Storage helper — the "media" bucket (public, 8MB/file,
// webp/jpeg/png only, writes locked to the service-role key) replaces the
// old public/properties, public/agents, etc. static-file convention.
// Folder layout:
//   properties/{slug}/1.webp, 2.webp, ...   — property photo galleries
//   agent-headshots/{user_id}.webp          — face shot
//   agent-half-body/{user_id}.webp          — waist-up shot
// Every call here goes through the admin/service-role client — same rule
// as every other mutation in this app: never expose a Storage client to
// the browser directly, always go through a Server Action.
// MEDIA_BUCKET/getMediaUrl live in ./publicUrls (no "server-only") so client
// components can build a URL without pulling this file's admin client in.
export { MEDIA_BUCKET, getMediaUrl };

// Non-recursive listing of a folder's files — lets a property's photo
// gallery enumerate however many images exist without a DB column
// tracking the count, the same convention the old filesystem-probing
// approach followed, just backed by Storage's real list API instead of
// sequential HEAD requests.
export async function listMediaFolder(prefix) {
	const supabase = createAdminClient();
	const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(prefix, {
		sortBy: { column: "name", order: "asc" },
	});
	if (error) throw new Error(error.message);
	// An empty folder still has Storage's own placeholder row, and any
	// literal sub-folder shows up with id === null — filter both out.
	return (data ?? []).filter((item) => item.id !== null && item.name !== ".emptyFolderPlaceholder");
}

// Lists the immediate sub-folder names under a prefix (e.g. every
// {slug}/ under "properties") — one Storage call instead of an N+1 of
// per-item existence checks when a caller needs to filter/map a whole
// list of entities by "does this one have any files uploaded".
export async function listMediaSubfolders(prefix) {
	const supabase = createAdminClient();
	const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(prefix);
	if (error) throw new Error(error.message);
	return (data ?? []).filter((item) => item.id === null).map((item) => item.name);
}

// Checks for one specific file inside a folder — cheaper than listing the
// whole folder when only a yes/no is needed (e.g. "does this agent have a
// headshot uploaded").
export async function hasMediaFile(path) {
	const lastSlash = path.lastIndexOf("/");
	const folder = lastSlash === -1 ? "" : path.slice(0, lastSlash);
	const filename = path.slice(lastSlash + 1);
	const supabase = createAdminClient();
	const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(folder, { search: filename });
	if (error) return false;
	return (data ?? []).some((item) => item.name === filename);
}

// Uploads a Buffer/Blob/File, overwriting whatever's already at that path.
export async function uploadMedia(path, file, contentType) {
	const supabase = createAdminClient();
	const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
		upsert: true,
		contentType,
		cacheControl: "3600",
	});
	if (error) throw new Error(error.message);
	return getMediaUrl(path);
}

export async function deleteMedia(path) {
	const supabase = createAdminClient();
	const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
	if (error) throw new Error(error.message);
}
