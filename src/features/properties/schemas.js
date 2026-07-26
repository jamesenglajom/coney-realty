import { z } from "zod";

export const PROPERTY_TYPES = ["House", "Apartment", "Villa", "Condo", "Land"];
export const PROPERTY_STATUSES = ["draft", "published", "sold", "archived"];

const jsonObjectString = z
	.string()
	.trim()
	.refine((value) => {
		if (value === "") return true;
		try {
			const parsed = JSON.parse(value);
			return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
		} catch {
			return false;
		}
	}, 'Must be valid JSON (an object, e.g. {"beds": 3})');

const propertyBaseSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	slug: z
		.string()
		.trim()
		.min(1, "Slug is required")
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
	propertyType: z.enum(PROPERTY_TYPES),
	status: z.enum(PROPERTY_STATUSES),
	price: z.string().trim().optional(),
	addressLine: z.string().trim().optional(),
	cityState: z.string().trim().optional(),
	lat: z.string().trim().optional(),
	lng: z.string().trim().optional(),
	customFields: jsonObjectString,
	assignedUserIds: z.array(z.string()).default([]),
});

export const createPropertySchema = propertyBaseSchema;
export const updatePropertySchema = propertyBaseSchema.extend({ id: z.string().uuid() });
