"use server";

import { revalidatePath } from "next/cache";
import { requireUser, getPagePermissions, requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { scheduleViewingSchema, updateViewingStatusSchema } from "./schemas";

// Public, unauthenticated action — fired from the "Schedule a viewing" form.
// Insert-only and can't read anything back, same trust model as the old
// recordAgentContactAction it replaces.
export async function submitViewingRequestAction(values) {
	const parsed = scheduleViewingSchema.safeParse(values);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();

	// The client only ever supplies an id it read back out of its own
	// localStorage — never trust it outright. Only honor it if it actually
	// belongs to a real, non-deleted staff account — any role, not just
	// Agent, since whoever shares the ?agent= link (an Admin/SAdmin
	// included) should get credited the same way.
	let referringAgentId = null;
	if (parsed.data.referringAgentId) {
		const { data: referrer } = await supabase
			.from("users")
			.select("id")
			.eq("id", parsed.data.referringAgentId)
			.is("deleted_at", null)
			.maybeSingle();
		if (referrer) referringAgentId = referrer.id;
	}

	const { data: created, error: insertError } = await supabase
		.from("viewing_requests")
		.insert({
			visitor_name: parsed.data.visitorName,
			visitor_email: parsed.data.visitorEmail,
			visitor_phone: parsed.data.visitorPhone || null,
			preferred_date: parsed.data.preferredDate || null,
			preferred_time: parsed.data.preferredTime || null,
			message: parsed.data.message || null,
			referring_agent_id: referringAgentId,
		})
		.select("id")
		.single();

	if (insertError) return { error: insertError.message };

	const propertyRows = parsed.data.propertyIds.map((propertyId) => ({
		viewing_request_id: created.id,
		property_id: propertyId,
	}));
	const { error: joinError } = await supabase.from("viewing_request_properties").insert(propertyRows);
	if (joinError) return { error: joinError.message };

	return { success: true };
}

export async function updateViewingRequestStatusAction(id, status) {
	const user = await requireUser();

	const parsed = updateViewingStatusSchema.safeParse({ id, status });
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const supabase = createAdminClient();

	if (user.role !== "SAdmin") {
		const permissions = await getPagePermissions(user.role, "viewings");
		let isReferringAgent = false;

		if (user.role === "Agent") {
			const { data: request } = await supabase
				.from("viewing_requests")
				.select("referring_agent_id")
				.eq("id", parsed.data.id)
				.maybeSingle();
			isReferringAgent = request?.referring_agent_id === user.id;
		}

		if (!permissions.can_edit && !isReferringAgent) {
			return { error: "You don't have permission to update this request." };
		}
	}

	const { error } = await supabase
		.from("viewing_requests")
		.update({ status: parsed.data.status })
		.eq("id", parsed.data.id);

	if (error) return { error: error.message };

	revalidatePath("/admin/site-viewings");
	revalidatePath("/admin");
	return { success: true };
}

// SAdmin/Admin only (viewings:delete) — soft delete, same convention as
// every other table in this app (never a hard delete from app code).
export async function deleteViewingRequestAction(id) {
	await requirePermission("viewings", "delete");

	const supabase = createAdminClient();
	const { error } = await supabase.from("viewing_requests").update({ deleted_at: new Date().toISOString() }).eq("id", id);

	if (error) return { error: error.message };

	revalidatePath("/admin/site-viewings");
	return { success: true };
}
