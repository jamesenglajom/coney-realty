"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { isBookmarked, toggleBookmark } from "../storage";

// "overlay" — a dark circle over a card's cover photo (see PropertyCard).
// "ghost" — an inline pill matching the site's Button ghost variant, for
// contexts with their own light background (the PDP header row), where a
// dark overlay circle would look out of place.
const VARIANT_CLASSES = {
	overlay: "h-8 w-8 rounded-full bg-black/55 text-white hover:bg-black/75",
	ghost:
		"h-9 gap-1.5 rounded-xl px-3 text-sm font-medium text-theme-blue hover:bg-theme-gold-light dark:text-white dark:hover:bg-white/5",
};

// Sits as a sibling over a card's cover image, not inside the card's own
// <Link> — nesting a <button> inside an <a> is invalid HTML and would
// trigger navigation on every click regardless of stopPropagation. `saved`
// starts false (server-rendered, no localStorage yet) and syncs on mount.
export default function BookmarkButton({ propertyId, variant = "overlay", className = "" }) {
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		setSaved(isBookmarked(propertyId));
	}, [propertyId]);

	function handleClick(event) {
		event.preventDefault();
		event.stopPropagation();
		setSaved(toggleBookmark(propertyId));
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label={saved ? "Remove from saved properties" : "Save this property"}
			aria-pressed={saved}
			className={`inline-flex items-center justify-center backdrop-blur-sm transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
		>
			<Heart className={`h-4 w-4 ${saved ? "fill-current text-danger" : ""}`} aria-hidden="true" />
			{variant === "ghost" ? <span>{saved ? "Saved" : "Save"}</span> : null}
		</button>
	);
}
