import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listViewingRequests } from "@/features/viewings/queries";
import SiteViewingsTable from "@/features/viewings/components/SiteViewingsTable";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Site Viewings",
};

export default async function SiteViewingsPage() {
	const user = await requirePermission("viewings", "view");
	const [requests, permissions] = await Promise.all([listViewingRequests(), getPagePermissions(user.role, "viewings")]);

	return (
		<div>
			<PageHeader
				title="Site Viewings"
				description="Requests from visitors who want to tour one or more properties."
			/>
			<SiteViewingsTable requests={requests} canDelete={permissions.can_delete} />
		</div>
	);
}
