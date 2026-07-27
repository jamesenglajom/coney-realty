import { requirePermission } from "@/features/auth/permissions";
import { listAgentContactRequests } from "@/features/leads/queries";
import LeadsTable from "@/features/leads/components/LeadsTable";

export const metadata = {
	title: "Leads",
};

export default async function LeadsPage() {
	await requirePermission("leads", "view");
	const leads = await listAgentContactRequests();

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-theme-blue dark:text-white">Leads</h1>
				<p className="text-txt-secondary dark:text-txt-secondary-dark">
					Visitors who reached out to an agent from the public Find Agents search.
				</p>
			</div>
			<LeadsTable leads={leads} />
		</div>
	);
}
