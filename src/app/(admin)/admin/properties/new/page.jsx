import { requirePermission } from "@/features/auth/permissions";
import { listAssignableUsers } from "@/features/properties/queries";
import { getActiveFieldSetsByType } from "@/features/propertyTypes/queries";
import PropertyForm from "@/features/properties/components/PropertyForm";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "New property",
};

export default async function NewPropertyPage() {
	await requirePermission("properties", "create");
	const [assignableUsers, fieldSetsByType] = await Promise.all([listAssignableUsers(), getActiveFieldSetsByType()]);

	return (
		<div>
			<PageHeader title="New property" />
			<PropertyForm mode="create" assignableUsers={assignableUsers} fieldSetsByType={fieldSetsByType} />
		</div>
	);
}
