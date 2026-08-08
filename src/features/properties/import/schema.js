import { PROPERTY_TYPES, PROPERTY_STATUSES, PAYMENT_TYPES } from "../schemas";
import { buildFromPairs, deepMerge } from "@/features/propertyTypes/fieldPaths";

// Columns every property type shares — maps 1:1 to the properties table's
// own columns, same set regardless of type.
export const BASE_HEADERS = [
	"slug",
	"title",
	"screen_name",
	"property_type",
	"status",
	"price",
	"address_line",
	"city_state",
	"city",
	"region",
	"district",
	"zone_type",
	"payment_type",
	"payment_terms",
	"lat",
	"lng",
	"custom_fields",
	"assigned_agent_emails",
];

const BASE_EXAMPLE_VALUES = [
	"cedar-ridge-residence",
	"Cedar Ridge Residence",
	"Cedar Ridge — 4BR Family Home",
	"",
	"published",
	1250000,
	"123 Cedar Ridge Rd",
	"Austin, TX",
	"Austin",
	"Texas",
	"Downtown",
	"Residential",
	"buy",
	"20% down, balance in 24 months",
	30.2672,
	-97.7431,
	"{}",
	"agent@example.com, agent2@example.com",
];

const PROPERTY_TYPE_COLUMN_INDEX = BASE_HEADERS.indexOf("property_type");

function exampleValueForFieldType(type) {
	return type === "number" ? 0 : "";
}

// Headers for a given property type's template: the shared base columns
// plus that type's own standard field keys (Admin > Property Types) —
// dot-path keys (e.g. "lot.lot_area_sqm") work fine as column headers,
// same convention the property form's AdditionalFieldsEditor uses.
export function buildTemplateHeaders(propertyType, fieldSetsByType = {}) {
	const typeFields = fieldSetsByType[propertyType] ?? [];
	return [...BASE_HEADERS, ...typeFields.map((field) => field.key)];
}

export function buildTemplateExampleRow(propertyType, fieldSetsByType = {}) {
	const typeFields = fieldSetsByType[propertyType] ?? [];
	const base = [...BASE_EXAMPLE_VALUES];
	base[PROPERTY_TYPE_COLUMN_INDEX] = propertyType;
	return [...base, ...typeFields.map((field) => exampleValueForFieldType(field.type))];
}

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

// Pulls this row's values for its property type's standard fields (Admin >
// Property Types) into a nested object, the same dot-path-aware shape the
// property form's "Standard fields" section produces — e.g. a "lot
// .lot_area_sqm" column becomes { lot: { lot_area_sqm: 500 } }.
function extractTypeFields(row, propertyType, fieldSetsByType) {
	const typeFields = fieldSetsByType[propertyType] ?? [];
	const pairs = [];

	for (const field of typeFields) {
		const raw = row[normalizeHeader(field.key)];
		if (raw === undefined || raw === null || String(raw).trim() === "") continue;

		if (field.type === "number") {
			const num = Number(raw);
			if (Number.isFinite(num)) pairs.push({ key: field.key, value: num });
		} else {
			pairs.push({ key: field.key, value: String(raw).trim() });
		}
	}

	return buildFromPairs(pairs);
}

// Manual validation rather than a zod schema — spreadsheet cells arrive as an
// unpredictable mix of numbers/strings/blanks depending on the source app
// (Excel vs Google Sheets vs CSV), and a hand-written validator reads more
// clearly here than a pile of zod preprocessors trying to cover every case.
export function validateImportRow(rawRow, rowNumber, fieldSetsByType = {}) {
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

	const screenName = String(row.screen_name ?? "").trim();

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

	const paymentType = String(row.payment_type ?? "").trim().toLowerCase();
	if (paymentType && !PAYMENT_TYPES.includes(paymentType)) {
		errors.push(`payment_type must be one of ${PAYMENT_TYPES.join(", ")}`);
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

	// Type-specific standard field columns take precedence over the raw
	// custom_fields catch-all on overlapping keys — same precedence as the
	// property form's standard fields vs. its additional-fields editor.
	if (PROPERTY_TYPES.includes(propertyType)) {
		customFields = deepMerge(customFields, extractTypeFields(row, propertyType, fieldSetsByType));
	}

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
			screen_name: screenName || null,
			slug,
			property_type: propertyType,
			status,
			price: toNumberOrNull(row.price),
			address_line: String(row.address_line ?? "").trim() || null,
			city_state: String(row.city_state ?? "").trim() || null,
			city: String(row.city ?? "").trim() || null,
			region: String(row.region ?? "").trim() || null,
			district: String(row.district ?? "").trim() || null,
			zone_type: String(row.zone_type ?? "").trim() || null,
			payment_type: paymentType || null,
			payment_terms: String(row.payment_terms ?? "").trim() || null,
			lat: toNumberOrNull(row.lat),
			lng: toNumberOrNull(row.lng),
			custom_fields: customFields,
			assignedEmails,
		},
	};
}
