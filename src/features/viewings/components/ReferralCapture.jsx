"use client";

import { useEffect } from "react";
import { captureReferringAgentFromUrl } from "../referral";

// Rendered once in the public layout so every public page — not just
// /schedule-viewing — picks up a ?agent=<id> link. Reads window.location
// directly (no useSearchParams) so this stays a plain client component and
// doesn't force the layout into dynamic rendering.
export default function ReferralCapture() {
	useEffect(() => {
		captureReferringAgentFromUrl();
	}, []);

	return null;
}
