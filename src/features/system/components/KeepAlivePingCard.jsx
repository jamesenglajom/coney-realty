"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { triggerKeepAlivePingAction } from "../actions";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function formatDateTime(iso) {
	return new Date(iso).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export default function KeepAlivePingCard({ lastTriggeredAt }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const nextAvailableAt = lastTriggeredAt ? new Date(new Date(lastTriggeredAt).getTime() + WEEK_MS) : null;
	const onCooldown = Boolean(nextAvailableAt && nextAvailableAt.getTime() > Date.now());

	function handleTrigger() {
		startTransition(async () => {
			const result = await triggerKeepAlivePingAction();
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success("Keep-alive ping sent to Supabase.");
				router.refresh();
			}
		});
	}

	return (
		<Card className="p-5 sm:p-6">
			<h3 className="text-sm font-semibold text-txt-primary dark:text-txt-primary-dark">Supabase keep-alive</h3>
			<p className="mt-1 max-w-prose text-sm text-txt-muted dark:text-txt-muted-dark">
				Manually pings the database so the free-tier Supabase project doesn't auto-pause from inactivity. A Vercel
				Cron job already does this daily on its own — use this only to confirm it's working or bump the clock by
				hand. Limited to once a week.
			</p>

			<div className="mt-4 flex flex-col gap-1 text-sm">
				<span className="text-txt-secondary dark:text-txt-secondary-dark">
					Last triggered:{" "}
					<strong className="font-semibold text-txt-primary dark:text-txt-primary-dark">
						{lastTriggeredAt ? formatDateTime(lastTriggeredAt) : "Never"}
					</strong>
				</span>
				{onCooldown ? (
					<span className="text-txt-muted dark:text-txt-muted-dark">
						Available again on {formatDateTime(nextAvailableAt.toISOString())}
					</span>
				) : null}
			</div>

			<Button type="button" size="sm" className="mt-4" onClick={handleTrigger} disabled={isPending || onCooldown}>
				<RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
				{isPending ? "Pinging…" : onCooldown ? "Already pinged this week" : "Ping now"}
			</Button>
		</Card>
	);
}
