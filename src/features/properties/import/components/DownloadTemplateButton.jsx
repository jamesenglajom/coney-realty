"use client";

import { FileDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { TEMPLATE_HEADERS, TEMPLATE_EXAMPLE_ROW } from "../schema";

export default function DownloadTemplateButton() {
	async function handleDownload() {
		const XLSX = await import("xlsx");
		const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_EXAMPLE_ROW]);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Properties");
		XLSX.writeFile(workbook, "properties-import-template.xlsx");
	}

	return (
		<Button type="button" variant="ghost" size="sm" onClick={handleDownload}>
			<FileDown className="h-4 w-4" aria-hidden="true" />
			Download template
		</Button>
	);
}
