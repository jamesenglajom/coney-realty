import { z } from "zod";

export const USER_ROLES = ["SAdmin", "Admin", "Manager", "Agent"];

// New accounts (and password resets) get a deterministic default rather than
// an admin-typed temp password: email local-part + "12345". Communicated to
// the user out of band (the create/reset actions surface it in the response
// so the admin can relay it) — they're expected to change it via the
// Settings > Change Password tab afterward.
export function computeDefaultPassword(email) {
	const localPart = String(email).split("@")[0];
	return `${localPart}12345`;
}

export const createUserSchema = z.object({
	email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
	fullName: z.string().trim().min(1, "Full name is required"),
	role: z.enum(USER_ROLES),
	phone: z.string().trim().optional(),
	bio: z.string().trim().optional(),
	avatarUrl: z.string().trim().optional(),
});

export const updateUserSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string().trim().min(1, "Full name is required"),
	role: z.enum(USER_ROLES),
	phone: z.string().trim().optional(),
	bio: z.string().trim().optional(),
	avatarUrl: z.string().trim().optional(),
});

// Self-service profile edit — deliberately no `id`, `role`, or `email` field.
// The Server Action always derives the target row from the caller's own
// session (requireUser()), never from client-supplied input, and nobody can
// promote themselves through this form. Email lives in its own
// changeEmailSchema/action (Settings > Change email) so each Settings tab
// stays single-purpose.
export const updateOwnProfileSchema = z.object({
	fullName: z.string().trim().min(1, "Full name is required"),
	phone: z.string().trim().optional(),
	bio: z.string().trim().optional(),
	avatarUrl: z.string().trim().optional(),
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// user_property rows are keyed by user id, never email, so changing this
// never touches a user's property assignments.
export const changeEmailSchema = z.object({
	newEmail: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});
