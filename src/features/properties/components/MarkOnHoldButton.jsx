"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { PauseCircle } from "lucide-react";
import { toast } from "sonner";
import { markPropertyOnHoldAction } from "../actions";

// No date to capture (unlike Mark sold), so this is a direct action rather
// than opening a modal — same shape as UnmarkSoldButton.
export default function MarkOnHoldButton({ propertyId, propertyTitle, onDone }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleMark() {
		onDone?.();
		if (!window.confirm(`Set "${propertyTitle}" on hold? It stays visible on the public site, just flagged.`)) return;

		startTransition(async () => {
			const result = await markPropertyOnHoldAction(propertyId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success(`"${propertyTitle}" set on hold.`);
				router.refresh();
			}
		});
	}

	return (
		<button
			type="button"
			role="menuitem"
			onClick={handleMark}
			disabled={isPending}
			className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-theme-blue hover:bg-theme-gold-light disabled:opacity-50 dark:text-theme-gold dark:hover:bg-white/5"
		>
			<PauseCircle className="h-3.5 w-3.5" aria-hidden="true" />
			{isPending ? "Saving…" : "Set on hold"}
		</button>
	);
}
