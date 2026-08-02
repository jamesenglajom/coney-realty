import Link from "next/link";
import { Bed, Bath, Ruler } from "lucide-react";
import { formatPrice } from "@/features/homepage/data";
import PropertyCoverImage from "@/features/properties/components/PropertyCoverImage";

export default function PropertyCard({ property }) {
	const hasBedsBaths = property.beds != null || property.baths != null;

	return (
		<li className="overflow-hidden rounded-3xl border border-theme-gray/15 bg-white shadow-lg transition-shadow hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.03]">
			<Link href={`/property/${property.slug}`}>
				<PropertyCoverImage
					slug={property.slug}
					seed={property.id}
					alt={`${property.name}${property.city ? ` in ${property.city}` : ""}`}
					badge={property.type}
				/>
			</Link>
			<div className="p-5">
				<div className="flex items-baseline justify-between gap-3">
					<h3 className="text-lg font-semibold text-theme-blue dark:text-white">
						<Link href={`/property/${property.slug}`} className="hover:underline">
							{property.name}
						</Link>
					</h3>
					<span className="whitespace-nowrap font-semibold text-theme-blue dark:text-theme-gold">
						{formatPrice(property.price)}
					</span>
				</div>
				{property.city ? <p className="mt-1 text-sm text-txt-muted dark:text-txt-muted-dark">{property.city}</p> : null}
				{hasBedsBaths ? (
					<div className="mt-4 flex gap-5 text-sm text-txt-secondary dark:text-txt-secondary-dark">
						{property.beds != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Bed className="h-4 w-4" aria-hidden="true" />
								{property.beds} bd
							</span>
						) : null}
						{property.baths != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Bath className="h-4 w-4" aria-hidden="true" />
								{property.baths} ba
							</span>
						) : null}
					</div>
				) : property.lotAreaSqm != null ? (
					<div className="mt-4 flex gap-5 text-sm text-txt-secondary dark:text-txt-secondary-dark">
						<span className="inline-flex items-center gap-1.5">
							<Ruler className="h-4 w-4" aria-hidden="true" />
							{property.lotAreaSqm.toLocaleString()} sqm lot
						</span>
					</div>
				) : null}
				<div className="mt-5 flex items-center justify-between gap-2 border-t border-theme-gray/15 pt-4 text-xs text-txt-muted dark:border-white/10 dark:text-txt-muted-dark">
					<span>
						Listed by{" "}
						{property.agent ? (
							<Link
								href={`/agents/${property.agent.id}`}
								className="font-semibold text-theme-blue hover:underline dark:text-white"
							>
								{property.agent.name}
							</Link>
						) : (
							<strong className="font-semibold text-theme-blue dark:text-white">ConeyRealty Team</strong>
						)}
					</span>
					<Link
						href={property.agent ? `/agents/${property.agent.id}` : "/#search"}
						className="text-sm font-semibold text-theme-blue hover:underline dark:text-theme-gold"
					>
						Contact for details →
					</Link>
				</div>
			</div>
		</li>
	);
}
