import { listViewingRequestsForAgent } from "@/features/viewings/queries";
import SiteViewingsTable from "./SiteViewingsTable";
import CopyReferralLinkButton from "./CopyReferralLinkButton";

// Rendered on every role's own dashboard (Agent, Manager, Admin, SAdmin) —
// referral attribution (?agent=<id>, see ../referral.js) isn't role-scoped,
// so whoever's id ends up on a request should see it here regardless of
// what role they hold.
export default async function MyReferredViewingRequests({ userId }) {
	const viewingRequests = await listViewingRequestsForAgent(userId);
	const pendingCount = viewingRequests.filter((request) => request.status === "pending").length;

	return (
		<div className="mt-10">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<h2 className="font-display text-lg font-semibold text-theme-blue dark:text-white">Viewing requests</h2>
					{pendingCount > 0 ? (
						<span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning dark:bg-warning-dark/20 dark:text-warning-dark">
							{pendingCount} new
						</span>
					) : null}
				</div>
				<CopyReferralLinkButton agentId={userId} />
			</div>
			<p className="mt-1 text-sm text-txt-secondary dark:text-txt-secondary-dark">
				Clients referred to you via your link. Update the status once you&apos;ve been in touch.
			</p>
			<div className="mt-4">
				<SiteViewingsTable requests={viewingRequests} />
			</div>
		</div>
	);
}
