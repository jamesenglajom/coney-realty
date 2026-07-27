"use client";

import { useTransition } from "react";
import Button from "@/components/ui/Button";
import { recordAgentContactAction } from "@/features/homepage/actions";
import { getStoredVisitorEmail } from "@/features/homepage/visitorEmail";

// Fires a background log of "this visitor contacted this agent" — doesn't
// block or delay the mailto:/tel: action itself (that's a same-tab, no-unload
// link, so there's nothing to wait on). If somehow no visitor email is on
// file (gate was bypassed), it just skips logging rather than blocking contact.
export default function ContactAgentButton({ href, agentId, method, searchContext, variant, className, children }) {
	const [, startTransition] = useTransition();

	function handleClick() {
		const visitorEmail = getStoredVisitorEmail();
		if (!visitorEmail) return;

		startTransition(async () => {
			await recordAgentContactAction({
				visitorEmail,
				agentId,
				contactMethod: method,
				searchLocation: searchContext?.location || undefined,
				searchPropertyType: searchContext?.type || undefined,
				searchPriceBand: searchContext?.price || undefined,
			});
		});
	}

	return (
		<Button href={href} variant={variant} className={className} onClick={handleClick}>
			{children}
		</Button>
	);
}
