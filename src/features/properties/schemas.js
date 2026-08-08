import { z } from "zod";

export const PROPERTY_TYPES = ["House", "Apartment", "Villa", "Condo", "Land", "House and Lot"];
export const PROPERTY_STATUSES = ["draft", "published", "sold", "archived"];
export const PAYMENT_TYPES = ["buy", "rent", "rent-to-own"];

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
	screenName: z.string().trim().optional(),
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
	city: z.string().trim().optional(),
	region: z.string().trim().optional(),
	district: z.string().trim().optional(),
	zoneType: z.string().trim().optional(),
	paymentType: z.enum(PAYMENT_TYPES).optional().or(z.literal("")),
	paymentTerms: z.string().trim().optional(),
	lat: z.string().trim().optional(),
	lng: z.string().trim().optional(),
	customFields: jsonObjectString,
	assignedUserIds: z.array(z.string()).default([]),
});

export const createPropertySchema = propertyBaseSchema;
export const updatePropertySchema = propertyBaseSchema.extend({ id: z.string().uuid() });
