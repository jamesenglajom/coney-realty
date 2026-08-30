"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

// Lets an Admin/SAdmin grab an agent's id to build their ?agent=<id>
// referral link (see src/features/viewings/referral.js) without hand-
// selecting the UUID out of the table.
export default function CopyUserIdButton({ userId }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(userId);
			setCopied(true);
			toast.success("User ID copied.");
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error("Couldn't copy — select and copy it manually.");
		}
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label="Copy user ID"
			className="inline-flex items-center justify-center rounded-lg p-1 text-txt-muted hover:bg-theme-gray/10 hover:text-txt-secondary dark:text-txt-muted-dark dark:hover:bg-white/10"
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-success dark:text-success-dark" aria-hidden="true" />
			) : (
				<Copy className="h-3.5 w-3.5" aria-hidden="true" />
			)}
		</button>
	);
}
