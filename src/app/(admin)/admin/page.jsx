import { requireUser } from "@/features/auth/permissions";
import { getAgentPropertyStats } from "@/features/properties/queries";
import AdminDashboard from "@/features/dashboard/components/AdminDashboard";
import KpiTile from "@/features/dashboard/components/KpiTile";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

async function AgentDashboard({ userId }) {
	const stats = await getAgentPropertyStats(userId);

	return (
		<div>
			<PageHeader title="My dashboard" description="Stats for the properties assigned to you." />

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<KpiTile label="Assigned listings" value={stats.totalAssigned} />
				<KpiTile label="Published" value={stats.byStatus.published} />
				<KpiTile
					label="Sold (this month)"
					value={stats.thisMonth.count}
					sublabel={priceFormatter.format(stats.thisMonth.volume)}
				/>
				<KpiTile
					label="Sold (lifetime)"
					value={stats.lifetime.count}
					sublabel={priceFormatter.format(stats.lifetime.volume)}
				/>
			</div>

			<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
				{Object.entries(stats.byStatus).map(([status, count]) => (
					<div
						key={status}
						className="rounded-xl border border-theme-gold-light p-4 text-center dark:border-border-dark"
					>
						<p className="text-xs font-semibold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
							{status}
						</p>
						<p className="mt-1 text-lg font-bold text-theme-blue dark:text-white">{count}</p>
					</div>
				))}
			</div>
		</div>
	);
}

export default async function DashboardPage() {
	const user = await requireUser();

	if (user.role === "Agent") {
		return <AgentDashboard userId={user.id} />;
	}

	return <AdminDashboard />;
}
