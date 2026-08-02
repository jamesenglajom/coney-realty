import Image from "next/image";
import { HERO_IMAGE } from "@/features/homepage/data";
import { listPublishedCityStates } from "@/features/homepage/queries";
import Eyebrow from "./ui/Eyebrow";
import FindAgentsForm from "./FindAgentsForm";

export default async function HeroSearch() {
	const cityStates = await listPublishedCityStates();

	return (
		<section id="top" className="relative isolate overflow-hidden">
			<div className="absolute inset-0 -z-20 overflow-hidden">
				<Image
					src={HERO_IMAGE}
					alt=""
					fill
					priority
					sizes="100vw"
					className="animate-kenburns object-cover motion-reduce:animate-none"
				/>
			</div>
			<div className="absolute inset-0 -z-10 bg-gradient-to-b from-theme-blue/75 via-theme-blue/55 to-theme-blue/90" />

			<div className="mx-auto flex min-h-[92svh] max-w-6xl flex-col justify-end gap-10 px-5 pb-16 pt-28 sm:px-8">
				<div className="max-w-2xl text-white">
					<Eyebrow tone="on-dark">People, not portals</Eyebrow>
					<h1 className="mt-4 font-display text-[clamp(40px,8vw,76px)] font-semibold leading-[1.02]">
						See the homes,
						<br />
						meet the agent who knows them.
					</h1>
					<p className="mt-5 max-w-lg text-lg text-white/85">
						Tell us where you want to live, your budget, and the kind of home. We&apos;ll show you matching listings
						— each one with a real local agent you can call or email today, not a call center.
					</p>
				</div>

				<div id="search">
					<FindAgentsForm cityStates={cityStates} defaultLocation="" defaultType="" defaultPrice="0" />
					<p className="mt-3 text-xs text-white/70">
						Every result links to a real listing and the agent behind it — no forms, no wait.
					</p>
				</div>
			</div>
		</section>
	);
}
