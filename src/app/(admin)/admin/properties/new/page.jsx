import { requirePermission } from "@/features/auth/permissions";
import { listAssignableUsers } from "@/features/properties/queries";
import PropertyForm from "@/features/properties/components/PropertyForm";

export const metadata = {
	title: "New property",
};

export default async function NewPropertyPage() {
	await requirePermission("properties", "create");
	const assignableUsers = await listAssignableUsers();

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold text-theme-blue dark:text-white">New property</h1>
			<PropertyForm mode="create" assignableUsers={assignableUsers} />
		</div>
	);
}
