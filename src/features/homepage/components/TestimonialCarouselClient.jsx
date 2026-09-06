"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Ballet } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";

// Scoped to this carousel only — same "printed poster" script treatment as
// the leaderboard's period label (src/features/homepage/components/
// Leaderboard.jsx), not the site-wide font-display/font-body tokens.
const scriptFont = Ballet({ subsets: ["latin"], weight: "400" });

// One "reel" card: quote fills the card, the agent's photo sits tucked into
// the bottom-right corner (small, not a half-width hero image) — the
// signature/tagline reads to its left so the two never collide.
function TestimonialCard({ testimonial }) {
	const { quote, clientName, agentDisplayName, agentTagline, photo, agentId } = testimonial;

	const signature = (
		<>
			<p className={`${scriptFont.className} text-3xl leading-none text-theme-gold sm:text-4xl`}>
				{agentDisplayName}
			</p>
			{agentTagline ? (
				<p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-txt-muted dark:text-txt-muted-dark">
					{agentTagline}
				</p>
			) : null}
		</>
	);

	return (
		<div className="flex h-full min-h-90 flex-col justify-between overflow-hidden rounded-3xl border border-theme-gray/15 bg-white p-6 shadow-lg dark:border-border-dark dark:bg-surface-dark sm:p-7">
			<figure className="m-0">
				<span className="font-display text-5xl leading-none text-theme-gold" aria-hidden="true">
					&ldquo;
				</span>
				<blockquote className="mt-2 line-clamp-6 font-display text-[15px] font-medium italic leading-snug text-theme-blue dark:text-white sm:text-base">
					{quote}
				</blockquote>
				<figcaption className="mt-3 text-sm text-txt-muted dark:text-txt-muted-dark">— {clientName}</figcaption>
			</figure>

			<div className="mt-6 flex items-end justify-between gap-3">
				<div className="min-w-0">{agentId ? <Link href={`/agents/${agentId}`}>{signature}</Link> : signature}</div>
				<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-4 ring-theme-gold/40 sm:h-24 sm:w-24">
					<Image src={photo} alt={agentDisplayName} fill sizes="96px" className="object-cover" />
				</div>
			</div>
		</div>
	);
}

export default function TestimonialCarouselClient({ testimonials }) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", containScroll: "trimSnaps" }, [
		Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }),
	]);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return undefined;
		onSelect();
		emblaApi.on("select", onSelect);
		emblaApi.on("reInit", onSelect);
		return () => {
			emblaApi.off("select", onSelect);
			emblaApi.off("reInit", onSelect);
		};
	}, [emblaApi, onSelect]);

	return (
		<section
			aria-label="Client testimonials"
			className="border-y border-theme-gray/15 bg-theme-gold-light/40 dark:border-border-dark dark:bg-surface-dark/50"
		>
			<div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
				<SectionHeading
					eyebrow="In Their Words"
					title="Trusted by the Families We've Served"
					description="Don't just take our word for it — here's what clients say after the keys change hands."
					className="mx-auto max-w-2xl text-center [&_p]:mx-auto"
				/>

				<div className="relative mt-12">
					{/* Reels-style row — several portrait cards visible at once, each its
					    own snap point, rather than one full-width slide at a time. */}
					{/* px-3 gives the first/last card its own visible margin from the
					    section edge — without it they sat flush against the
					    container's own padding with nothing beyond the shared
					    inter-card gap. */}
					<div className="overflow-hidden px-3" ref={emblaRef}>
						<div className="flex gap-5">
							{testimonials.map((testimonial) => (
								<div
									key={testimonial.id}
									className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_46%] lg:flex-[0_0_31%]"
								>
									<TestimonialCard testimonial={testimonial} />
								</div>
							))}
						</div>
					</div>

					{testimonials.length > 1 ? (
						<>
							<button
								type="button"
								onClick={() => emblaApi?.scrollPrev()}
								aria-label="Previous testimonial"
								className="absolute -left-2 top-1/2 flex -translate-y-1/2 rounded-full bg-white p-1.5 text-theme-blue shadow-md hover:bg-theme-gold-light dark:bg-surface-dark dark:text-white dark:hover:bg-white/10 sm:-left-5 sm:p-2"
							>
								<ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
							</button>
							<button
								type="button"
								onClick={() => emblaApi?.scrollNext()}
								aria-label="Next testimonial"
								className="absolute -right-2 top-1/2 flex -translate-y-1/2 rounded-full bg-white p-1.5 text-theme-blue shadow-md hover:bg-theme-gold-light dark:bg-surface-dark dark:text-white dark:hover:bg-white/10 sm:-right-5 sm:p-2"
							>
								<ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
							</button>
						</>
					) : null}
				</div>

				{testimonials.length > 1 ? (
					<div className="mt-8 flex justify-center gap-2">
						{testimonials.map((testimonial, index) => (
							<button
								key={testimonial.id}
								type="button"
								onClick={() => emblaApi?.scrollTo(index)}
								aria-label={`Show testimonial ${index + 1}`}
								className={`h-2 rounded-full transition-all ${
									index === selectedIndex ? "w-6 bg-theme-gold" : "w-2 bg-theme-gray/30 dark:bg-white/20"
								}`}
							/>
						))}
					</div>
				) : null}
			</div>
		</section>
	);
}
