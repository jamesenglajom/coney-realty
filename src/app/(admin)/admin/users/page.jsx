import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listUsersPaginated } from "@/features/users/queries";
import UsersTable from "@/features/users/components/UsersTable";
import UsersSearchBar from "@/features/users/components/UsersSearchBar";
import Button from "@/components/ui/Button";
import PageHeader from "@/app/components/admin/page-header/PageHeader";
import Pagination from "@/components/ui/Pagination";

export const metadata = {
	title: "Users",
};

const PAGE_SIZE = 20;

export default async function UsersPage({ searchParams }) {
	const params = await searchParams;
	const { q } = params;
	const user = await requirePermission("users", "view");
	const page = Math.max(1, Number(params.page) || 1);

	const [{ users, totalCount }, permissions] = await Promise.all([
		listUsersPaginated({ query: q, page, pageSize: PAGE_SIZE }),
		getPagePermissions(user.role, "users"),
	]);

	const canCreate = permissions.can_create;
	const canEdit = permissions.can_edit;
	const canDelete = permissions.can_delete;
	const showUserId = ["SAdmin", "Admin"].includes(user.role);
	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

	return (
		<div>
			<PageHeader
				title="Users"
				description="Manage who has access to the admin panel."
				actions={
					canCreate ? (
						<Button href="/admin/users/new" size="sm">
							New user
						</Button>
					) : null
				}
			/>
			<div className="mb-4">
				<UsersSearchBar />
			</div>
			<UsersTable users={users} canEdit={canEdit} canDelete={canDelete} showUserId={showUserId} />
			<Pagination
				page={page}
				totalPages={totalPages}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
				basePath="/admin/users"
				searchParams={params}
			/>
		</div>
	);
}
