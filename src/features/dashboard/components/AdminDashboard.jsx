import { Building2, CheckCircle2, Users, Wallet } from "lucide-react";
import { PROPERTY_TYPES, PROPERTY_STATUSES, PROPERTY_STATUS_LABELS } from "@/features/properties/schemas";
import { USER_ROLES } from "@/features/users/schemas";
import { getRolePermissions } from "@/features/auth/permissions";
import { listProperties } from "@/features/properties/queries";
import { listLeaderboardEntries } from "@/features/leaderboard/queries";
import { listTestimonials } from "@/features/testimonials/queries";
import { listViewingRequests } from "@/features/viewings/queries";
import { getAdminDashboardStats, getTopAgentsByListings } from "../queries";
import BarChart from "./BarChart";
import TrendChart from "./TrendChart";
import DonutChart from "./DonutChart";
import KpiTrendCard from "./KpiTrendCard";
import ChartPanel from "./ChartPanel";
import { PropertiesWidget, LeaderboardWidget, TestimonialsWidget, ViewingsWidget } from "./DashboardWidgets";
import DashboardCalendar from "./DashboardCalendar";
import MyReferredViewingRequests from "@/features/viewings/components/MyReferredViewingRequests";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	notation: "compact",
	maximumFractionDigits: 1,
});

const STATUS_COLOR_CLASSES = {
	draft: "bg-chart-status-draft dark:bg-chart-status-draft-dark",
	published: "bg-chart-status-published dark:bg-chart-status-published-dark",
	on_hold: "bg-chart-status-onhold dark:bg-chart-status-onhold-dark",
	sold: "bg-chart-status-sold dark:bg-chart-status-sold-dark",
	archived: "bg-chart-status-archived dark:bg-chart-status-archived-dark",
};

const CATEGORICAL_COLOR_CLASSES = [
	"bg-chart-1 dark:bg-chart-1-dark",
	"bg-chart-2 dark:bg-chart-2-dark",
	"bg-chart-3 dark:bg-chart-3-dark",
	"bg-chart-4 dark:bg-chart-4-dark",
	"bg-chart-5 dark:bg-chart-5-dark",
];

const CATEGORICAL_STROKE_CLASSES = [
	"stroke-chart-1 dark:stroke-chart-1-dark",
	"stroke-chart-2 dark:stroke-chart-2-dark",
	"stroke-chart-3 dark:stroke-chart-3-dark",
	"stroke-chart-4 dark:stroke-chart-4-dark",
	"stroke-chart-5 dark:stroke-chart-5-dark",
];

export default async function AdminDashboard({ userId, role }) {
	const [stats, topAgents, permissions] = await Promise.all([
		getAdminDashboardStats(),
		getTopAgentsByListings(5),
		getRolePermissions(role),
	]);

	// Shortcut widgets only fetch/render for pages this role can actually
	// open — same gate the sidebar nav uses — so there's never a "View all"
	// button pointing at a page that immediately bounces the viewer back out.
	const canViewProperties = Boolean(permissions?.properties?.can_view);
	const canViewLeaderboard = Boolean(permissions?.leaderboard?.can_view);
	const canViewTestimonials = Boolean(permissions?.testimonials?.can_view);
	const canViewViewings = Boolean(permissions?.viewings?.can_view);

	const [recentProperties, leaderboardEntries, testimonials, viewingRequests] = await Promise.all([
		canViewProperties ? listProperties() : Promise.resolve([]),
		canViewLeaderboard ? listLeaderboardEntries() : Promise.resolve([]),
		canViewTestimonials ? listTestimonials() : Promise.resolve([]),
		canViewViewings ? listViewingRequests() : Promise.resolve([]),
	]);

	const statusData = PROPERTY_STATUSES.map((status) => ({
		label: PROPERTY_STATUS_LABELS[status] ?? status,
		value: stats.byStatus[status] ?? 0,
		colorClassName: STATUS_COLOR_CLASSES[status],
	}));

	const typeData = PROPERTY_TYPES.filter((type) => (stats.byType[type] ?? 0) > 0).map((type, index) => ({
		label: type,
		value: stats.byType[type] ?? 0,
		swatchClassName: CATEGORICAL_COLOR_CLASSES[index % CATEGORICAL_COLOR_CLASSES.length],
		strokeClassName: CATEGORICAL_STROKE_CLASSES[index % CATEGORICAL_STROKE_CLASSES.length],
	}));

	const roleData = USER_ROLES.map((role, index) => ({
		label: role,
		value: stats.byRole[role] ?? 0,
		colorClassName: CATEGORICAL_COLOR_CLASSES[index % CATEGORICAL_COLOR_CLASSES.length],
	}));

	const agentData = topAgents.map((agent) => ({
		label: agent.name,
		value: agent.count,
		colorClassName: "bg-chart-1 dark:bg-chart-1-dark",
	}));

	const trendData = stats.monthlyTrend.map((month) => ({ label: month.label, value: month.count }));

	return (
		<div>
			<PageHeader title="Dashboard" description="Overview across all properties and users." />

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KpiTrendCard
					label="Total properties"
					value={stats.totalProperties.toLocaleString()}
					icon={Building2}
					tone="blue"
					href="/admin/properties"
					series={stats.propertiesTrend}
					unit="properties"
				/>
				<KpiTrendCard
					label="Published listings"
					value={stats.byStatus.published.toLocaleString()}
					icon={CheckCircle2}
					tone="green"
					href="/admin/properties?status=published"
					series={stats.publishedTrend}
					unit="listings"
				/>
				<KpiTrendCard
					label="Total users"
					value={stats.totalUsers.toLocaleString()}
					icon={Users}
					tone="gold"
					href="/admin/users"
					series={stats.usersTrend}
					unit="users"
				/>
				<KpiTrendCard
					label="Sold (lifetime)"
					value={stats.lifetime.count.toLocaleString()}
					sublabel={priceFormatter.format(stats.lifetime.volume)}
					icon={Wallet}
					tone="orange"
					href="/admin/properties?status=sold"
					series={stats.soldTrend}
					unit="sales"
				/>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{canViewProperties ? (
					<PropertiesWidget
						properties={recentProperties.slice(0, 3)}
						statusCounts={stats.byStatus}
						totalCount={stats.totalProperties}
					/>
				) : null}
				{canViewLeaderboard ? <LeaderboardWidget entries={leaderboardEntries} /> : null}
				{canViewTestimonials ? <TestimonialsWidget testimonials={testimonials} /> : null}
				{canViewViewings ? <ViewingsWidget requests={viewingRequests} /> : null}
			</div>

			{agentData.length > 0 ? (
				<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
					<div className="lg:col-span-3">
						<ChartPanel title="Top agents by assigned listings">
							<BarChart data={agentData} />
						</ChartPanel>
					</div>
					<DashboardCalendar />
				</div>
			) : (
				<div className="mt-6 max-w-sm">
					<DashboardCalendar />
				</div>
			)}

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
				<ChartPanel title="Properties by status">
					<BarChart data={statusData} />
				</ChartPanel>
				<ChartPanel title="Properties by type">
					{typeData.length > 0 ? (
						<DonutChart data={typeData} centerValue={stats.totalProperties} centerLabel="listings" />
					) : (
						<p className="py-8 text-center text-sm text-txt-muted dark:text-txt-muted-dark">No properties yet.</p>
					)}
				</ChartPanel>
				<ChartPanel title="Sales trend (last 6 months)">
					<TrendChart data={trendData} />
				</ChartPanel>
				<ChartPanel title="Users by role">
					<BarChart data={roleData} />
				</ChartPanel>
			</div>

			<MyReferredViewingRequests userId={userId} />
		</div>
	);
}
