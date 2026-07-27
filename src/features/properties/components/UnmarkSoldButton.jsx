"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";
import { toast } from "sonner";
import { unmarkPropertySoldAction } from "../actions";

export default function UnmarkSoldButton({ propertyId, propertyTitle, onDone }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleUnmark() {
		onDone?.();
		if (!window.confirm(`Revert "${propertyTitle}" from sold back to published?`)) return;

		startTransition(async () => {
			const result = await unmarkPropertySoldAction(propertyId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success(`"${propertyTitle}" reverted to published.`);
				router.refresh();
			}
		});
	}

	return (
		<button
			type="button"
			role="menuitem"
			onClick={handleUnmark}
			disabled={isPending}
			className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-theme-blue hover:bg-theme-gold-light disabled:opacity-50 dark:text-theme-gold dark:hover:bg-white/5"
		>
			<Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
			{isPending ? "Reverting…" : "Unsold"}
		</button>
	);
}
