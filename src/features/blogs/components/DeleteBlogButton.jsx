"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { softDeleteBlogAction } from "../actions";

export default function DeleteBlogButton({ blogId, blogTitle }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		if (!window.confirm(`Remove "${blogTitle}"? It will no longer be visible anywhere.`)) return;

		startTransition(async () => {
			const result = await softDeleteBlogAction(blogId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success(`"${blogTitle}" removed.`);
				router.refresh();
			}
		});
	}

	return (
		<button
			type="button"
			onClick={handleDelete}
			disabled={isPending}
			className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
		>
			<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
			{isPending ? "Removing…" : "Remove"}
		</button>
	);
}
