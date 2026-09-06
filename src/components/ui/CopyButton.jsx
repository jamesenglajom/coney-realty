"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

// Generic clipboard-copy button — `label` names what's being copied, both
// for the toast and the aria-label (e.g. "User ID", "Image filename key").
export default function CopyButton({ value, label = "Value", className = "" }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success(`${label} copied.`);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error("Couldn't copy — select and copy it manually.");
		}
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label={`Copy ${label}`}
			className={`inline-flex items-center justify-center rounded-lg p-1 text-txt-muted hover:bg-theme-gray/10 hover:text-txt-secondary dark:text-txt-muted-dark dark:hover:bg-white/10 ${className}`}
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-success dark:text-success-dark" aria-hidden="true" />
			) : (
				<Copy className="h-3.5 w-3.5" aria-hidden="true" />
			)}
		</button>
	);
}
