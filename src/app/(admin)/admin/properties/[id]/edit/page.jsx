import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/permissions";
import { getPropertyById, listAssignableUsers } from "@/features/properties/queries";
import { getActiveFieldSetsByType } from "@/features/propertyTypes/queries";
import PropertyForm from "@/features/properties/components/PropertyForm";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Edit property",
};

export default async function EditPropertyPage({ params }) {
	const { id } = await params;
	await requirePermission("properties", "edit");

	const [property, assignableUsers, fieldSetsByType] = await Promise.all([
		getPropertyById(id),
		listAssignableUsers(),
		getActiveFieldSetsByType(),
	]);

	if (!property) notFound();

	return (
		<div>
			<PageHeader title="Edit property" />
			<PropertyForm mode="edit" property={property} assignableUsers={assignableUsers} fieldSetsByType={fieldSetsByType} />
		</div>
	);
}
