import { z } from "zod";

export const USER_ROLES = ["SAdmin", "Admin", "Manager", "Agent"];

export const createUserSchema = z.object({
	email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
	fullName: z.string().trim().min(1, "Full name is required"),
	role: z.enum(USER_ROLES),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateUserSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string().trim().min(1, "Full name is required"),
	role: z.enum(USER_ROLES),
});
