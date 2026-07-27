import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

const READ_WPM = 200;

export function estimateReadMinutes(content) {
	const wordCount = String(content ?? "")
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.round(wordCount / READ_WPM));
}

// Public-facing reads for the marketing site. Uses the admin client rather
// than a public RLS policy on `users` — the author join stays tightly scoped
// to just `full_name` here, same reasoning as matchListedAgents in the
// homepage feature (explicit column selection, not a row-level policy).
export async function listPublishedBlogs(limit) {
	const supabase = createAdminClient();
	let query = supabase
		.from("blogs")
		.select("id, title, slug, excerpt, content, cover_image_url, created_at, author:author_id(full_name)")
		.eq("status", "published")
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (limit) query = query.limit(limit);

	const { data, error } = await query;
	if (error) throw new Error(error.message);
	return data;
}

// Cached per-request so generateMetadata() and the page component both
// resolving this for the same slug only hits the database once.
export const getPublishedBlogBySlug = cache(async function getPublishedBlogBySlug(slug) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("blogs")
		.select("id, title, slug, excerpt, content, cover_image_url, created_at, author:author_id(full_name)")
		.eq("slug", slug)
		.eq("status", "published")
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	return data;
});
