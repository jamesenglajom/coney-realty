import Image from "next/image";
import { listPublishedCityStates } from "@/features/homepage/queries";
import { getBrandSettings } from "@/features/brand/queries";
import Eyebrow from "./ui/Eyebrow";
import HomeSearchForm from "./HomeSearchForm";

export default async function HeroSearch() {
	const [cityStates, brand] = await Promise.all([listPublishedCityStates(), getBrandSettings()]);

	return (
		<section id="top" className="relative isolate overflow-hidden">
			<div className="absolute inset-0 -z-20 overflow-hidden">
				<Image
					src={brand.bannerUrl}
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
					<Eyebrow tone="on-dark">Your trusted real estate partners</Eyebrow>
					<h1 className="mt-4 font-display text-[clamp(40px,8vw,76px)] font-semibold leading-[1.02]">
						Finding your home is easier with people you can trust.
					</h1>
					<p className="mt-5 max-w-lg text-lg text-white/85">
						Tell us your preferred location and budget, and we&apos;ll match you with verified properties and
						dedicated agents who will guide you every step of the way.
					</p>
				</div>

				<div id="search">
					<HomeSearchForm cityStates={cityStates} defaultLocation="" defaultType="" defaultPrice="0" />
					<p className="mt-3 text-xs text-white/70">
						Every result links to a real listing — book a viewing in a couple of clicks.
					</p>
				</div>
			</div>
		</section>
	);
}
