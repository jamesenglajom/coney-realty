import { requireUser } from "@/features/auth/permissions";
import { listViewingRequestsForAgent } from "@/features/viewings/queries";
import SiteViewingsTable from "@/features/viewings/components/SiteViewingsTable";
import CopyReferralLinkButton from "@/features/viewings/components/CopyReferralLinkButton";
import PageHeader from "@/app/components/admin/page-header/PageHeader";

export const metadata = {
	title: "My Referrals",
};

// Open to every signed-in user regardless of role or the "viewings" page
// permission — requireUser() only, no requirePermission(). Referral
// attribution (?agent=<id>, see features/viewings/referral.js) isn't
// role-scoped, so whoever's id ends up on a request should be able to see
// (and act on) it here, the same list MyReferredViewingRequests already
// shows inline on the dashboard, just as its own page.
export default async function MyReferralsPage() {
	const user = await requireUser();
	const requests = await listViewingRequestsForAgent(user.id);
	const pendingCount = requests.filter((request) => request.status === "pending").length;

	return (
		<div>
			<PageHeader
				title="My Referrals"
				description={
					pendingCount > 0
						? `Clients referred to you via your link — ${pendingCount} awaiting a status update.`
						: "Clients referred to you via your link."
				}
				actions={<CopyReferralLinkButton agentId={user.id} />}
			/>
			<SiteViewingsTable requests={requests} />
		</div>
	);
}
