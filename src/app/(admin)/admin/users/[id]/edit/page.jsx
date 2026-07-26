import { notFound } from "next/navigation";
import { requirePermission } from "@/features/auth/permissions";
import { getUserById } from "@/features/users/queries";
import { USER_ROLES } from "@/features/users/schemas";
import UserForm from "@/features/users/components/UserForm";

export const metadata = {
	title: "Edit user",
};

export default async function EditUserPage({ params }) {
	const { id } = await params;
	const currentUser = await requirePermission("users", "edit");
	const user = await getUserById(id);

	if (!user) notFound();

	const assignableRoles = currentUser.role === "SAdmin" ? USER_ROLES : USER_ROLES.filter((role) => role !== "SAdmin");

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold text-theme-blue dark:text-white">Edit user</h1>
			<UserForm mode="edit" user={user} assignableRoles={assignableRoles} />
		</div>
	);
}
