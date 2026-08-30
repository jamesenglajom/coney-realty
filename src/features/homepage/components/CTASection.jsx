import Eyebrow from "./ui/Eyebrow";
import Button from "@/components/ui/Button";

export default function CTASection() {
	return (
		<section aria-label="Get started" className="px-5 pb-20 sm:px-8 sm:pb-28">
			<div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-theme-blue px-6 py-16 text-center text-white sm:px-16 sm:py-20">
				<div
					className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-theme-gold/20 blur-3xl"
					aria-hidden="true"
				/>
				<Eyebrow tone="on-dark" className="justify-center">
					Ready when you are
				</Eyebrow>
				<h2 className="relative mx-auto mt-4 max-w-xl font-display text-[clamp(32px,5vw,52px)] font-semibold">
					Browse the listings, then book the viewing
				</h2>
				<p className="relative mx-auto mt-4 max-w-lg text-white/80">
					Filter by location, budget, and property type to see real listings — then request a viewing and our team
					lines up the rest.
				</p>
				<div className="relative mt-8 flex flex-wrap justify-center gap-3">
					<Button href="/properties" variant="brass">
						Browse properties
					</Button>
					<Button
						href="/schedule-viewing"
						variant="ghost"
						className="border-white/30 text-white hover:border-white/50"
					>
						Schedule a viewing
					</Button>
				</div>
			</div>
		</section>
	);
}
