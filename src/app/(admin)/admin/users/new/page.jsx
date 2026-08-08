import { requirePermission } from "@/features/auth/permissions";
import { USER_ROLES } from "@/features/users/schemas";
import UserForm from "@/features/users/components/UserForm";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "New user",
};

export default async function NewUserPage() {
	const currentUser = await requirePermission("users", "create");
	const assignableRoles = currentUser.role === "SAdmin" ? USER_ROLES : USER_ROLES.filter((role) => role !== "SAdmin");

	return (
		<div>
			<PageHeader title="New user" />
			<UserForm mode="create" assignableRoles={assignableRoles} />
		</div>
	);
}
