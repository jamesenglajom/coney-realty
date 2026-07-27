"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBlogSchema, updateBlogSchema } from "./schemas";

function toColumns(data) {
	return {
		title: data.title,
		slug: data.slug,
		status: data.status,
		excerpt: data.excerpt || null,
		content: data.content || null,
		cover_image_url: data.coverImageUrl || null,
		author_id: data.authorId,
		property_id: data.propertyId || null,
	};
}

function slugConflictMessage(error) {
	return error.code === "23505" ? "That slug is already in use." : error.message;
}

export async function createBlogAction(values) {
	await requirePermission("blogs", "create");

	const parsed = createBlogSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("blogs").insert(toColumns(parsed.data));

	if (error) {
		return { error: slugConflictMessage(error) };
	}

	revalidatePath("/admin/blogs");
	return { success: true };
}

export async function updateBlogAction(values) {
	await requirePermission("blogs", "edit");

	const parsed = updateBlogSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("blogs").update(toColumns(parsed.data)).eq("id", parsed.data.id);

	if (error) {
		return { error: slugConflictMessage(error) };
	}

	revalidatePath("/admin/blogs");
	return { success: true };
}

export async function softDeleteBlogAction(id) {
	await requirePermission("blogs", "delete");

	const supabase = createAdminClient();
	const { error } = await supabase.from("blogs").update({ deleted_at: new Date().toISOString() }).eq("id", id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/admin/blogs");
	return { success: true };
}
