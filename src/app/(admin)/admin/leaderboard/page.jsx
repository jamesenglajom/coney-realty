import { requirePermission, getPagePermissions } from "@/features/auth/permissions";
import { listLeaderboardEntries, getLeaderboardConfig } from "@/features/leaderboard/queries";
import { listUsers } from "@/features/users/queries";
import { getAgentPhotosById } from "@/features/users/imageFs";
import LeaderboardConfigForm from "@/features/leaderboard/components/LeaderboardConfigForm";
import LeaderboardEditor from "@/features/leaderboard/components/LeaderboardEditor";
import LeaderboardWalkthrough from "@/features/leaderboard/components/LeaderboardWalkthrough";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "Leaderboard",
};

export default async function LeaderboardPage() {
	const user = await requirePermission("leaderboard", "view");

	const [entries, config, permissions, users] = await Promise.all([
		listLeaderboardEntries(),
		getLeaderboardConfig(),
		getPagePermissions(user.role, "leaderboard"),
		listUsers(),
	]);

	const agentOptions = users
		.filter((u) => u.role === "Agent")
		.map((u) => ({ id: u.id, name: u.full_name || u.email }));
	const agentPhotosById = getAgentPhotosById(agentOptions.map((agent) => agent.id));

	return (
		<div>
			<PageHeader
				title="Leaderboard"
				description="Curate the homepage “Top Producers” board — pick the people, order them, and publish."
				actions={<LeaderboardWalkthrough />}
			/>

			<div className="space-y-8">
				<LeaderboardConfigForm config={config} />
				<LeaderboardEditor
					entries={entries}
					agentOptions={agentOptions}
					agentPhotosById={agentPhotosById}
					canCreate={permissions.can_create}
					canEdit={permissions.can_edit}
					canDelete={permissions.can_delete}
				/>
			</div>
		</div>
	);
}
