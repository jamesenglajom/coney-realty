import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/permissions";
import { getPropertyById, listAssignableUsers } from "@/features/properties/queries";
import { getActiveFieldSetsByType } from "@/features/propertyTypes/queries";
import PropertyForm from "@/features/properties/components/PropertyForm";

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
			<h1 className="mb-6 text-2xl font-bold text-theme-blue dark:text-white">Edit property</h1>
			<PropertyForm mode="edit" property={property} assignableUsers={assignableUsers} fieldSetsByType={fieldSetsByType} />
		</div>
	);
}
