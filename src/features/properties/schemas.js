import { z } from "zod";

export const PROPERTY_TYPES = ["House", "Apartment", "Villa", "Condo", "Land", "House and Lot"];

// Narrower list for filter dropdowns (public PLP/homepage search, admin
// properties list) — the business only actually deals in these two types
// now. PROPERTY_TYPES itself stays the full historical set so existing
// records of any type can still be viewed/edited and the create/edit form
// isn't artificially restricted.
export const FILTERABLE_PROPERTY_TYPES = ["House and Lot", "Land"];
export const PROPERTY_STATUSES = ["draft", "published", "on_hold", "sold", "archived"];

// Display text for statuses that aren't a single plain word — "on_hold"
// would otherwise print literally as "on_hold" (raw value + CSS
// `capitalize` doesn't reliably style native <option> text, and doesn't
// touch underscores either way). Every other status is fine capitalized
// from its raw value, so this only needs the one entry to look right;
// callers fall back to the raw value for anything not listed here.
export const PROPERTY_STATUS_LABELS = {
	on_hold: "On Hold",
};
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
	codeName: z.string().trim().optional(),
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
	// Client-only working state PropertyForm merges into `customFields`
	// right before submit (see onSubmit in PropertyForm.jsx) — not itself
	// persisted. Zod strips any key not declared here by default, so
	// without these two entries zodResolver silently dropped both from the
	// values onSubmit receives, making every edit to a standard field (or
	// the freeform additional-fields editor) submit as empty.
	standardFields: z.record(z.string(), z.any()).optional(),
	additionalFieldPairs: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
	htmlBody: z.string().optional(),
	assignedUserIds: z.array(z.string()).default([]),
	// Ordered Storage URLs, picked from the media library's properties/
	// folder — see PropertyPhotosField. First one is the cover photo shown
	// everywhere the property appears as a card.
	imageUrls: z.array(z.string()).default([]),
});

export const createPropertySchema = propertyBaseSchema;
export const updatePropertySchema = propertyBaseSchema.extend({ id: z.string().uuid() });
