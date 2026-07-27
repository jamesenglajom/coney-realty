import Image from "next/image";
import { HERO_IMAGE } from "@/features/homepage/data";
import { listPublishedCityStates } from "@/features/homepage/queries";
import Eyebrow from "./ui/Eyebrow";
import FindAgentsForm from "./FindAgentsForm";
import AgentResults from "./AgentResults";

export default async function HeroSearch({ searchParams }) {
	const hasSearched =
		searchParams?.location !== undefined || searchParams?.type !== undefined || searchParams?.price !== undefined;
	const location = searchParams?.location ?? "";
	const type = searchParams?.type ?? "";
	const price = searchParams?.price ?? "0";
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
						Meet the agent,
						<br />
						not the listing feed.
					</h1>
					<p className="mt-5 max-w-lg text-lg text-white/85">
						Tell us where you want to live, your budget, and the kind of home. We match you with vetted local
						agents you can call or email today — including the homes that never hit public sites.
					</p>
				</div>

				<div id="search">
					<FindAgentsForm
						cityStates={cityStates}
						defaultLocation={location}
						defaultType={type}
						defaultPrice={price}
					/>
					<p className="mt-3 text-xs text-white/70">
						Search returns agents, not addresses. Full details come from the person who knows the home.
					</p>

					{hasSearched ? (
						<div className="mt-6">
							<AgentResults location={location} type={type} price={price} />
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
}
