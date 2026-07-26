import Image from "next/image";
import { Bed, Bath } from "lucide-react";
import { getAgentById } from "@/features/homepage/data";

export default function PropertyCard({ property }) {
	const agent = getAgentById(property.agentId);

	return (
		<li className="overflow-hidden rounded-3xl border border-theme-gray/15 bg-white shadow-lg transition-shadow hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.03]">
			<div className="relative aspect-[4/3]">
				<Image
					src={property.image}
					alt={`${property.name} in ${property.city}`}
					fill
					sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
					className="object-cover"
				/>
				<span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-theme-blue backdrop-blur-sm dark:bg-black/70 dark:text-white">
					{property.type}
				</span>
			</div>
			<div className="p-5">
				<div className="flex items-baseline justify-between gap-3">
					<h3 className="text-lg font-semibold text-theme-blue dark:text-white">{property.name}</h3>
					<span className="whitespace-nowrap font-semibold text-theme-blue dark:text-theme-gold">
						{property.priceLabel}
					</span>
				</div>
				<p className="mt-1 text-sm text-txt-muted dark:text-txt-muted-dark">{property.city}</p>
				<div className="mt-4 flex gap-5 text-sm text-txt-secondary dark:text-txt-secondary-dark">
					<span className="inline-flex items-center gap-1.5">
						<Bed className="h-4 w-4" aria-hidden="true" />
						{property.beds} bd
					</span>
					<span className="inline-flex items-center gap-1.5">
						<Bath className="h-4 w-4" aria-hidden="true" />
						{property.baths} ba
					</span>
				</div>
				<div className="mt-5 flex items-center justify-between gap-2 border-t border-theme-gray/15 pt-4 text-xs text-txt-muted dark:border-white/10 dark:text-txt-muted-dark">
					<span>
						Listed by <strong className="font-semibold text-theme-blue dark:text-white">{agent.name}</strong>
					</span>
					<a
						href={`tel:${agent.phone}`}
						className="text-sm font-semibold text-theme-blue hover:underline dark:text-theme-gold"
					>
						Contact for details →
					</a>
				</div>
			</div>
		</li>
	);
}
