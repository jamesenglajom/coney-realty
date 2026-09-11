"use client";

import { useState } from "react";
import Image from "next/image";
import { getPropertyImageForSeed } from "@/features/homepage/data";

// `imageUrl` is the property's first Storage URL (image_urls[0], picked via
// the admin media library) — passed straight through from an already-run
// query, no guessing or Storage call needed here. `onError` stays as a
// safety net in case the DB points at a file that's since been deleted from
// the library. Every property always has *a* photo either way: the
// deterministic placeholder pool covers listings with no real photos yet.
export default function PropertyCoverImage({ imageUrl, seed, alt, badge, sizes, className = "aspect-[4/3]" }) {
	const [errored, setErrored] = useState(false);
	const src = !errored && imageUrl ? imageUrl : getPropertyImageForSeed(seed);

	return (
		<div className={`relative ${className}`}>
			<Image
				src={src}
				alt={alt}
				fill
				sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
				className="object-cover"
				onError={() => setErrored(true)}
			/>
			{badge ? (
				<span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-theme-blue backdrop-blur-sm dark:bg-black/70 dark:text-white">
					{badge}
				</span>
			) : null}
			{!imageUrl || errored ? (
				<span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
					No photos yet
				</span>
			) : null}
		</div>
	);
}
