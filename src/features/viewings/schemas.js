import { z } from "zod";

export const TIME_PREFERENCES = ["morning", "afternoon", "evening"];
export const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export const scheduleViewingSchema = z.object({
	visitorName: z.string().trim().min(1, "Name is required"),
	visitorEmail: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
	visitorPhone: z.string().trim().optional(),
	propertyIds: z.array(z.string().uuid()).min(1, "Pick at least one property"),
	preferredDate: z.string().trim().optional(),
	// "No preference" submits "" (the select's blank option) — .optional()
	// alone only allows undefined, so that "" silently failed validation
	// with no visible error (the bug report: submitting with no time
	// selected did nothing). Same .or(z.literal("")) pattern already used
	// for payment_type in src/features/properties/schemas.js.
	preferredTime: z.enum(TIME_PREFERENCES).optional().or(z.literal("")),
	message: z.string().trim().optional(),
	// Captured client-side from a ?agent=<id> referral link, not a form
	// field — see src/features/viewings/referral.js. Server-validated
	// against a real Agent user before it's trusted (see actions.js).
	referringAgentId: z.string().uuid().optional().or(z.literal("")),
});

export const updateViewingStatusSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(STATUSES),
});
