import { requirePermission } from "@/features/auth/permissions";
import { listViewingRequests } from "@/features/viewings/queries";
import SiteViewingsTable from "@/features/viewings/components/SiteViewingsTable";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Site Viewings",
};

export default async function SiteViewingsPage() {
	await requirePermission("viewings", "view");
	const requests = await listViewingRequests();

	return (
		<div>
			<PageHeader
				title="Site Viewings"
				description="Requests from visitors who want to tour one or more properties."
			/>
			<SiteViewingsTable requests={requests} />
		</div>
	);
}
