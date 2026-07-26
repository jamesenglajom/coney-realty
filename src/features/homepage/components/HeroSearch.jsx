import Image from "next/image";
import { Search } from "lucide-react";
import { PRICE_BANDS, HERO_IMAGE } from "@/features/homepage/data";
import { listPublishedCityStates } from "@/features/homepage/queries";
import { PROPERTY_TYPES } from "@/features/properties/schemas";
import Eyebrow from "./ui/Eyebrow";
import AgentResults from "./AgentResults";

const FIELD_CLASSES =
	"w-full rounded-xl border border-white/20 bg-white/90 px-3.5 py-3 text-sm text-txt-primary outline-none focus:border-theme-gold dark:bg-white/10 dark:text-white";
const LABEL_CLASSES = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70";

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
					<form
						method="GET"
						action="/"
						className="grid gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
					>
						<div>
							<label htmlFor="loc" className={LABEL_CLASSES}>
								Location
							</label>
							<select id="loc" name="location" defaultValue={location} className={FIELD_CLASSES}>
								<option value="">Anywhere</option>
								{cityStates.map((city) => (
									<option key={city} value={city}>
										{city}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor="type" className={LABEL_CLASSES}>
								Property type
							</label>
							<select id="type" name="type" defaultValue={type} className={FIELD_CLASSES}>
								<option value="">Any type</option>
								{PROPERTY_TYPES.map((propertyType) => (
									<option key={propertyType} value={propertyType}>
										{propertyType}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor="price" className={LABEL_CLASSES}>
								Budget
							</label>
							<select id="price" name="price" defaultValue={price} className={FIELD_CLASSES}>
								{PRICE_BANDS.map((band, index) => (
									<option key={band.label} value={index}>
										{band.label}
									</option>
								))}
							</select>
						</div>
						<button
							type="submit"
							className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-theme-gold px-6 text-sm font-semibold text-theme-blue transition-colors hover:brightness-105"
						>
							<Search className="h-4 w-4" aria-hidden="true" />
							Find agents
						</button>
					</form>
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
