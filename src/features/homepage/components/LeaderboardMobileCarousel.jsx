"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Fjalla_One } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Same "printed poster" name-bar treatment as the desktop grid in
// Leaderboard.jsx — duplicated here (rather than imported) because that file
// pulls in a server-only data query, which a "use client" module can't do.
const namesFont = Fjalla_One({ subsets: ["latin"], weight: "400" });

const SUNBURST_BACKGROUND =
	"repeating-conic-gradient(from 0deg, #f2c78e 0deg 9deg, #e3a965 9deg 18deg, #c98a49 18deg 27deg, #e3a965 27deg 36deg)";

function EntryFigure({ entry, children, className }) {
	if (entry.agentId) {
		return (
			<Link href={`/agents/${entry.agentId}`} className={className}>
				{children}
			</Link>
		);
	}
	return <div className={className}>{children}</div>;
}

function FeaturedCard({ entry }) {
	return (
		<EntryFigure entry={entry} className="group flex h-full flex-col">
			<span
				className="relative block aspect-2/3 w-full overflow-hidden p-1.5"
				style={{ backgroundImage: SUNBURST_BACKGROUND }}
			>
				<span className="relative block h-full w-full overflow-hidden shadow-[inset_2px_2px_4px_rgba(255,255,255,0.35),inset_-3px_-3px_6px_rgba(0,0,0,0.65)]">
					<Image src={entry.photo} alt={entry.name} fill sizes="45vw" className="object-cover" />
					<span className="pointer-events-none absolute inset-0 bg-linear-to-b from-theme-gold/35 via-transparent to-black/60 mix-blend-overlay" />
					<span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
				</span>
			</span>
			<span className="flex flex-1 items-center justify-center bg-[#726b59] px-2 py-2.5 text-center">
				<span className={`${namesFont.className} block truncate text-xs uppercase tracking-wide text-white`}>
					{entry.name}
				</span>
			</span>
		</EntryFigure>
	);
}

// Mobile-only "Stories"/"My Day"-style carousel — a few cards peek at once,
// paged with prev/next chevrons (embla, no autoplay — this is a quick-glance
// list, not a slideshow). Swapped out entirely for the poster grid at sm:
// and up (see Leaderboard.jsx).
export default function LeaderboardMobileCarousel({ featured }) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

	return (
		<div className="relative mt-14 sm:hidden">
			<div className="overflow-hidden" ref={emblaRef}>
				<div className="flex gap-3">
					{featured.map((entry) => (
						<div
							key={entry.id}
							className="min-w-0 flex-[0_0_38%] overflow-hidden rounded-2xl bg-black shadow-[0_0_60px_-20px_rgba(182,170,132,0.55)] ring-1 ring-theme-gold/20"
						>
							<FeaturedCard entry={entry} />
						</div>
					))}
				</div>
			</div>

			{featured.length > 1 ? (
				<>
					<button
						type="button"
						onClick={() => emblaApi?.scrollPrev()}
						aria-label="Previous top performer"
						className="absolute -left-2 top-1/2 flex -translate-y-1/2 rounded-full bg-white p-1.5 text-theme-blue shadow-md hover:bg-theme-gold-light"
					>
						<ChevronLeft className="h-4 w-4" aria-hidden="true" />
					</button>
					<button
						type="button"
						onClick={() => emblaApi?.scrollNext()}
						aria-label="Next top performer"
						className="absolute -right-2 top-1/2 flex -translate-y-1/2 rounded-full bg-white p-1.5 text-theme-blue shadow-md hover:bg-theme-gold-light"
					>
						<ChevronRight className="h-4 w-4" aria-hidden="true" />
					</button>
				</>
			) : null}
		</div>
	);
}
