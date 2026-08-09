"use client";

import { useState, useTransition } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { PROPERTY_TYPES } from "../../schemas";
import { exportPropertiesByTypeAction } from "../actions";

// SAdmin-only spreadsheet export — same column shape as the import
// template (buildTemplateHeaders server-side), populated with the current
// database rows for the chosen type, so a downloaded export can be edited
// and re-uploaded through Import without any column-mapping step.
export default function ExportPropertiesButton() {
	const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
	const [isPending, startTransition] = useTransition();

	function handleExport() {
		startTransition(async () => {
			const result = await exportPropertiesByTypeAction(propertyType);
			if (result?.error) {
				toast.error(result.error);
				return;
			}

			if (result.rows.length === 0) {
				toast.info(`No ${propertyType} properties to export yet.`);
				return;
			}

			const XLSX = await import("xlsx");
			const worksheet = XLSX.utils.aoa_to_sheet([result.headers, ...result.rows]);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Properties");
			XLSX.writeFile(workbook, `${propertyType.toLowerCase().replace(/\s+/g, "-")}-export.xlsx`);
		});
	}

	return (
		<div className="flex items-center gap-2">
			<Select
				value={propertyType}
				onChange={(event) => setPropertyType(event.target.value)}
				aria-label="Property type to export"
				className="w-auto"
			>
				{PROPERTY_TYPES.map((type) => (
					<option key={type} value={type}>
						{type}
					</option>
				))}
			</Select>
			<Button type="button" variant="ghost" size="sm" onClick={handleExport} disabled={isPending}>
				<FileUp className="h-4 w-4" aria-hidden="true" />
				{isPending ? "Exporting…" : "Export data"}
			</Button>
		</div>
	);
}
