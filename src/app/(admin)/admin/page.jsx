import { Building2, CheckCircle2, TrendingUp, Wallet } from "lucide-react";
import { requireUser } from "@/features/auth/permissions";
import { getAgentPropertyStats } from "@/features/properties/queries";
import { PROPERTY_STATUSES, PROPERTY_STATUS_LABELS } from "@/features/properties/schemas";
import { listViewingRequestsForAgent } from "@/features/viewings/queries";
import AdminDashboard from "@/features/dashboard/components/AdminDashboard";
import KpiTile from "@/features/dashboard/components/KpiTile";
import ChartPanel from "@/features/dashboard/components/ChartPanel";
import BarChart from "@/features/dashboard/components/BarChart";
import DashboardCalendar from "@/features/dashboard/components/DashboardCalendar";
import { MyReferralsWidget } from "@/features/dashboard/components/DashboardWidgets";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

// Same status palette AdminDashboard's own "Properties by status" chart uses
// (see features/dashboard/components/AdminDashboard.jsx) — kept as its own
// small copy here rather than a shared import, since it's a 5-entry lookup
// object, not a real abstraction worth wiring a cross-file dependency for.
const STATUS_COLOR_CLASSES = {
	draft: "bg-chart-status-draft dark:bg-chart-status-draft-dark",
	published: "bg-chart-status-published dark:bg-chart-status-published-dark",
	on_hold: "bg-chart-status-onhold dark:bg-chart-status-onhold-dark",
	sold: "bg-chart-status-sold dark:bg-chart-status-sold-dark",
	archived: "bg-chart-status-archived dark:bg-chart-status-archived-dark",
};

async function AgentDashboard({ userId }) {
	const [stats, myReferrals] = await Promise.all([
		getAgentPropertyStats(userId),
		listViewingRequestsForAgent(userId),
	]);

	const statusData = PROPERTY_STATUSES.map((status) => ({
		label: (PROPERTY_STATUS_LABELS[status] ?? status).replace(/_/g, " "),
		value: stats.byStatus[status] ?? 0,
		colorClassName: STATUS_COLOR_CLASSES[status],
	}));

	return (
		<div>
			<PageHeader title="My dashboard" description="Stats for the properties assigned to you." />

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KpiTile label="Assigned listings" value={stats.totalAssigned} icon={Building2} tone="blue" />
				<KpiTile label="Published" value={stats.byStatus.published} icon={CheckCircle2} tone="success" />
				<KpiTile
					label="Portfolio value"
					value={priceFormatter.format(stats.portfolioValue)}
					sublabel="Published + on-hold listings"
					icon={Wallet}
					tone="gold"
				/>
				<KpiTile
					label="New this month"
					value={stats.newThisMonth}
					sublabel="Listings added to your book"
					icon={TrendingUp}
					tone="warning"
				/>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
				<div className="lg:col-span-3">
					<ChartPanel title="My listings by status">
						<BarChart data={statusData} />
					</ChartPanel>
				</div>
				<DashboardCalendar />
			</div>

			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MyReferralsWidget requests={myReferrals} />
			</div>
		</div>
	);
}

export default async function DashboardPage() {
	const user = await requireUser();

	if (user.role === "Agent") {
		return <AgentDashboard userId={user.id} />;
	}

	return <AdminDashboard userId={user.id} role={user.role} />;
}
