"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useBookmarkedIds } from "../useBookmarkedIds";

// Count badge starts hidden (empty ids until the mount-time localStorage
// read resolves — see useBookmarkedIds) so there's no hydration mismatch
// between server and client first paint. `showLabel` off (the desktop nav
// bar, where the icon reads fine on its own) drops the visible "Saved"
// text but keeps it for screen readers via aria-label; the mobile menu
// keeps the text visible since it's a list of labeled rows, not icons.
export default function SavedLink({ className = "", showLabel = true }) {
	const ids = useBookmarkedIds();

	return (
		<Link
			href="/saved"
			aria-label={showLabel ? undefined : "Saved properties"}
			className={`relative inline-flex items-center gap-1.5 ${className}`}
		>
			<Heart className="h-[18px] w-[18px]" aria-hidden="true" />
			{showLabel ? <span>Saved</span> : null}
			{ids.length > 0 ? (
				<span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-theme-gold px-1 text-[10px] font-bold text-theme-blue">
					{ids.length}
				</span>
			) : null}
		</Link>
	);
}
