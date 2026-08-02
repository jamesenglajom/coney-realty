"use client";

import { useState } from "react";
import Image from "next/image";
import { getPropertyImageForSeed } from "@/features/homepage/data";

// Real per-property photos are static files an admin drops into
// public/properties/ (see PropertyPhotoGallery), not something the DB knows
// about — so the only way to know whether one exists is to try loading it
// and fall back on error. Every property always has *a* photo either way:
// the deterministic placeholder pool covers listings with no real photos yet.
export default function PropertyCoverImage({ slug, seed, alt, badge, sizes, className = "aspect-[4/3]" }) {
	const [errored, setErrored] = useState(false);
	const src = !errored && slug ? `/properties/${slug}_img_1.webp` : getPropertyImageForSeed(seed);

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
		</div>
	);
}
