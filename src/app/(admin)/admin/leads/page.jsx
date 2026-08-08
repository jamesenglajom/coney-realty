import { requirePermission } from "@/features/auth/permissions";
import { listAgentContactRequests } from "@/features/leads/queries";
import LeadsTable from "@/features/leads/components/LeadsTable";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Leads",
};

export default async function LeadsPage() {
	await requirePermission("leads", "view");
	const leads = await listAgentContactRequests();

	return (
		<div>
			<PageHeader
				title="Leads"
				description="Visitors who reached out to an agent from the public Find Agents search."
			/>
			<LeadsTable leads={leads} />
		</div>
	);
}
