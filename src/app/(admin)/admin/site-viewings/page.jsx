import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listViewingRequestsPaginated } from "@/features/viewings/queries";
import SiteViewingsTable from "@/features/viewings/components/SiteViewingsTable";
import PageHeader from "@/app/components/admin/page-header/PageHeader";
import Pagination from "@/components/ui/Pagination";

export const metadata = {
	title: "Site Viewings",
};

const PAGE_SIZE = 20;

export default async function SiteViewingsPage({ searchParams }) {
	const params = await searchParams;
	const page = Math.max(1, Number(params.page) || 1);
	const user = await requirePermission("viewings", "view");
	const [{ requests, totalCount }, permissions] = await Promise.all([
		listViewingRequestsPaginated({ page, pageSize: PAGE_SIZE }),
		getPagePermissions(user.role, "viewings"),
	]);
	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

	return (
		<div>
			<PageHeader
				title="Site Viewings"
				description="Requests from visitors who want to tour one or more properties."
			/>
			<SiteViewingsTable requests={requests} canDelete={permissions.can_delete} />
			<Pagination
				page={page}
				totalPages={totalPages}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
				basePath="/admin/site-viewings"
				searchParams={params}
			/>
		</div>
	);
}
