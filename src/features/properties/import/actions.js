"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/features/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateImportRow } from "./schema";

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

	// Header row is row 1, so the first data row is row 2.
	const validated = rawRows.map((row, index) => validateImportRow(row, index + 2));
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
