import { PROPERTY_TYPES, PROPERTY_STATUSES } from "../schemas";

export const TEMPLATE_HEADERS = [
	"slug",
	"title",
	"property_type",
	"status",
	"price",
	"address_line",
	"city_state",
	"lat",
	"lng",
	"beds",
	"baths",
	"sqft",
	"custom_fields",
	"assigned_agent_emails",
];

export const TEMPLATE_EXAMPLE_ROW = [
	"cedar-ridge-residence",
	"Cedar Ridge Residence",
	"Villa",
	"published",
	1250000,
	"123 Cedar Ridge Rd",
	"Austin, TX",
	30.2672,
	-97.7431,
	4,
	3,
	3200,
	"{}",
	"agent@example.com, agent2@example.com",
];

function normalizeHeader(header) {
	return String(header ?? "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "_");
}

function normalizeRowKeys(rawRow) {
	const normalized = {};
	for (const [key, value] of Object.entries(rawRow)) {
		normalized[normalizeHeader(key)] = value;
	}
	return normalized;
}

function toNumberOrNull(value) {
	if (value === undefined || value === null || value === "") return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
}

// Manual validation rather than a zod schema — spreadsheet cells arrive as an
// unpredictable mix of numbers/strings/blanks depending on the source app
// (Excel vs Google Sheets vs CSV), and a hand-written validator reads more
// clearly here than a pile of zod preprocessors trying to cover every case.
export function validateImportRow(rawRow, rowNumber) {
	const row = normalizeRowKeys(rawRow);
	const errors = [];

	const slug = String(row.slug ?? "")
		.trim()
		.toLowerCase();
	if (!slug) errors.push("slug is required");
	else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		errors.push("slug must be lowercase letters, numbers, and hyphens only");
	}

	const title = String(row.title ?? "").trim();
	if (!title) errors.push("title is required");

	const propertyType = String(row.property_type ?? "").trim();
	if (!PROPERTY_TYPES.includes(propertyType)) {
		errors.push(`property_type must be one of ${PROPERTY_TYPES.join(", ")}`);
	}

	const status = String(row.status ?? "")
		.trim()
		.toLowerCase() || "draft";
	if (!PROPERTY_STATUSES.includes(status)) {
		errors.push(`status must be one of ${PROPERTY_STATUSES.join(", ")}`);
	}

	let customFields = {};
	const customFieldsRaw = String(row.custom_fields ?? "").trim();
	if (customFieldsRaw) {
		try {
			const parsed = JSON.parse(customFieldsRaw);
			if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
				customFields = parsed;
			} else {
				errors.push("custom_fields must be a JSON object, e.g. {}");
			}
		} catch {
			errors.push("custom_fields is not valid JSON");
		}
	}

	const beds = toNumberOrNull(row.beds);
	const baths = toNumberOrNull(row.baths);
	const sqft = toNumberOrNull(row.sqft);
	if (beds !== null) customFields.beds = beds;
	if (baths !== null) customFields.baths = baths;
	if (sqft !== null) customFields.sqft = sqft;

	const assignedEmails = String(row.assigned_agent_emails ?? "")
		.split(",")
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean);

	if (errors.length > 0) {
		return { rowNumber, slug, errors };
	}

	return {
		rowNumber,
		slug,
		errors: [],
		data: {
			title,
			slug,
			property_type: propertyType,
			status,
			price: toNumberOrNull(row.price),
			address_line: String(row.address_line ?? "").trim() || null,
			city_state: String(row.city_state ?? "").trim() || null,
			lat: toNumberOrNull(row.lat),
			lng: toNumberOrNull(row.lng),
			custom_fields: customFields,
			assignedEmails,
		},
	};
}
