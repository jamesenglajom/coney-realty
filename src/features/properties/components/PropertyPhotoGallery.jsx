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

// `badge` renders top-left over the main image (property type / on-hold
// pills) — title/price live in the page itself now, not composed onto the
// photo, so this component only ever needs to know about the badge slot.
export default function PropertyPhotoGallery({ slug, seed, alt, badge }) {
	const images = usePropertyImages(slug);
	const [activeIndex, setActiveIndex] = useState(0);

	if (images === null) {
		return <div className="aspect-video max-h-[70vh] w-full animate-pulse bg-theme-gray/15 dark:bg-white/5" />;
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
			<div className="relative aspect-video max-h-[70vh] w-full overflow-hidden bg-theme-gray/10 dark:bg-white/5">
				<Image
					src={gallery[safeIndex]}
					alt={alt}
					fill
					priority
					sizes="100vw"
					className="object-contain"
				/>

				{badge ? <div className="absolute left-4 top-4 sm:left-6 sm:top-6">{badge}</div> : null}

				{images.length === 0 ? (
					<span className="absolute right-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white sm:right-6 sm:top-6">
						No photos yet
					</span>
				) : null}

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
						<span className="absolute right-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white sm:right-6 sm:top-6">
							{safeIndex + 1} / {gallery.length}
						</span>
					</>
				) : null}
			</div>

			{gallery.length > 1 ? (
				// Outer div owns the scroll/padding; the inner row is sized to its
				// content (w-fit) and centered via mx-auto — safe unlike
				// justify-center on the scroll container itself, which clips the
				// far side of an overflowing row in some browsers. When the row is
				// wider than the viewport, w-fit just lets it overflow and mx-auto
				// collapses to 0, so it scrolls normally from the left.
				<div className="mt-3 overflow-x-auto px-5 pb-1 sm:px-8">
					<div className="mx-auto flex w-fit gap-2">
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
				</div>
			) : null}
		</div>
	);
}
