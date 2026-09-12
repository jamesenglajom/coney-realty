"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "./ui/SectionHeading";

const ACTIVE_WIDTH = 44;

// One image strip. Collapsed, it's a narrow grayscale sliver with the rank
// number and a vertical name label; hovered/focused/tapped, it widens, goes
// full color, and the name reads horizontally with a "view profile" cue —
// the classic expanding-panorama gallery effect. The photo/scrim/name here
// are deliberately mode-invariant (white text on a dark photo scrim reads
// fine regardless of site theme — same convention as any other photo-overlay
// badge in the app); only the section chrome around the row adapts.
function Panel({ entry, index, isActive, restWidth, onActivate }) {
	const width = isActive ? ACTIVE_WIDTH : restWidth;

	const content = (
		<>
			<Image
				src={entry.photo}
				alt={entry.name}
				fill
				sizes="(max-width: 640px) 60vw, 40vw"
				className={`object-cover object-top transition-all duration-700 ease-out ${
					isActive ? "scale-100 grayscale-0" : "scale-110 grayscale"
				}`}
			/>
			<span
				className={`pointer-events-none absolute inset-0 bg-linear-to-t transition-opacity duration-500 ${
					isActive ? "from-black/85 via-black/10 to-transparent" : "from-black/70 via-black/10 to-transparent"
				}`}
				aria-hidden="true"
			/>

			<span className="absolute left-3 top-3 font-display text-2xl font-bold text-white/30 sm:left-4 sm:top-4 sm:text-3xl">
				{String(index + 1).padStart(2, "0")}
			</span>

			{/* Collapsed: name reads bottom-to-top along the narrow strip. */}
			<span
				className={`pointer-events-none absolute inset-0 flex items-end justify-center pb-6 transition-opacity duration-300 sm:pb-8 ${
					isActive ? "opacity-0" : "opacity-100"
				}`}
			>
				<span className="[writing-mode:vertical-rl] whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.25em] text-white/85 sm:text-xs">
					{entry.name}
				</span>
			</span>

			{/* Expanded: full name + CTA reads normally along the bottom. */}
			<span
				className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-1.5 p-4 transition-all duration-500 sm:p-6 ${
					isActive ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
				}`}
			>
				<span className="h-px w-8 bg-theme-gold" />
				<span className="font-display text-lg font-bold leading-tight text-white sm:text-2xl">{entry.name}</span>
				{entry.agentId ? (
					<span className="text-[11px] font-semibold uppercase tracking-wide text-theme-gold">View profile →</span>
				) : null}
			</span>
		</>
	);

	const sharedProps = {
		onMouseEnter: onActivate,
		onFocus: onActivate,
		onClick: onActivate,
		style: { width: `${width}%`, transition: "width 700ms cubic-bezier(0.22,1,0.36,1)" },
		className: "group relative block h-full shrink-0 overflow-hidden outline-none",
	};

	if (entry.agentId) {
		return (
			<Link href={`/agents/${entry.agentId}`} {...sharedProps}>
				{content}
			</Link>
		);
	}

	return (
		<div role="button" tabIndex={0} {...sharedProps}>
			{content}
		</div>
	);
}

// Ranks 6-10, below the panorama — same "hidden until hover" idea as the
// poster grid's circles, adapted to this section's own theme-adaptive
// editorial look (light/dark, not the poster's mode-invariant black) rather
// than reusing its printed-poster gold sunburst styling.
function RestRow({ entries }) {
	if (entries.length === 0) return null;

	return (
		<ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-10">
			{entries.map((entry, index) => {
				const avatar = (
					<span className="relative block">
						<span className="relative block h-16 w-16 overflow-hidden rounded-full ring-2 ring-theme-gold transition-transform duration-300 ease-out group-hover:scale-105 sm:h-24 sm:w-24">
							<Image
								src={entry.photo}
								alt={entry.name}
								fill
								sizes="96px"
								className="object-cover object-top"
							/>
						</span>
						<span className="absolute -left-1 -top-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-theme-blue text-[10px] font-bold text-theme-gold ring-2 ring-white dark:ring-surface-dark">
							{index + 6}
						</span>
					</span>
				);

				return (
					<li key={entry.id} className="group relative">
						{entry.agentId ? (
							<Link href={`/agents/${entry.agentId}`} className="block">
								{avatar}
							</Link>
						) : (
							<div className="block">{avatar}</div>
						)}
						<span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-theme-blue px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white dark:text-theme-blue">
							{entry.name}
						</span>
					</li>
				);
			})}
		</ul>
	);
}

// heading/periodLabel come from the same admin-managed leaderboard_config
// row the original poster section reads (src/app/(admin)/admin/leaderboard)
// — one backend source, whichever homepage section is live shows it.
export default function TopPerformersPanoramaClient({ entries, rest = [], heading, periodLabel }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const restWidth = (100 - ACTIVE_WIDTH) / Math.max(entries.length - 1, 1);

	return (
		<section
			id="leaderboard"
			aria-label="Top performers panorama"
			className="border-t border-theme-gray/15 py-20 dark:border-border-dark sm:py-28"
		>
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<SectionHeading
					eyebrow={periodLabel || "Meet the team"}
					title={heading}
					className="mx-auto max-w-2xl text-center [&_p]:mx-auto"
				/>

				<div
					className="relative mt-12 flex h-85 w-full overflow-hidden bg-black ring-1 ring-theme-gray/15 dark:ring-white/10 sm:h-110 lg:h-140"
					onMouseLeave={() => setActiveIndex(0)}
				>
					{entries.map((entry, index) => (
						<Panel
							key={entry.id}
							entry={entry}
							index={index}
							isActive={index === activeIndex}
							restWidth={restWidth}
							onActivate={() => setActiveIndex(index)}
						/>
					))}
				</div>

				<RestRow entries={rest} />
			</div>
		</section>
	);
}
