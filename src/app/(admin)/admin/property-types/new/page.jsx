import { redirect } from "next/navigation";
import { requirePermission } from "@/features/auth/permissions";
import { listFieldSets } from "@/features/propertyTypes/queries";
import { PROPERTY_TYPES } from "@/features/propertyTypes/schemas";
import PropertyTypeFieldSetForm from "@/features/propertyTypes/components/PropertyTypeFieldSetForm";

export const metadata = {
	title: "New field set",
};

export default async function NewFieldSetPage() {
	await requirePermission("propertyTypes", "create");

	const fieldSets = await listFieldSets();
	const configuredTypes = new Set(fieldSets.map((fieldSet) => fieldSet.property_type));
	const availableTypes = PROPERTY_TYPES.filter((type) => !configuredTypes.has(type));

	// Every type already has a field set — nothing left to create until one
	// is removed.
	if (availableTypes.length === 0) redirect("/admin/property-types");

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold text-theme-blue dark:text-white">New field set</h1>
			<PropertyTypeFieldSetForm mode="create" availableTypes={availableTypes} />
		</div>
	);
}
