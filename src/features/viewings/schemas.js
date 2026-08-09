import { z } from "zod";

export const TIME_PREFERENCES = ["morning", "afternoon", "evening"];
export const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export const scheduleViewingSchema = z.object({
	visitorName: z.string().trim().min(1, "Name is required"),
	visitorEmail: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
	visitorPhone: z.string().trim().optional(),
	propertyIds: z.array(z.string().uuid()).min(1, "Pick at least one property"),
	preferredDate: z.string().trim().optional(),
	preferredTime: z.enum(TIME_PREFERENCES).optional(),
	message: z.string().trim().optional(),
});

export const updateViewingStatusSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(STATUSES),
});
