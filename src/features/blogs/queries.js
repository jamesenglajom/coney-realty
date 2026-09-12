import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listBlogs({ page = 1, pageSize = 20 } = {}) {
	const supabase = createAdminClient();
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;

	const { data, error, count } = await supabase
		.from("blogs")
		.select("id, title, slug, status, created_at, author:author_id(full_name, email), property:property_id(title)", {
			count: "exact",
		})
		.is("deleted_at", null)
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) throw new Error(error.message);
	return { blogs: data ?? [], totalCount: count ?? 0 };
}

export async function getBlogById(id) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("blogs")
		.select("*")
		.eq("id", id)
		.is("deleted_at", null)
		.maybeSingle();

	if (error) throw new Error(error.message);
	return data;
}

export async function listAuthors() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("users")
		.select("id, full_name, email")
		.is("deleted_at", null)
		.order("full_name", { ascending: true });

	if (error) throw new Error(error.message);
	return data;
}

export async function listPropertiesForSelect() {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from("properties")
		.select("id, title")
		.is("deleted_at", null)
		.order("title", { ascending: true });

	if (error) throw new Error(error.message);
	return data;
}
