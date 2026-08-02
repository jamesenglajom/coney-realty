import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listFieldSets } from "@/features/propertyTypes/queries";
import { PROPERTY_TYPES } from "@/features/propertyTypes/schemas";
import PropertyTypeFieldSetsTable from "@/features/propertyTypes/components/PropertyTypeFieldSetsTable";
import Button from "@/components/ui/Button";

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
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-theme-blue dark:text-white">Property Types</h1>
					<p className="text-txt-secondary dark:text-txt-secondary-dark">
						Define the standard fields each property type should collect on the property form.
					</p>
				</div>
				{permissions.can_create && hasUnconfiguredType ? (
					<Button href="/admin/property-types/new" size="sm">
						New field set
					</Button>
				) : null}
			</div>
			<PropertyTypeFieldSetsTable fieldSets={fieldSets} canEdit={permissions.can_edit} canDelete={permissions.can_delete} />
		</div>
	);
}
