import Link from "next/link";
import { Bed, Bath, Car, Ruler } from "lucide-react";
import { formatPrice } from "@/features/homepage/data";
import PropertyCoverImage from "@/features/properties/components/PropertyCoverImage";
import Button from "@/components/ui/Button";

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
				<p className="text-2xl font-bold leading-tight text-theme-blue dark:text-theme-gold">
					{formatPrice(property.price)}
				</p>
				<h3 className="mt-1 text-sm font-semibold text-txt-secondary dark:text-txt-secondary-dark">
					<Link href={`/property/${property.slug}`} className="hover:underline">
						{property.name}
					</Link>
				</h3>
				{hasBedsBaths ? (
					<div className="mt-4 flex flex-wrap gap-5 text-sm text-txt-secondary dark:text-txt-secondary-dark">
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
						{property.carpark != null ? (
							<span className="inline-flex items-center gap-1.5">
								<Car className="h-4 w-4" aria-hidden="true" />
								{property.carpark} cp
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

				<Button
					href={`/schedule-viewing?property=${property.slug}`}
					variant="ghost"
					size="sm"
					shape="rounded"
					className="mt-3 w-full"
				>
					Schedule a viewing
				</Button>
			</div>
		</li>
	);
}
