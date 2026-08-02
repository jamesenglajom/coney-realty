"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPropertyImageForSeed } from "@/features/homepage/data";

const MAX_IMAGES = 20;

// Photos are static files an admin drops into public/properties/ named
// {slug}_img_1.webp, {slug}_img_2.webp, ... — there's no DB column tracking
// how many exist, so this probes sequentially (HEAD request, no image
// decode) and stops at the first missing index. Falls back to the
// deterministic placeholder pool if none exist yet.
function usePropertyImages(slug) {
	const [images, setImages] = useState(null);

	useEffect(() => {
		let cancelled = false;
		setImages(null);

		async function probe() {
			const found = [];
			for (let i = 1; i <= MAX_IMAGES; i += 1) {
				const url = `/properties/${slug}_img_${i}.webp`;
				try {
					const res = await fetch(url, { method: "HEAD" });
					if (!res.ok) break;
					found.push(url);
				} catch {
					break;
				}
			}
			if (!cancelled) setImages(found);
		}

		if (slug) probe();
		else setImages([]);

		return () => {
			cancelled = true;
		};
	}, [slug]);

	return images;
}

export default function PropertyPhotoGallery({ slug, seed, alt }) {
	const images = usePropertyImages(slug);
	const [activeIndex, setActiveIndex] = useState(0);

	if (images === null) {
		return (
			<div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-theme-gray/15 dark:bg-white/5" />
		);
	}

	const gallery = images.length > 0 ? images : [getPropertyImageForSeed(seed)];
	const safeIndex = Math.min(activeIndex, gallery.length - 1);

	function showPrev() {
		setActiveIndex((current) => (current - 1 + gallery.length) % gallery.length);
	}

	function showNext() {
		setActiveIndex((current) => (current + 1) % gallery.length);
	}

	return (
		<div>
			<div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-theme-gray/10 dark:bg-white/5">
				<Image
					src={gallery[safeIndex]}
					alt={alt}
					fill
					priority
					sizes="(min-width: 1024px) 800px, 100vw"
					className="object-cover"
				/>
				{gallery.length > 1 ? (
					<>
						<button
							type="button"
							onClick={showPrev}
							aria-label="Previous photo"
							className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-theme-blue shadow-md transition-colors hover:bg-white dark:bg-black/70 dark:text-white dark:hover:bg-black/90"
						>
							<ChevronLeft className="h-5 w-5" aria-hidden="true" />
						</button>
						<button
							type="button"
							onClick={showNext}
							aria-label="Next photo"
							className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-theme-blue shadow-md transition-colors hover:bg-white dark:bg-black/70 dark:text-white dark:hover:bg-black/90"
						>
							<ChevronRight className="h-5 w-5" aria-hidden="true" />
						</button>
						<span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
							{safeIndex + 1} / {gallery.length}
						</span>
					</>
				) : null}
			</div>

			{gallery.length > 1 ? (
				<div className="mt-3 flex gap-2 overflow-x-auto pb-1">
					{gallery.map((src, index) => (
						<button
							key={src}
							type="button"
							onClick={() => setActiveIndex(index)}
							aria-label={`Show photo ${index + 1}`}
							className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition-all ${
								index === safeIndex ? "ring-theme-gold" : "ring-transparent opacity-70 hover:opacity-100"
							}`}
						>
							<Image src={src} alt="" fill sizes="80px" className="object-cover" />
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
