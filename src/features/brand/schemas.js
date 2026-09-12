import { z } from "zod";

const hexColor = z
	.string()
	.trim()
	.regex(/^#([0-9a-fA-F]{6})$/, "Enter a valid hex color, e.g. #0c2241");

export const brandSettingsSchema = z.object({
	siteName: z.string().trim().min(1, "Site name is required"),
	colorBlue: hexColor,
	colorGold: hexColor,
	colorGoldLight: hexColor,
	colorGray: hexColor,
	address: z.string().trim().optional(),
	contactNumber: z.string().trim().optional(),
	contactEmail: z
		.string()
		.trim()
		.optional()
		.refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email"),
});
