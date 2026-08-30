"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Ballet } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Scoped to this carousel only — same "printed poster" script treatment as
// the leaderboard's period label (src/features/homepage/components/
// Leaderboard.jsx), not the site-wide font-display/font-body tokens.
const scriptFont = Ballet({ subsets: ["latin"], weight: "400" });

function TestimonialSlide({ testimonial }) {
	const { quote, clientName, agentDisplayName, agentTagline, photo, agentId } = testimonial;

	const signature = (
		<>
			<p className={`${scriptFont.className} text-4xl leading-none text-theme-gold sm:text-5xl`}>
				{agentDisplayName}
			</p>
			{agentTagline ? (
				<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-txt-muted dark:text-txt-muted-dark">
					{agentTagline}
				</p>
			) : null}
		</>
	);

	return (
		<div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
			<figure className="m-0">
				<span className="font-display text-6xl leading-none text-theme-gold" aria-hidden="true">
					&ldquo;
				</span>
				<blockquote className="mt-2 font-display text-[clamp(20px,3vw,26px)] font-medium italic leading-snug text-theme-blue dark:text-white">
					{quote}
				</blockquote>
				<figcaption className="mt-4 text-sm text-txt-muted dark:text-txt-muted-dark">— {clientName}</figcaption>
				<div className="mt-6">
					{agentId ? <Link href={`/agents/${agentId}`}>{signature}</Link> : signature}
				</div>
			</figure>

			<div className="relative mx-auto h-64 w-56 shrink-0 overflow-hidden rounded-[32px] bg-theme-gold sm:h-80 sm:w-64">
				<Image src={photo} alt={agentDisplayName} fill sizes="256px" className="object-cover" />
			</div>
		</div>
	);
}

export default function TestimonialCarouselClient({ testimonials }) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
		Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true }),
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
			className="border-y border-theme-gray/15 bg-theme-gold-light/40 dark:border-white/10 dark:bg-white/[0.02]"
		>
			<div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
				<div className="relative">
					<div className="overflow-hidden" ref={emblaRef}>
						<div className="flex">
							{testimonials.map((testimonial) => (
								<div key={testimonial.id} className="min-w-0 flex-[0_0_100%]">
									<TestimonialSlide testimonial={testimonial} />
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
								className="absolute -left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2 text-theme-blue shadow-md hover:bg-theme-gold-light dark:bg-surface-dark dark:text-white dark:hover:bg-white/10 sm:-left-5 sm:flex"
							>
								<ChevronLeft className="h-5 w-5" aria-hidden="true" />
							</button>
							<button
								type="button"
								onClick={() => emblaApi?.scrollNext()}
								aria-label="Next testimonial"
								className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2 text-theme-blue shadow-md hover:bg-theme-gold-light dark:bg-surface-dark dark:text-white dark:hover:bg-white/10 sm:-right-5 sm:flex"
							>
								<ChevronRight className="h-5 w-5" aria-hidden="true" />
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
