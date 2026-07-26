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
					Make your next move with someone who actually picks up
				</h2>
				<p className="relative mx-auto mt-4 max-w-lg text-white/80">
					One quick search and you&apos;re talking to a real agent — not a chatbot, not a form that disappears into
					a queue.
				</p>
				<div className="relative mt-8 flex flex-wrap justify-center gap-3">
					<Button href="/#search" variant="brass">
						Find my agent
					</Button>
					<Button href="/#leaderboard" variant="ghost" className="border-white/30 text-white hover:border-white/50">
						Meet the team
					</Button>
				</div>
			</div>
		</section>
	);
}
