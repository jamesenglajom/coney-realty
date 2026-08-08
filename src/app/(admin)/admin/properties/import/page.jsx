import { requirePermission } from "@/features/auth/permissions";
import { getActiveFieldSetsByType } from "@/features/propertyTypes/queries";
import ImportForm from "@/features/properties/import/components/ImportForm";
import DownloadTemplateButton from "@/features/properties/import/components/DownloadTemplateButton";

export const metadata = {
	title: "Import properties",
};

export default async function ImportPropertiesPage() {
	await requirePermission("properties", "create");
	const fieldSetsByType = await getActiveFieldSetsByType();

	return (
		<div>
			<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-theme-blue dark:text-white">Import properties</h1>
					<p className="mt-1 max-w-xl text-txt-secondary dark:text-txt-secondary-dark">
						Upload a spreadsheet to create or update properties in bulk. Matching is by slug — re-uploading the
						same sheet won&apos;t create duplicates, it just updates the existing rows. Pick a property type below
						to download the right template for it — each type's own standard fields (Admin &gt; Property Types)
						become extra columns.
					</p>
				</div>
				<DownloadTemplateButton fieldSetsByType={fieldSetsByType} />
			</div>
			<ImportForm />
		</div>
	);
}
