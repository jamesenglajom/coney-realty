"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

// Only ever rendered for a signed-in user (see the PDP/PLP pages — gated by
// getCurrentUser() server-side, not by role) so an agent or admin can grab
// a shareable link to whatever page they're currently on, with their own
// id attached as ?agent=<id>. See src/features/viewings/referral.js for how
// that id gets picked back up and attributed to a viewing request later.
export default function GetMyUrlButton({ userId, className }) {
	const [copied, setCopied] = useState(false);

	async function handleClick() {
		const url = new URL(window.location.href);
		url.searchParams.set("agent", userId);

		try {
			await navigator.clipboard.writeText(url.toString());
			setCopied(true);
			toast.success("Link copied — shares this page with your referral ID.");
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error("Couldn't copy — copy it manually from the address bar and add ?agent=" + userId);
		}
	}

	return (
		<Button type="button" variant="ghost" size="sm" onClick={handleClick} className={className}>
			{copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
			Get my URL
		</Button>
	);
}
