import Link from "next/link";
import { Bed, Bath, Car, Ruler } from "lucide-react";
import { formatPrice } from "@/features/homepage/data";
import PropertyCoverImage from "@/features/properties/components/PropertyCoverImage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function PropertyCard({ property }) {
	const hasBedsBaths = property.beds != null || property.baths != null;

	return (
		<li className="overflow-hidden rounded-3xl border border-theme-gray/15 bg-white shadow-lg transition-shadow hover:shadow-2xl dark:border-border-dark dark:bg-surface-dark">
			<Link href={`/property/${property.slug}`}>
				<PropertyCoverImage
					imageUrl={property.imageUrl}
					seed={property.id}
					alt={`${property.name}${property.city ? ` in ${property.city}` : ""}`}
					badge={property.type}
				/>
			</Link>
			<div className="p-5">
				{property.isOnHold ? (
					<Badge tone="warning" className="mb-2">
						On Hold
					</Badge>
				) : null}
				<p className="text-2xl font-bold leading-tight text-theme-blue dark:text-theme-gold">
					{formatPrice(property.price)}
				</p>
				<h3 className="mt-1 text-lg font-semibold text-txt-secondary dark:text-txt-secondary-dark">
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
				<Button
					href={`/property/${property.slug}`}
					variant="ghost"
					size="sm"
					shape="rounded"
					className="mt-5 w-full"
				>
					View Property
				</Button>
			</div>
		</li>
	);
}
