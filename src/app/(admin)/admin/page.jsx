import { requireUser } from "@/features/auth/permissions";
import { getAgentPropertyStats } from "@/features/properties/queries";
import AdminDashboard from "@/features/dashboard/components/AdminDashboard";

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

async function AgentDashboard({ userId }) {
	const stats = await getAgentPropertyStats(userId);

	return (
		<div>
			<h1 className="mb-1 text-2xl font-bold text-theme-blue dark:text-white">My dashboard</h1>
			<p className="mb-6 text-txt-secondary dark:text-txt-secondary-dark">
				Stats for the properties assigned to you.
			</p>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border border-theme-gold-light bg-white p-6 shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
					<p className="text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark">Assigned listings</p>
					<h3 className="mt-2 text-2xl font-bold text-theme-blue dark:text-white">{stats.totalAssigned}</h3>
				</div>
				<div className="rounded-xl border border-theme-gold-light bg-white p-6 shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
					<p className="text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark">Published</p>
					<h3 className="mt-2 text-2xl font-bold text-theme-blue dark:text-white">{stats.byStatus.published}</h3>
				</div>
				<div className="rounded-xl border border-theme-gold-light bg-white p-6 shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
					<p className="text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark">Sold (this month)</p>
					<h3 className="mt-2 text-2xl font-bold text-theme-blue dark:text-white">{stats.thisMonth.count}</h3>
					<p className="mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">
						{priceFormatter.format(stats.thisMonth.volume)}
					</p>
				</div>
				<div className="rounded-xl border border-theme-gold-light bg-white p-6 shadow-sm dark:border-[#333] dark:bg-[#1a1a1a]">
					<p className="text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark">Sold (lifetime)</p>
					<h3 className="mt-2 text-2xl font-bold text-theme-blue dark:text-white">{stats.lifetime.count}</h3>
					<p className="mt-1 text-xs text-txt-muted dark:text-txt-muted-dark">
						{priceFormatter.format(stats.lifetime.volume)}
					</p>
				</div>
			</div>

			<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
				{Object.entries(stats.byStatus).map(([status, count]) => (
					<div key={status} className="rounded-xl border border-theme-gold-light p-4 text-center dark:border-[#333]">
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
