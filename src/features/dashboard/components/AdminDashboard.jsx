import { PROPERTY_TYPES, PROPERTY_STATUSES } from "@/features/properties/schemas";
import { USER_ROLES } from "@/features/users/schemas";
import { getAdminDashboardStats, getTopAgentsByListings } from "../queries";
import BarChart from "./BarChart";
import TrendChart from "./TrendChart";

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	notation: "compact",
	maximumFractionDigits: 1,
});

const STATUS_COLOR_CLASSES = {
	draft: "bg-chart-status-draft dark:bg-chart-status-draft-dark",
	published: "bg-chart-status-published dark:bg-chart-status-published-dark",
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

function KpiTile({ label, value, sublabel }) {
	return (
		<div className="rounded-xl border border-theme-gold-light bg-white p-6 shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
			<p className="text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark">{label}</p>
			<h3 className="mt-2 text-2xl font-bold text-theme-blue dark:text-white">{value}</h3>
			{sublabel ? <p className="mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">{sublabel}</p> : null}
		</div>
	);
}

function ChartPanel({ title, children }) {
	return (
		<div className="rounded-xl border border-theme-gold-light bg-white p-6 shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
			<h3 className="mb-6 text-sm font-semibold text-theme-blue dark:text-white">{title}</h3>
			{children}
		</div>
	);
}

export default async function AdminDashboard() {
	const [stats, topAgents] = await Promise.all([getAdminDashboardStats(), getTopAgentsByListings(5)]);

	const statusData = PROPERTY_STATUSES.map((status) => ({
		label: status,
		value: stats.byStatus[status] ?? 0,
		colorClassName: STATUS_COLOR_CLASSES[status],
	}));

	const typeData = PROPERTY_TYPES.map((type, index) => ({
		label: type,
		value: stats.byType[type] ?? 0,
		colorClassName: CATEGORICAL_COLOR_CLASSES[index % CATEGORICAL_COLOR_CLASSES.length],
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
			<h1 className="mb-1 text-2xl font-bold text-theme-blue dark:text-white">Dashboard</h1>
			<p className="mb-6 text-txt-secondary dark:text-txt-secondary-dark">
				Overview across all properties and users.
			</p>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<KpiTile label="Total properties" value={stats.totalProperties.toLocaleString()} />
				<KpiTile label="Published listings" value={stats.byStatus.published.toLocaleString()} />
				<KpiTile label="Total users" value={stats.totalUsers.toLocaleString()} />
				<KpiTile
					label="Sold (lifetime)"
					value={stats.lifetime.count.toLocaleString()}
					sublabel={priceFormatter.format(stats.lifetime.volume)}
				/>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
				<ChartPanel title="Properties by status">
					<BarChart data={statusData} />
				</ChartPanel>
				<ChartPanel title="Properties by type">
					<BarChart data={typeData} />
				</ChartPanel>
				<ChartPanel title="Sales trend (last 6 months)">
					<TrendChart data={trendData} />
				</ChartPanel>
				<ChartPanel title="Users by role">
					<BarChart data={roleData} />
				</ChartPanel>
			</div>

			{agentData.length > 0 ? (
				<div className="mt-6">
					<ChartPanel title="Top agents by assigned listings">
						<BarChart data={agentData} />
					</ChartPanel>
				</div>
			) : null}
		</div>
	);
}
