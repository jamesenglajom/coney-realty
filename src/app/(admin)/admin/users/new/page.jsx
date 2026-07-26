import { requirePermission } from "@/features/auth/permissions";
import { USER_ROLES } from "@/features/users/schemas";
import UserForm from "@/features/users/components/UserForm";

export const metadata = {
	title: "New user",
};

export default async function NewUserPage() {
	const currentUser = await requirePermission("users", "create");
	const assignableRoles = currentUser.role === "SAdmin" ? USER_ROLES : USER_ROLES.filter((role) => role !== "SAdmin");

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold text-theme-blue dark:text-white">New user</h1>
			<UserForm mode="create" assignableRoles={assignableRoles} />
		</div>
	);
}
