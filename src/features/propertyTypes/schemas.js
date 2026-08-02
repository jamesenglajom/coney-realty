import { z } from "zod";
import { PROPERTY_TYPES } from "@/features/properties/schemas";

export { PROPERTY_TYPES };

export const FIELD_TYPES = ["text", "number"];

// Dot-paths only (letters/numbers/underscores per segment) — this is what
// lets a field target a nested location in custom_fields (e.g.
// "lot.lot_area_sqm", matching how existing Land listings already store
// it) while staying safe to use as a react-hook-form field name, which
// treats dots as nesting.
const FIELD_KEY_REGEX = /^[a-z0-9_]+(\.[a-z0-9_]+)*$/i;

export const fieldDefSchema = z.object({
	key: z
		.string()
		.trim()
		.min(1, "Key is required")
		.regex(FIELD_KEY_REGEX, "Letters, numbers, underscores, and dots only (e.g. lot.lot_area_sqm)"),
	label: z.string().trim().min(1, "Label is required"),
	type: z.enum(FIELD_TYPES),
	unit: z.string().trim().optional(),
	required: z.boolean().default(false),
});

const fieldSetBaseSchema = z.object({
	propertyType: z.enum(PROPERTY_TYPES),
	fields: z
		.array(fieldDefSchema)
		.superRefine((fields, ctx) => {
			const seen = new Set();
			fields.forEach((field, index) => {
				if (seen.has(field.key)) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate key "${field.key}"`, path: [index, "key"] });
				}
				seen.add(field.key);
			});
		}),
});

export const createFieldSetSchema = fieldSetBaseSchema;
export const updateFieldSetSchema = fieldSetBaseSchema.extend({ id: z.string().uuid() });
