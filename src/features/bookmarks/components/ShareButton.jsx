"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

// Same two variants as BookmarkButton — "overlay" for a card's cover photo,
// "ghost" for an inline pill in a light-background header row (PDP).
const VARIANT_CLASSES = {
	overlay: "h-8 w-8 rounded-full bg-black/55 text-white hover:bg-black/75",
	ghost:
		"h-9 gap-1.5 rounded-xl px-3 text-sm font-medium text-theme-blue hover:bg-theme-gold-light dark:text-white dark:hover:bg-white/5",
};

// Doubles as a referral-link grabber (same idea as GetMyUrlButton) — every
// caller only ever renders this for a signed-in staff user (guests get no
// share button at all, see PropertyCard/PDP), so `agentId` is effectively
// always present here; ?agent=<id> rides along on whatever gets shared or
// copied, same attribution src/features/viewings/referral.js picks back up
// later. Web Share API where it exists (mobile browsers mostly — opens the
// native share sheet), copy-to-clipboard everywhere else. `path` is a
// site-relative URL (e.g. `/property/<slug>`) resolved against the current
// origin at click time, not passed as an absolute URL, since this is a
// shared client component with no reliable server-side "current site URL"
// to bake in.
export default function ShareButton({ path, title, agentId, variant = "overlay", className = "" }) {
	async function handleClick(event) {
		event.preventDefault();
		event.stopPropagation();

		const url = new URL(path, window.location.origin);
		if (agentId) url.searchParams.set("agent", agentId);
		const shareUrl = url.toString();

		if (navigator.share) {
			try {
				await navigator.share({ title, url: shareUrl });
			} catch {
				// User cancelled the native share sheet — not an error.
			}
			return;
		}

		try {
			await navigator.clipboard.writeText(shareUrl);
			toast.success(agentId ? "Link copied — shares with your referral ID." : "Link copied to clipboard.");
		} catch {
			toast.error("Couldn't copy the link — copy it from the address bar instead.");
		}
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label="Share this property"
			className={`inline-flex items-center justify-center backdrop-blur-sm transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
		>
			<Share2 className="h-4 w-4" aria-hidden="true" />
			{variant === "ghost" ? <span>Share</span> : null}
		</button>
	);
}
