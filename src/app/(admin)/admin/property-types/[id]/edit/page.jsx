import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/permissions";
import { getFieldSetById } from "@/features/propertyTypes/queries";
import PropertyTypeFieldSetForm from "@/features/propertyTypes/components/PropertyTypeFieldSetForm";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

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
			<PageHeader title="Edit field set" />
			<PropertyTypeFieldSetForm mode="edit" fieldSet={fieldSet} />
		</div>
	);
}
