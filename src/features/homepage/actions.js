"use server";

import { getPublishedPropertySlugByCodeName } from "./queries";

// Public, unauthenticated action — backs the "search by code" modal on the
// homepage's search widget. Read-only (no mutation, no PII involved), so
// unlike submitViewingRequestAction this doesn't need reCAPTCHA — a code is
// just an alternate lookup key for an already-published listing, no
// meaningfully different exposure than guessing a slug.
export async function lookupPropertyByCodeAction(code) {
	const trimmed = code?.trim();
	if (!trimmed) return { error: "Enter a code first." };

	const slug = await getPublishedPropertySlugByCodeName(trimmed);
	if (!slug) return { error: "No listing matches that code." };

	return { success: true, slug };
}
