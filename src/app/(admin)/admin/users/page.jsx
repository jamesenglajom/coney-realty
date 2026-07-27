import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listUsers } from "@/features/users/queries";
import UsersTable from "@/features/users/components/UsersTable";
import UsersSearchBar from "@/features/users/components/UsersSearchBar";
import Button from "@/components/ui/Button";

export const metadata = {
	title: "Users",
};

export default async function UsersPage({ searchParams }) {
	const { q } = await searchParams;
	const user = await requirePermission("users", "view");
	const [users, permissions] = await Promise.all([
		listUsers({ query: q }),
		getPagePermissions(user.role, "users"),
	]);

	const canCreate = permissions.can_create;
	const canEdit = permissions.can_edit;
	const canDelete = permissions.can_delete;

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-theme-blue dark:text-white">Users</h1>
					<p className="text-txt-secondary dark:text-txt-secondary-dark">Manage who has access to the admin panel.</p>
				</div>
				{canCreate ? (
					<Button href="/admin/users/new" size="sm">
						New user
					</Button>
				) : null}
			</div>
			<div className="mb-4">
				<UsersSearchBar />
			</div>
			<UsersTable users={users} canEdit={canEdit} canDelete={canDelete} />
		</div>
	);
}
