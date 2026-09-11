"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// A fixed link to the homepage with the agent's id attached (unlike
// GetMyUrlButton, which grabs whatever page the agent is currently on) —
// the one link meant to be shared as "my referral link", shown next to the
// "Clients referred to you via your link" copy on the My Referrals page and
// its dashboard counterpart.
export default function CopyReferralLinkButton({ agentId, className }) {
	const [copied, setCopied] = useState(false);
	const referralUrl = `${BASE_URL}/?agent=${agentId}`;

	async function handleClick() {
		try {
			await navigator.clipboard.writeText(referralUrl);
			setCopied(true);
			toast.success("Referral link copied.");
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error(`Couldn't copy — copy it manually: ${referralUrl}`);
		}
	}

	return (
		<Button type="button" variant="ghost" size="sm" onClick={handleClick} className={className}>
			{copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
			{copied ? "Copied" : "Copy my link"}
		</Button>
	);
}
