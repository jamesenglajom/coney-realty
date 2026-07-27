"use client";

import { useTransition } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { resetUserPasswordAction } from "../actions";

export default function ResetPasswordButton({ userId, userName }) {
	const [isPending, startTransition] = useTransition();

	function handleReset() {
		if (!window.confirm(`Reset ${userName}'s password to the default? They'll need to be told the new password.`)) {
			return;
		}

		startTransition(async () => {
			const result = await resetUserPasswordAction(userId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success(`Password reset. New password: ${result.password}`, { duration: 15000 });
			}
		});
	}

	return (
		<button
			type="button"
			onClick={handleReset}
			disabled={isPending}
			className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-theme-blue hover:bg-theme-gold-light disabled:opacity-50 dark:text-theme-gold dark:hover:bg-white/5"
		>
			<KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
			{isPending ? "Resetting…" : "Reset password"}
		</button>
	);
}
