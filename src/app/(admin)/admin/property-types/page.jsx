import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listFieldSets } from "@/features/propertyTypes/queries";
import { PROPERTY_TYPES } from "@/features/propertyTypes/schemas";
import PropertyTypeFieldSetsTable from "@/features/propertyTypes/components/PropertyTypeFieldSetsTable";
import Button from "@/components/ui/Button";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Property Types",
};

export default async function PropertyTypesPage() {
	const user = await requirePermission("propertyTypes", "view");

	const [fieldSets, permissions] = await Promise.all([listFieldSets(), getPagePermissions(user.role, "propertyTypes")]);
	const configuredTypes = new Set(fieldSets.map((fieldSet) => fieldSet.property_type));
	const hasUnconfiguredType = PROPERTY_TYPES.some((type) => !configuredTypes.has(type));

	return (
		<div>
			<PageHeader
				title="Property Types"
				description="Define the standard fields each property type should collect on the property form."
				actions={
					permissions.can_create && hasUnconfiguredType ? (
						<Button href="/admin/property-types/new" size="sm">
							New field set
						</Button>
					) : null
				}
			/>
			<PropertyTypeFieldSetsTable fieldSets={fieldSets} canEdit={permissions.can_edit} canDelete={permissions.can_delete} />
		</div>
	);
}
