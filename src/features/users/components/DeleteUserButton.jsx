"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { softDeleteUserAction } from "../actions";

export default function DeleteUserButton({ userId, userName }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		if (!window.confirm(`Remove ${userName}? They'll lose access immediately.`)) return;

		startTransition(async () => {
			const result = await softDeleteUserAction(userId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success(`${userName} removed.`);
				router.refresh();
			}
		});
	}

	return (
		<button
			type="button"
			onClick={handleDelete}
			disabled={isPending}
			className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-50 dark:text-danger-dark dark:hover:bg-danger-dark/10"
		>
			<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
			{isPending ? "Removing…" : "Remove"}
		</button>
	);
}
