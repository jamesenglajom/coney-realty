"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { PROPERTY_TYPES } from "../../schemas";
import { buildTemplateHeaders, buildTemplateExampleRow } from "../schema";

// One template per property type — a type with its own standard fields
// (Admin > Property Types) gets those as extra columns; a type with none
// configured yet just gets the shared base columns.
export default function DownloadTemplateButton({ fieldSetsByType = {} }) {
	const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);

	async function handleDownload() {
		const XLSX = await import("xlsx");
		const headers = buildTemplateHeaders(propertyType, fieldSetsByType);
		const exampleRow = buildTemplateExampleRow(propertyType, fieldSetsByType);
		const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Properties");
		XLSX.writeFile(workbook, `${propertyType.toLowerCase().replace(/\s+/g, "-")}-import-template.xlsx`);
	}

	return (
		<div className="flex items-center gap-2">
			<Select
				value={propertyType}
				onChange={(event) => setPropertyType(event.target.value)}
				aria-label="Property type for template"
				className="w-auto"
			>
				{PROPERTY_TYPES.map((type) => (
					<option key={type} value={type}>
						{type}
					</option>
				))}
			</Select>
			<Button type="button" variant="ghost" size="sm" onClick={handleDownload}>
				<FileDown className="h-4 w-4" aria-hidden="true" />
				Download template
			</Button>
		</div>
	);
}
