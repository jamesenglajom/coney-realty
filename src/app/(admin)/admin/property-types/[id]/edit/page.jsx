import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/permissions";
import { getFieldSetById } from "@/features/propertyTypes/queries";
import PropertyTypeFieldSetForm from "@/features/propertyTypes/components/PropertyTypeFieldSetForm";

export const metadata = {
	title: "Edit field set",
};

export default async function EditFieldSetPage({ params }) {
	const { id } = await params;
	await requirePermission("propertyTypes", "edit");

	const fieldSet = await getFieldSetById(id);
	if (!fieldSet) notFound();

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold text-theme-blue dark:text-white">Edit field set</h1>
			<PropertyTypeFieldSetForm mode="edit" fieldSet={fieldSet} />
		</div>
	);
}
