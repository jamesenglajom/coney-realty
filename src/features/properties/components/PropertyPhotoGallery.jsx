"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPropertyImageForSeed } from "@/features/homepage/data";

// `images` is the property's image_urls column (an ordered array of
// Supabase Storage public URLs, picked via the admin media library) — the
// page passes it straight through, no probing or Storage calls needed.
//
// `badge` renders top-left over the main image (property type / on-hold
// pills) — title/price live in the page itself now, not composed onto the
// photo, so this component only ever needs to know about the badge slot.
export default function PropertyPhotoGallery({ images, seed, alt, badge }) {
	const [activeIndex, setActiveIndex] = useState(0);

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
					quality={90}
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
