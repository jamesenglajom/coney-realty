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
	const { data: created, error: insertError } = await supabase
		.from("viewing_requests")
		.insert({
			visitor_name: parsed.data.visitorName,
			visitor_email: parsed.data.visitorEmail,
			visitor_phone: parsed.data.visitorPhone || null,
			preferred_date: parsed.data.preferredDate || null,
			preferred_time: parsed.data.preferredTime || null,
			message: parsed.data.message || null,
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

// True if `agentId` is assigned (via user_property) to at least one of the
// properties named on this viewing request — the ownership check that lets a
// listing agent update a request's status without the admin-wide "viewings"
// page permission.
async function isAgentAssignedToRequest(supabase, requestId, agentId) {
	const { data: joins } = await supabase
		.from("viewing_request_properties")
		.select("property_id")
		.eq("viewing_request_id", requestId);

	const propertyIds = (joins ?? []).map((row) => row.property_id);
	if (propertyIds.length === 0) return false;

	const { data: assigned } = await supabase
		.from("user_property")
		.select("property_id")
		.eq("user_id", agentId)
		.in("property_id", propertyIds)
		.limit(1);

	return (assigned ?? []).length > 0;
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
		const isOwningAgent =
			user.role === "Agent" && (await isAgentAssignedToRequest(supabase, parsed.data.id, user.id));

		if (!permissions.can_edit && !isOwningAgent) {
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
