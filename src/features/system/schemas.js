import { z } from "zod";

export const siteSettingsSchema = z.object({
	address: z.string().trim().optional(),
	contactNumber: z.string().trim().optional(),
	contactEmail: z
		.string()
		.trim()
		.optional()
		.refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email"),
});
