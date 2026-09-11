import Image from "next/image";
import Link from "next/link";
import { Ballet, Fjalla_One } from "next/font/google";
import { Award } from "lucide-react";
import { getPublicLeaderboard } from "@/features/leaderboard/queries";
import LeaderboardMobileCarousel from "./LeaderboardMobileCarousel";

// Deliberately scoped to this one section, not added to the site-wide
// font-display/font-body tokens (Montserrat/Inter — see CLAUDE.md) — this
// board is a distinct "printed award poster" moment matching the client's
// reference image, not the rest of the public site's typography. The
// heading uses Times New Roman (a system font, no loader needed).
const scriptFont = Ballet({ subsets: ["latin"], weight: "400" });
const namesFont = Fjalla_One({ subsets: ["latin"], weight: "400" });

// Repeating fractal-noise SVG, tiled as a background — the grain texture
// from the reference poster, generated in CSS rather than shipping an
// image asset.
const NOISE_BACKGROUND =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Abstract sunburst, tones of #e3a965 — sits behind each top-5 photo (the
// photo is inset with padding so this peeks out as a frame around it),
// echoing the golden studio-backdrop glow behind each headshot in the
// reference poster.
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

// Photo + name-bar for one top-5 entry (desktop/tablet poster grid — the
// mobile carousel keeps its own copy in LeaderboardMobileCarousel.jsx since
// it can't share a "use client" module with this server component).
// Individually rounded/shadowed/ringed now that the grid uses a real gap
// instead of touching hairline-divided cells, with a hover "float" — the
// card lifts and its shadow/ring bloom while the photo zooms in.
function FeaturedCard({ entry }) {
	return (
		<EntryFigure
			entry={entry}
			className="group flex h-full flex-col overflow-hidden rounded-2xl bg-black shadow-[0_12px_28px_-16px_rgba(0,0,0,0.9)] ring-1 ring-theme-gold/20 transition-all duration-300 ease-out hover:-translate-y-2.5 hover:shadow-[0_24px_45px_-16px_rgba(182,170,132,0.55)] hover:ring-theme-gold/60"
		>
			<span
				className="relative block aspect-2/3 w-full overflow-hidden p-1.5"
				style={{ backgroundImage: SUNBURST_BACKGROUND }}
			>
				<span className="relative block h-full w-full overflow-hidden rounded-sm shadow-[inset_2px_2px_4px_rgba(255,255,255,0.35),inset_-3px_-3px_6px_rgba(0,0,0,0.65)]">
					<Image
						src={entry.photo}
						alt={entry.name}
						fill
						sizes="(max-width: 640px) 45vw, (max-width: 1024px) 20vw, 200px"
						className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
					/>
					{/* Warm gold cast up top (matching the poster's color grade),
					    fading to a dark base so the name bar below reads clean. */}
					<span className="pointer-events-none absolute inset-0 bg-linear-to-b from-theme-gold/35 via-transparent to-black/60 mix-blend-overlay" />
					<span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
				</span>
			</span>
			<span className="flex flex-1 items-center justify-center bg-[#726b59] px-2 py-3.5 text-center">
				<span className={`${namesFont.className} block truncate text-sm uppercase tracking-wide text-white sm:text-base`}>
					{entry.name}
				</span>
			</span>
		</EntryFigure>
	);
}

export default async function Leaderboard() {
	const { config, entries } = await getPublicLeaderboard();

	if (!config.isPublished || entries.length === 0) return null;

	const featured = entries.slice(0, 5);
	const rest = entries.slice(5, 10);

	return (
		<section id="leaderboard" className="relative isolate overflow-hidden bg-black text-white">
			{/* Client-supplied backdrop photo behind the whole section, dimmed so
			    the gold glow/noise/content above it all stay legible. */}
			<div className="pointer-events-none absolute inset-0 -z-30" aria-hidden="true">
				<Image
					src="/top_10/top_performers_bg.jpg"
					alt=""
					fill
					sizes="100vw"
					className="object-cover object-top"
				/>
				<div className="absolute inset-0 bg-black/75" />
			</div>
			{/* Warm gold glow spanning the heading through the photo row, plus a
			    faint crest — echoes the printed board's emblem watermark. */}
			<div
				className="pointer-events-none absolute left-1/2 top-0 -z-20 h-160 w-225 -translate-x-1/2 -translate-y-1/4 rounded-full bg-theme-gold/25 blur-[130px]"
				aria-hidden="true"
			/>
			<Award
				className="pointer-events-none absolute left-1/2 top-10 -z-10 h-28 w-28 -translate-x-1/2 text-theme-gold/10 sm:h-36 sm:w-36"
				aria-hidden="true"
			/>
			{/* Grain texture over everything else in the section. */}
			<div
				className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] mix-blend-overlay"
				style={{ backgroundImage: NOISE_BACKGROUND }}
				aria-hidden="true"
			/>

			<div className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 sm:py-28">
				{config.periodLabel ? (
					<p className={`${scriptFont.className} text-5xl leading-none text-theme-gold sm:text-6xl`}>
						{config.periodLabel}
					</p>
				) : null}
				<h2
					style={{ fontFamily: "'Times New Roman', Times, serif" }}
					className="mt-3 text-[clamp(34px,6vw,64px)] font-bold uppercase tracking-[0.03em] text-white"
				>
					{config.heading}
				</h2>

				{/* Mobile: horizontal "Stories"/"My Day"-style carousel, with
				    prev/next chevrons — swapped out entirely for the poster grid at
				    sm: and up. */}
				<LeaderboardMobileCarousel featured={featured} />

				{/* Tablet/desktop: the printed-poster grid, now with real gaps between
				    cards (each is its own floating, shadowed tile) instead of the
				    touching hairline-divided cells this started as. */}
				<div className="mx-auto mt-14 hidden max-w-4xl grid-cols-5 gap-5 sm:grid">
					{featured.map((entry) => (
						<FeaturedCard key={entry.id} entry={entry} />
					))}
				</div>

				{config.showRanks6To10 && rest.length > 0 ? (
					<ul className="mt-14 flex flex-wrap justify-center gap-6 sm:gap-10">
						{rest.map((entry) => (
							<li key={entry.id}>
								<EntryFigure entry={entry} className="flex flex-col items-center">
									<span className="rounded-full bg-theme-gold p-1">
										<span className="relative block h-18 w-18 overflow-hidden rounded-full ring-2 ring-black sm:h-22 sm:w-22">
											<Image src={entry.photo} alt={entry.name} fill sizes="96px" className="object-cover object-top" />
										</span>
									</span>
									<span className="mt-2.5 max-w-28 truncate text-xs font-semibold uppercase tracking-wide text-white/85">
										{entry.name}
									</span>
								</EntryFigure>
							</li>
						))}
					</ul>
				) : null}
			</div>
		</section>
	);
}
