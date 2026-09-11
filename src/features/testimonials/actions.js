"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { testimonialSchema } from "./schemas";

function revalidate() {
	revalidatePath("/admin/testimonials");
	revalidatePath("/");
}

function toColumns(data) {
	return {
		quote: data.quote,
		client_name: data.clientName,
		agent_display_name: data.agentDisplayName,
		agent_tagline: data.agentTagline || null,
		photo_url: data.photoUrl || null,
		agent_id: data.agentId || null,
	};
}

export async function createTestimonialAction(values) {
	await requirePermission("testimonials", "create");

	const parsed = testimonialSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { data: last } = await supabase
		.from("testimonials")
		.select("display_order")
		.is("deleted_at", null)
		.order("display_order", { ascending: false })
		.limit(1)
		.maybeSingle();

	const { error } = await supabase
		.from("testimonials")
		.insert({ ...toColumns(parsed.data), display_order: (last?.display_order ?? 0) + 1 });

	if (error) return { error: error.message };

	revalidate();
	return { success: true };
}

export async function updateTestimonialAction(id, values) {
	await requirePermission("testimonials", "edit");

	const parsed = testimonialSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();
	const { error } = await supabase.from("testimonials").update(toColumns(parsed.data)).eq("id", id);
	if (error) return { error: error.message };

	revalidate();
	return { success: true };
}

export async function deleteTestimonialAction(id) {
	await requirePermission("testimonials", "delete");

	const supabase = createAdminClient();
	const { error } = await supabase.from("testimonials").update({ deleted_at: new Date().toISOString() }).eq("id", id);
	if (error) return { error: error.message };

	revalidate();
	return { success: true };
}

export async function reorderTestimonialsAction(orderedIds) {
	await requirePermission("testimonials", "edit");

	if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
		return { error: "Invalid order payload." };
	}

	const supabase = createAdminClient();
	const { data: live, error: liveError } = await supabase.from("testimonials").select("id").is("deleted_at", null);
	if (liveError) return { error: liveError.message };

	const liveIds = new Set((live ?? []).map((row) => row.id));
	if (liveIds.size !== orderedIds.length || orderedIds.some((id) => !liveIds.has(id))) {
		return { error: "Order is out of sync — reload and try again." };
	}

	for (let index = 0; index < orderedIds.length; index += 1) {
		const { error } = await supabase.from("testimonials").update({ display_order: index + 1 }).eq("id", orderedIds[index]);
		if (error) return { error: error.message };
	}

	revalidate();
	return { success: true };
}
