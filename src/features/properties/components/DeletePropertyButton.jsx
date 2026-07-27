"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { softDeletePropertyAction } from "../actions";

export default function DeletePropertyButton({ propertyId, propertyTitle, onDone }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		onDone?.();
		if (!window.confirm(`Remove "${propertyTitle}"? It will no longer be visible anywhere.`)) return;

		startTransition(async () => {
			const result = await softDeletePropertyAction(propertyId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success(`"${propertyTitle}" removed.`);
				router.refresh();
			}
		});
	}

	return (
		<button
			type="button"
			role="menuitem"
			onClick={handleDelete}
			disabled={isPending}
			className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
		>
			<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
			{isPending ? "Removing…" : "Remove"}
		</button>
	);
}
