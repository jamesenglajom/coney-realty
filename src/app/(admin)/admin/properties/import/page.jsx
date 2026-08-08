import { requirePermission } from "@/features/auth/permissions";
import { getActiveFieldSetsByType } from "@/features/propertyTypes/queries";
import ImportForm from "@/features/properties/import/components/ImportForm";
import DownloadTemplateButton from "@/features/properties/import/components/DownloadTemplateButton";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Import properties",
};

export default async function ImportPropertiesPage() {
	await requirePermission("properties", "create");
	const fieldSetsByType = await getActiveFieldSetsByType();

	return (
		<div>
			<PageHeader
				title="Import properties"
				description="Upload a spreadsheet to create or update properties in bulk. Matching is by slug — re-uploading the same sheet won't create duplicates, it just updates the existing rows. Pick a property type below to download the right template for it — each type's own standard fields (Admin > Property Types) become extra columns."
				actions={<DownloadTemplateButton fieldSetsByType={fieldSetsByType} />}
			/>
			<ImportForm />
		</div>
	);
}
