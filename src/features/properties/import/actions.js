"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { requirePermission, requireUser } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveFieldSetsByType } from "@/features/propertyTypes/queries";
import { flattenToPairs, pickPaths, omitPaths } from "@/features/propertyTypes/fieldPaths";
import { PROPERTY_TYPES } from "../schemas";
import { validateImportRow, buildTemplateHeaders } from "./schema";

export async function importPropertiesAction(formData) {
	const currentUser = await requirePermission("properties", "create");

	const file = formData.get("file");
	if (!file || typeof file === "string") {
		return { error: "Choose a spreadsheet file to import." };
	}

	let workbook;
	try {
		const buffer = await file.arrayBuffer();
		workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
	} catch {
		return { error: "Couldn't read that file. Make sure it's a .xlsx, .xls, or .csv file." };
	}

	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

	if (rawRows.length === 0) {
		return { error: "That spreadsheet doesn't have any rows." };
	}

	const fieldSetsByType = await getActiveFieldSetsByType();

	// Header row is row 1, so the first data row is row 2.
	const validated = rawRows.map((row, index) => validateImportRow(row, index + 2, fieldSetsByType));
	const invalidRows = validated.filter((row) => row.errors.length > 0);
	let validRows = validated.filter((row) => row.errors.length === 0);

	const seenSlugs = new Map();
	for (const row of validRows) {
		if (seenSlugs.has(row.slug)) {
			invalidRows.push({
				rowNumber: row.rowNumber,
				slug: row.slug,
				errors: [`duplicate slug in this sheet (also on row ${seenSlugs.get(row.slug)})`],
			});
		} else {
			seenSlugs.set(row.slug, row.rowNumber);
		}
	}
	const duplicateRowNumbers = new Set(
		invalidRows.filter((row) => row.errors[0]?.startsWith("duplicate slug")).map((row) => row.rowNumber),
	);
	validRows = validRows.filter((row) => !duplicateRowNumbers.has(row.rowNumber));

	const supabase = createAdminClient();

	const [{ data: existingProperties, error: existingError }, { data: users, error: usersError }] = await Promise.all([
		supabase.from("properties").select("id, slug").is("deleted_at", null),
		supabase.from("users").select("id, email").is("deleted_at", null),
	]);
	if (existingError) return { error: existingError.message };
	if (usersError) return { error: usersError.message };

	const existingBySlug = new Map(existingProperties.map((property) => [property.slug, property.id]));
	const userIdByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user.id]));

	let createdCount = 0;
	let updatedCount = 0;
	const rowResults = [];

	for (const row of validRows) {
		const { data, slug, rowNumber } = row;
		const existingId = existingBySlug.get(slug);

		const columns = {
			title: data.title,
			screen_name: data.screen_name,
			code_name: data.code_name,
			slug: data.slug,
			property_type: data.property_type,
			status: data.status,
			price: data.price,
			address_line: data.address_line,
			city_state: data.city_state,
			city: data.city,
			region: data.region,
			district: data.district,
			zone_type: data.zone_type,
			payment_type: data.payment_type,
			payment_terms: data.payment_terms,
			lat: data.lat,
			lng: data.lng,
			custom_fields: data.custom_fields,
		};

		let propertyId = existingId;
		let action;

		if (existingId) {
			const { error } = await supabase.from("properties").update(columns).eq("id", existingId);
			if (error) {
				rowResults.push({ rowNumber, slug, action: "error", message: error.message });
				continue;
			}
			action = "updated";
			updatedCount += 1;
		} else {
			const { data: created, error } = await supabase
				.from("properties")
				.insert({ ...columns, created_by: currentUser.id })
				.select("id")
				.single();
			if (error) {
				rowResults.push({ rowNumber, slug, action: "error", message: error.message });
				continue;
			}
			propertyId = created.id;
			action = "created";
			createdCount += 1;
		}

		const matchedAgentIds = [];
		const unmatchedEmails = [];
		for (const email of data.assignedEmails) {
			const userId = userIdByEmail.get(email);
			if (userId) matchedAgentIds.push(userId);
			else unmatchedEmails.push(email);
		}

		await supabase.from("user_property").delete().eq("property_id", propertyId);
		if (matchedAgentIds.length > 0) {
			await supabase
				.from("user_property")
				.insert(matchedAgentIds.map((userId) => ({ property_id: propertyId, user_id: userId })));
		}

		rowResults.push({
			rowNumber,
			slug,
			action,
			message: unmatchedEmails.length > 0 ? `Agent email(s) not found: ${unmatchedEmails.join(", ")}` : undefined,
		});
	}

	for (const invalid of invalidRows) {
		rowResults.push({ rowNumber: invalid.rowNumber, slug: invalid.slug, action: "error", message: invalid.errors.join("; ") });
	}

	rowResults.sort((a, b) => a.rowNumber - b.rowNumber);

	revalidatePath("/admin/properties");

	return {
		success: true,
		createdCount,
		updatedCount,
		errorCount: invalidRows.length,
		rows: rowResults,
	};
}

// SAdmin-only — a straight role check rather than the "properties" page's
// usual create/edit/delete permissions, since export is a data-dump
// capability the user wants restricted regardless of how those are
// configured. Returns raw headers/rows (same column shape as the import
// template) for the client to turn into an .xlsx file — no service-role
// data crosses into client code, only the flattened values.
export async function exportPropertiesByTypeAction(propertyType) {
	const user = await requireUser();
	if (user.role !== "SAdmin") {
		return { error: "Only a super admin can export properties." };
	}

	if (!PROPERTY_TYPES.includes(propertyType)) {
		return { error: "Invalid property type." };
	}

	const fieldSetsByType = await getActiveFieldSetsByType();
	const typeFields = fieldSetsByType[propertyType] ?? [];
	const typeFieldKeys = typeFields.map((field) => field.key);
	const headers = buildTemplateHeaders(propertyType, fieldSetsByType);

	const supabase = createAdminClient();
	const { data: properties, error } = await supabase
		.from("properties")
		.select("*, user_property(users(email))")
		.eq("property_type", propertyType)
		.is("deleted_at", null)
		.order("created_at", { ascending: true });

	if (error) return { error: error.message };

	const rows = (properties ?? []).map((property) => {
		const customFields = property.custom_fields ?? {};
		const typeFieldValues = Object.fromEntries(
			flattenToPairs(pickPaths(customFields, typeFieldKeys)).map((pair) => [pair.key, pair.value]),
		);
		const remainingCustomFields = omitPaths(customFields, typeFieldKeys);
		const assignedEmails = (property.user_property ?? [])
			.map((row) => row.users?.email)
			.filter(Boolean)
			.join(", ");

		const base = {
			slug: property.slug,
			title: property.title,
			screen_name: property.screen_name ?? "",
			code_name: property.code_name ?? "",
			property_type: property.property_type,
			status: property.status,
			price: property.price ?? "",
			address_line: property.address_line ?? "",
			city_state: property.city_state ?? "",
			city: property.city ?? "",
			region: property.region ?? "",
			district: property.district ?? "",
			zone_type: property.zone_type ?? "",
			payment_type: property.payment_type ?? "",
			payment_terms: property.payment_terms ?? "",
			lat: property.lat ?? "",
			lng: property.lng ?? "",
			custom_fields: JSON.stringify(remainingCustomFields),
			assigned_agent_emails: assignedEmails,
		};

		return headers.map((header) => (header in base ? base[header] : (typeFieldValues[header] ?? "")));
	});

	return { success: true, headers, rows };
}
